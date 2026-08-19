import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { findStandard, listStandards } from "@/services/award-standard.service";
import type {
    AdminCandidate,
    EntryKind,
    AwardCandidate,
    AwardCategory,
    BallotCategory,
    BallotCompletion,
    CampaignCard,
    CandidateMember,
    CandidateResult,
    CategoryResult,
    DocumentedCategory,
    FinalistOption,
    LevelTurnout,
    MultiLeader,
    TimelinePoint,
} from "@/types/awards.types";

/**
 * Awards data access.
 *
 * One rule shapes this whole module: **the ballot query never selects a vote
 * count.** Results are hidden until an admin publishes them, and the safest way
 * to keep an unpublished tally from leaking is for the voter-facing path to
 * never have it in hand. Counting lives in `getCategoryResults`, which only the
 * admin action calls.
 *
 * A second rule joins it here: **a category with no documented criteria never
 * reaches a voter.** `getBallotCategories` resolves every category against
 * `award-standard.jsonrc` and drops the ones that don't match. That check is in
 * the query path rather than in a component, so no future page can render a
 * ballot that skipped it.
 */

type CategoryRow = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    sort_order: number;
    is_archived: boolean;
};

type MemberRow = {
    role: string | null;
    sort_order: number;
    fyb_registrations: {
        id: string;
        first_name: string;
        last_name: string;
        photo_url: string;
    } | null;
};

type CandidateRow = {
    id: string;
    category_id: string;
    registration_id: string | null;
    entry_kind: EntryKind;
    display_name: string | null;
    logo_url: string | null;
    nickname: string;
    sort_order: number;
    share_code: string;
    fyb_registrations: {
        first_name: string;
        last_name: string;
        email: string | null;
        level: string;
        unit: string | null;
        photo_url: string;
    } | null;
    fyb_award_candidate_members: MemberRow[] | null;
};

/**
 * Both embeds resolve to `fyb_registrations`, by two different foreign keys —
 * the candidate's own, and each member's. PostgREST refuses to guess between
 * them, so both are named by constraint. Renaming either FK breaks this string
 * and nothing else, which is the failure you want: loud and immediate.
 */
const CANDIDATE_COLUMNS =
    "id, category_id, registration_id, entry_kind, display_name, logo_url, nickname, sort_order, share_code, " +
    "fyb_registrations!fyb_award_candidates_registration_id_fkey(first_name, last_name, email, level, unit, photo_url), " +
    "fyb_award_candidate_members(role, sort_order, fyb_registrations!fyb_award_candidate_members_registration_id_fkey(id, first_name, last_name, photo_url))";

const CATEGORY_COLUMNS = "id, slug, title, description, sort_order, is_archived";

/** Named once so the select string and the nested `order` calls can't drift apart. */
const CANDIDATES = "fyb_award_candidates";

/** A category with its candidates already attached — see `getBallotCategories`. */
type BallotRow = CategoryRow & { fyb_award_candidates: CandidateRow[] };

const BALLOT_COLUMNS = `${CATEGORY_COLUMNS}, ${CANDIDATES}(${CANDIDATE_COLUMNS})`;

const toCategory = (row: CategoryRow): AwardCategory => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    isArchived: row.is_archived,
});

const toMembers = (row: CandidateRow): CandidateMember[] =>
    (row.fyb_award_candidate_members ?? [])
        .filter((member): member is MemberRow & {
            fyb_registrations: NonNullable<MemberRow["fyb_registrations"]>;
        } => Boolean(member.fyb_registrations))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((member) => ({
            registrationId: member.fyb_registrations.id,
            firstName: member.fyb_registrations.first_name,
            lastName: member.fyb_registrations.last_name,
            photoUrl: member.fyb_registrations.photo_url,
            role: member.role,
        }));

/**
 * A candidacy row as the ballot needs it, or null if the row cannot be rendered.
 *
 * Null is not defensive noise. An individual whose registration was deleted, or
 * a clique that somehow lost its name, would otherwise reach a rail as a blank
 * card that people can still vote for — a vote cast for nobody, in a poll whose
 * whole claim is that it is trustworthy. Better it simply isn't there.
 */
const toCandidate = (row: CandidateRow): AwardCandidate | null => {
    const base = {
        id: row.id,
        entryKind: row.entry_kind,
        nickname: row.nickname,
        members: toMembers(row),
        shareCode: row.share_code,
    };

    if (row.entry_kind === "individual") {
        const person = row.fyb_registrations;
        if (!person) return null;
        return {
            ...base,
            displayName: `${person.first_name} ${person.last_name}`,
            shortName: person.first_name,
            imageUrl: person.photo_url,
            registrationId: row.registration_id,
            level: person.level,
            unit: person.unit,
            // A person is not their own member list; `members` stays empty so
            // the card renderers can branch on it without a special case.
            members: [],
        };
    }

    const name = row.display_name?.trim();
    if (!name) return null;

    return {
        ...base,
        displayName: name,
        shortName: name,
        // A clique has no logo by design — its members' faces are the mark.
        imageUrl: row.entry_kind === "brand" ? (row.logo_url ?? "") : "",
        registrationId: null,
        level: null,
        unit: null,
    };
};

/** Drops the rows that couldn't be rendered. See `toCandidate`. */
const toCandidates = (rows: CandidateRow[]): AwardCandidate[] =>
    rows.map(toCandidate).filter((candidate): candidate is AwardCandidate => candidate !== null);

/**
 * Make sure every documented award has a category row.
 *
 * Categories are **derived from the standard, not created by hand**. The
 * jsonrc is the list of awards this fellowship recognises, so an award that is
 * in the file is on the ballot by default, and a committee that does not want
 * one archives it. That inverts the old flow — where a category could be
 * forgotten and simply never appear — into one where forgetting is impossible
 * and opting out is a deliberate, recorded act.
 *
 * Insert-only, and that matters twice over:
 *   • `is_archived` is never reset, so a committee's decision to drop an award
 *     survives every subsequent sync. Re-archiving it on each deploy would be
 *     the platform silently overruling the committee.
 *   • `title` and `description` are never overwritten, so an admin's wording
 *     for the ballot is not reverted to the file's on the next page load. The
 *     file supplies them once, at provisioning.
 *
 * `ignoreDuplicates` makes concurrent calls harmless: two requests arriving
 * together both insert, and the unique index on `slug` discards the loser.
 */
const ensureCategories = async (existing: Set<string>): Promise<boolean> => {
    const missing = listStandards().filter((standard) => !existing.has(standard.key));
    if (missing.length === 0) return false;

    const supabase = createServerSupabase();
    const { error } = await supabase.from("fyb_award_categories").upsert(
        missing.map((standard) => ({
            slug: standard.key,
            title: standard.title,
            description: standard.blurb,
            // File order is the intended ballot order. An admin who reorders
            // afterwards keeps their order; a later addition lands at the
            // position the standard gives it, which is the honest default.
            sort_order: listStandards().findIndex((s) => s.key === standard.key),
        })),
        { onConflict: "slug", ignoreDuplicates: true }
    );

    if (error) {
        console.error("ensureCategories failed:", error.message);
        return false;
    }
    return true;
};

/** Every category, newest sort order first. `includeArchived` is admin-only. */
export const getCategories = async (
    includeArchived = false
): Promise<AwardCategory[]> => {
    const supabase = createServerSupabase();

    const read = async (): Promise<CategoryRow[] | null> => {
        let query = supabase
            .from("fyb_award_categories")
            .select(CATEGORY_COLUMNS)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

        if (!includeArchived) query = query.eq("is_archived", false);

        const { data, error } = await query.returns<CategoryRow[]>();
        if (error) {
            console.error("getCategories failed:", error.message);
            return null;
        }
        return data ?? [];
    };

    const rows = await read();
    if (rows === null) return [];

    // Provisioning needs to know about archived rows too — an archived category
    // is present, and re-inserting it would resurrect an award the committee
    // deliberately dropped. So when this read filtered them out, ask the
    // database what slugs exist before deciding anything is missing.
    const known = includeArchived
        ? new Set(rows.map((row) => row.slug))
        : await getKnownSlugs();

    // A first-run or a post-reset database has no categories at all; a deploy
    // that adds an award has one fewer than the file. Either way the fix is the
    // same, and doing it here means no page has to remember to ask for it.
    if (!(await ensureCategories(known))) return rows.map(toCategory);

    const refreshed = await read();
    return (refreshed ?? rows).map(toCategory);
};

/** Every slug in the table, archived included — see `getCategories`. */
const getKnownSlugs = async (): Promise<Set<string>> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_award_categories")
        .select("slug")
        .returns<{ slug: string }[]>();

    if (error) {
        console.error("getKnownSlugs failed:", error.message);
        // Fail closed: an unknown answer must not be read as "nothing exists",
        // or a failed read becomes the reason archived awards come back.
        return new Set(listStandards().map((standard) => standard.key));
    }
    return new Set((data ?? []).map((row) => row.slug));
};

const getCandidateRows = async (categoryIds: string[]): Promise<CandidateRow[]> => {
    if (categoryIds.length === 0) return [];

    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_award_candidates")
        .select(CANDIDATE_COLUMNS)
        .in("category_id", categoryIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<CandidateRow[]>();

    if (error) {
        console.error("getCandidateRows failed:", error.message);
        return [];
    }
    return data ?? [];
};

/** Candidates for one category, with the email admin needs to recognise them. */
export const getAdminCandidates = async (
    categoryId: string
): Promise<AdminCandidate[]> => {
    const rows = await getCandidateRows([categoryId]);

    return rows.flatMap((row) => {
        const candidate = toCandidate(row);
        if (!candidate) return [];
        return [
            {
                ...candidate,
                categoryId: row.category_id,
                email: row.fyb_registrations?.email ?? null,
            },
        ];
    });
};

type FinalistRow = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    level: string;
    unit: string | null;
    photo_url: string;
};

const FINALIST_COLUMNS = "id, first_name, last_name, email, level, unit, photo_url";

/**
 * The dinner registration behind an email, annotated for one category.
 *
 * Returns null when the address belongs to no registration — the admin sees
 * that as "not a dinner profile" rather than discovering it on submit.
 */
export const findFinalistByEmail = async (
    categoryId: string,
    email: string
): Promise<FinalistOption | null> => {
    const supabase = createServerSupabase();

    const { data: row, error } = await supabase
        .from("fyb_registrations")
        .select(FINALIST_COLUMNS)
        .ilike("email", email.trim())
        .maybeSingle<FinalistRow>();

    if (error) console.error("findFinalistByEmail failed:", error.message);
    if (!row) return null;

    // Which of their candidacies are in this category, and how many elsewhere.
    //
    // Both halves matter: standing as an individual, and being named inside a
    // clique or behind a brand. "One win per person" is a rule about people, so
    // a founder whose brand is already up in this category is already standing
    // here — counting only the direct rows would hide exactly that case.
    const [direct, viaGroup] = await Promise.all([
        supabase
            .from("fyb_award_candidates")
            .select("category_id")
            .eq("registration_id", row.id)
            .returns<{ category_id: string }[]>(),
        supabase
            .from("fyb_award_candidate_members")
            .select("fyb_award_candidates!inner(category_id)")
            .eq("registration_id", row.id)
            .returns<{ fyb_award_candidates: { category_id: string } | null }[]>(),
    ]);

    const all = [
        ...(direct.data ?? []),
        ...(viaGroup.data ?? [])
            .map((entry) => entry.fyb_award_candidates)
            .filter((entry): entry is { category_id: string } => entry !== null),
    ];

    return {
        registrationId: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        level: row.level,
        unit: row.unit,
        photoUrl: row.photo_url,
        standing: all.some((c) => c.category_id === categoryId),
        otherCategories: all.filter((c) => c.category_id !== categoryId).length,
    };
};

/**
 * The ballot for one voter: live categories, their candidates, and this voter's
 * existing pick per category. No counts — see the module note.
 */
export const getBallotCategories = async (
    voterProfileId: string
): Promise<BallotCategory[]> => {
    const supabase = createServerSupabase();

    // Categories and their candidates come back nested, in one trip. Reading
    // them separately meant waiting for the category ids before the candidate
    // query could even be sent, and a round trip to Supabase is the most
    // expensive thing this page does — several hundred milliseconds when the
    // database is a continent away, against microseconds of work at either end.
    const [categoriesRes, votesRes] = await Promise.all([
        supabase
            .from("fyb_award_categories")
            .select(BALLOT_COLUMNS)
            .eq("is_archived", false)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true })
            .order("sort_order", { referencedTable: CANDIDATES, ascending: true })
            .order("created_at", { referencedTable: CANDIDATES, ascending: true })
            .returns<BallotRow[]>(),
        // Unfiltered by category on purpose: this voter holds at most one vote
        // per category, so the result is a handful of rows either way, and
        // filtering would have cost us the parallelism we just bought. Votes in
        // archived categories are simply never looked up below.
        supabase
            .from("fyb_award_votes")
            .select("category_id, candidate_id")
            .eq("voter_profile_id", voterProfileId)
            .returns<{ category_id: string; candidate_id: string }[]>(),
    ]);

    if (categoriesRes.error) {
        console.error("ballot read failed:", categoriesRes.error.message);
        return [];
    }
    if (votesRes.error) console.error("ballot votes read failed:", votesRes.error.message);

    const myVotes = new Map(
        (votesRes.data ?? []).map((v) => [v.category_id, v.candidate_id])
    );

    // The enforcement gate, on the only path a voter can reach. A category whose
    // slug matches no entry in `award-standard.jsonrc` is not on this ballot —
    // not greyed out, not shown with a warning, simply absent. Someone voting on
    // an award with no published criteria is the exact thing the standard was
    // written to prevent, and the admin dashboard flags the gap loudly enough
    // that it will not go unnoticed.
    return (categoriesRes.data ?? []).flatMap((row) => {
        const standard = findStandard(row.slug);
        if (!standard) return [];

        return [
            {
                ...toCategory(row),
                standard,
                candidates: toCandidates(row.fyb_award_candidates ?? []),
                myVoteCandidateId: myVotes.get(row.id) ?? null,
            },
        ];
    });
};

/** Every category with its criteria attached — admin-side, keeps the gaps. */
export const getDocumentedCategories = async (
    includeArchived = false
): Promise<DocumentedCategory[]> => {
    const categories = await getCategories(includeArchived);
    return categories.map((category) => ({
        ...category,
        standard: findStandard(category.slug),
    }));
};

/**
 * Record a vote, or move an existing one.
 *
 * The upsert rides on `(category_id, voter_profile_id)` — the unique constraint
 * from the migration — which is what makes "changed my mind" and "double-clicked
 * submit" the same write. Two concurrent votes cannot both land.
 */
export const upsertVote = async (input: {
    categoryId: string;
    candidateId: string;
    voterProfileId: string;
}): Promise<{ success: boolean; message?: string }> => {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("fyb_award_votes").upsert(
        {
            category_id: input.categoryId,
            candidate_id: input.candidateId,
            voter_profile_id: input.voterProfileId,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "category_id,voter_profile_id" }
    );

    if (error) {
        console.error("upsertVote failed:", error.message);
        return { success: false, message: "Could not record your vote." };
    }
    return { success: true };
};

/** Whether a candidate is actually standing in the category claimed. */
export const candidateBelongsToCategory = async (
    candidateId: string,
    categoryId: string
): Promise<boolean> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_award_candidates")
        .select("id")
        .eq("id", candidateId)
        .eq("category_id", categoryId)
        .maybeSingle<{ id: string }>();

    return Boolean(data);
};

type TallyRow = { candidate_id: string; category_id: string; votes: number };

const tallyCategory = (
    category: AwardCategory,
    candidates: AwardCandidate[],
    counts: Map<string, number>,
    votesCast: number
): CategoryResult => {
    const top = Math.max(0, ...candidates.map((c) => counts.get(c.id) ?? 0));
    // A tie has no leader. Crowning whoever sorts first would be a lie the UI
    // then repeats confidently, which is worse than showing a level race.
    const tied = candidates.filter((c) => (counts.get(c.id) ?? 0) === top).length > 1;

    const results: CandidateResult[] = candidates
        .map((candidate) => {
            const votesFor = counts.get(candidate.id) ?? 0;
            return {
                candidateId: candidate.id,
                entryKind: candidate.entryKind,
                displayName: candidate.displayName,
                nickname: candidate.nickname,
                imageUrl: candidate.imageUrl,
                members: candidate.members,
                votes: votesFor,
                share:
                    votesCast === 0
                        ? 0
                        : Math.round((votesFor / votesCast) * 1000) / 10,
                isLeader: votesFor === top && top > 0 && !tied,
            };
        })
        .sort((a, b) => b.votes - a.votes || a.displayName.localeCompare(b.displayName));

    return {
        categoryId: category.id,
        title: category.title,
        votesCast,
        // Zero when nobody has voted, and zero on a tie — both mean "this one
        // is still anybody's", which is what the close-races panel looks for.
        margin: results.length < 2 ? results[0]?.votes ?? 0 : results[0].votes - results[1].votes,
        candidates: results,
    };
};

/**
 * Full tally, every category. Admin-only — never call this from the ballot.
 *
 * Counts come from `fyb_award_tally` and `fyb_award_category_totals` rather
 * than from the vote rows themselves. Reading the raw rows would mean pulling
 * one per vote through a REST call that Supabase caps at 1000 by default, and a
 * truncated tally is worse than no tally — it looks right.
 */
export const getCategoryResults = async (): Promise<{
    results: CategoryResult[];
    voters: number;
    totalVotes: number;
    candidateCount: number;
    multiLeaders: MultiLeader[];
}> => {
    const categories = await getCategories(true);
    if (categories.length === 0) {
        return { results: [], voters: 0, totalVotes: 0, candidateCount: 0, multiLeaders: [] };
    }

    const supabase = createServerSupabase();
    const [rows, tallyRes, totalsRes, turnoutRes] = await Promise.all([
        getCandidateRows(categories.map((c) => c.id)),
        supabase
            .from("fyb_award_tally")
            .select("candidate_id, category_id, votes")
            .returns<TallyRow[]>(),
        supabase
            .from("fyb_award_category_totals")
            .select("category_id, votes_cast")
            .returns<{ category_id: string; votes_cast: number }[]>(),
        supabase
            .from("fyb_award_turnout")
            .select("voters, total_votes")
            .maybeSingle<{ voters: number; total_votes: number }>(),
    ]);

    if (tallyRes.error) console.error("tally read failed:", tallyRes.error.message);
    if (totalsRes.error) console.error("category totals read failed:", totalsRes.error.message);

    const counts = new Map((tallyRes.data ?? []).map((row) => [row.candidate_id, row.votes]));
    const castByCategory = new Map(
        (totalsRes.data ?? []).map((row) => [row.category_id, row.votes_cast])
    );

    const candidatesByCategory = new Map<string, AwardCandidate[]>();
    for (const row of rows) {
        const candidate = toCandidate(row);
        if (!candidate) continue;
        const list = candidatesByCategory.get(row.category_id) ?? [];
        list.push(candidate);
        candidatesByCategory.set(row.category_id, list);
    }

    const results = categories.map((category) =>
        tallyCategory(
            category,
            candidatesByCategory.get(category.id) ?? [],
            counts,
            castByCategory.get(category.id) ?? 0
        )
    );

    // Who is leading more than one category. With 30+ candidates spread over
    // 10+ categories the same faces recur, and "Ada is winning three" is the
    // story the organizers actually want to know before the night — it is how
    // "one win per person" gets enforced before the envelopes are printed
    // rather than discovered at the podium.
    //
    // Attribution reaches through group entries: if a brand is leading, each of
    // its founders is leading, because a brand award is still a person walking
    // up to collect it.
    const leaderCategories = new Map<
        string,
        { person: CandidateMember; titles: string[] }
    >();

    const creditLeader = (person: CandidateMember, title: string): void => {
        const entry = leaderCategories.get(person.registrationId) ?? { person, titles: [] };
        // A person named twice behind one entry (founder and co-founder of the
        // same brand) must not read as leading two categories.
        if (!entry.titles.includes(title)) entry.titles.push(title);
        leaderCategories.set(person.registrationId, entry);
    };

    const peopleByCandidateId = new Map<string, CandidateMember[]>();
    for (const row of rows) {
        const candidate = toCandidate(row);
        if (!candidate) continue;

        if (candidate.entryKind === "individual" && candidate.registrationId) {
            const person = row.fyb_registrations;
            if (!person) continue;
            peopleByCandidateId.set(candidate.id, [
                {
                    registrationId: candidate.registrationId,
                    firstName: person.first_name,
                    lastName: person.last_name,
                    photoUrl: person.photo_url,
                    role: null,
                },
            ]);
            continue;
        }
        peopleByCandidateId.set(candidate.id, candidate.members);
    }

    for (const result of results) {
        const leader = result.candidates.find((c) => c.isLeader);
        if (!leader) continue;

        for (const person of peopleByCandidateId.get(leader.candidateId) ?? []) {
            creditLeader(person, result.title);
        }
    }

    const multiLeaders: MultiLeader[] = [...leaderCategories.values()]
        .filter((entry) => entry.titles.length > 1)
        .map((entry) => ({
            registrationId: entry.person.registrationId,
            firstName: entry.person.firstName,
            lastName: entry.person.lastName,
            photoUrl: entry.person.photoUrl,
            categories: entry.titles,
        }))
        .sort((a, b) => b.categories.length - a.categories.length);

    return {
        results,
        voters: turnoutRes.data?.voters ?? 0,
        totalVotes: turnoutRes.data?.total_votes ?? 0,
        candidateCount: rows.length,
        multiLeaders,
    };
};

type CampaignRow = CandidateRow & {
    fyb_award_categories: {
        title: string;
        description: string | null;
        slug: string;
        is_archived: boolean;
    } | null;
};

/**
 * A candidate's campaign card, by share code.
 *
 * This is the one awards read that answers to an anonymous request, so it is
 * deliberately narrow: name, nickname, photo, category. No vote count, no
 * standing, no email, and nothing about who has voted. An archived category
 * returns null — a link to a race that is off the ballot should 404, not show
 * a vote button that goes nowhere.
 */
export const getCampaignCard = async (
    shareCode: string,
    votingOpen: boolean
): Promise<CampaignCard | null> => {
    const code = shareCode?.trim().toUpperCase();
    if (!code || !/^[A-Z0-9]{4,10}$/.test(code)) return null;

    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_award_candidates")
        .select(
            `${CANDIDATE_COLUMNS}, fyb_award_categories(title, description, slug, is_archived)`
        )
        .eq("share_code", code)
        .maybeSingle<CampaignRow>();

    if (error) console.error("getCampaignCard failed:", error.message);
    if (!data?.fyb_award_categories) return null;
    if (data.fyb_award_categories.is_archived) return null;

    // A campaign link into an award with no published criteria would be an
    // invitation to vote on nothing — the ballot drops those categories, so the
    // link that leads to one must 404 rather than land on a dead rail.
    if (!findStandard(data.fyb_award_categories.slug)) return null;

    const candidate = toCandidate(data);
    if (!candidate) return null;

    return {
        candidateId: candidate.id,
        shareCode: candidate.shareCode,
        entryKind: candidate.entryKind,
        displayName: candidate.displayName,
        shortName: candidate.shortName,
        nickname: candidate.nickname,
        imageUrl: candidate.imageUrl,
        members: candidate.members,
        categoryTitle: data.fyb_award_categories.title,
        categoryDescription: data.fyb_award_categories.description,
        categorySlug: data.fyb_award_categories.slug,
        votingOpen,
    };
};

/** Voters grouped by level, from the `fyb_award_voter_levels` view. */
export const getLevelTurnout = async (): Promise<LevelTurnout[]> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_award_voter_levels")
        .select("level, voters")
        .returns<LevelTurnout[]>();

    if (error) {
        console.error("getLevelTurnout failed:", error.message);
        return [];
    }
    return (data ?? []).sort((a, b) => b.voters - a.voters);
};

/** Votes per day, most recent `days` first-to-last. */
export const getVoteTimeline = async (days = 14): Promise<TimelinePoint[]> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_award_timeline")
        .select("day, votes")
        .order("day", { ascending: false })
        .limit(days)
        .returns<TimelinePoint[]>();

    if (error) {
        console.error("getVoteTimeline failed:", error.message);
        return [];
    }
    return (data ?? []).reverse();
};

/**
 * How far voters get down the ballot. `liveCategories` is what "finished all"
 * is measured against — archived categories were never on anyone's ballot.
 */
export const getBallotCompletion = async (
    liveCategories: number
): Promise<BallotCompletion> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_award_completion")
        .select("voted_categories, voters")
        .returns<{ voted_categories: number; voters: number }[]>();

    if (error) {
        console.error("getBallotCompletion failed:", error.message);
        return { averageVoted: 0, finishedAll: 0, votedOnce: 0 };
    }

    const rows = data ?? [];
    const voters = rows.reduce((sum, row) => sum + row.voters, 0);
    const votes = rows.reduce((sum, row) => sum + row.voted_categories * row.voters, 0);

    return {
        averageVoted: voters === 0 ? 0 : Math.round((votes / voters) * 10) / 10,
        finishedAll:
            liveCategories === 0
                ? 0
                : rows
                      .filter((row) => row.voted_categories >= liveCategories)
                      .reduce((sum, row) => sum + row.voters, 0),
        votedOnce: rows.find((row) => row.voted_categories === 1)?.voters ?? 0,
    };
};

/**
 * Candidates standing in a category that is actually on the ballot.
 *
 * This is the number that decides whether voting may be open at all. Two things
 * disqualify a category from counting: being archived, and having no documented
 * criteria. The second can't be expressed in SQL — the standard lives in a file,
 * not a table — so the filter happens here, over the live category list, rather
 * than in the query. The cost is one extra round trip; the alternative is a
 * count that says "plenty" about a ballot nobody can legitimately vote on.
 */
export const countVotableCandidates = async (): Promise<number> => {
    const live = (await getCategories()).filter((category) => findStandard(category.slug));
    if (live.length === 0) return 0;

    const supabase = createServerSupabase();
    const { count, error } = await supabase
        .from("fyb_award_candidates")
        .select("id", { count: "exact", head: true })
        .in(
            "category_id",
            live.map((category) => category.id)
        );

    if (error) {
        console.error("countVotableCandidates failed:", error.message);
        // Fail closed: an unknown count must not be read as "plenty", or a
        // failed query becomes the reason an empty ballot goes live.
        return 0;
    }
    return count ?? 0;
};

/** How many members could vote at all — the denominator for turnout. */
export const countEligibleVoters = async (): Promise<number> => {
    const supabase = createServerSupabase();
    const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

    if (error) {
        console.error("countEligibleVoters failed:", error.message);
        return 0;
    }
    return count ?? 0;
};
