import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
    AdminCandidate,
    AwardCandidate,
    AwardCategory,
    BallotCategory,
    BallotCompletion,
    CampaignCard,
    CandidateResult,
    CategoryResult,
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
 */

type CategoryRow = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    sort_order: number;
    is_archived: boolean;
};

type CandidateRow = {
    id: string;
    category_id: string;
    registration_id: string;
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
};

const CANDIDATE_COLUMNS =
    "id, category_id, registration_id, nickname, sort_order, share_code, fyb_registrations(first_name, last_name, email, level, unit, photo_url)";

const toCategory = (row: CategoryRow): AwardCategory => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    isArchived: row.is_archived,
});

/** Null-registration rows can't exist (FK + cascade), but TS doesn't know that. */
const hasRegistration = (
    row: CandidateRow
): row is CandidateRow & { fyb_registrations: NonNullable<CandidateRow["fyb_registrations"]> } =>
    Boolean(row.fyb_registrations);

const toCandidate = (
    row: CandidateRow & { fyb_registrations: NonNullable<CandidateRow["fyb_registrations"]> }
): AwardCandidate => ({
    id: row.id,
    registrationId: row.registration_id,
    firstName: row.fyb_registrations.first_name,
    lastName: row.fyb_registrations.last_name,
    nickname: row.nickname,
    photoUrl: row.fyb_registrations.photo_url,
    level: row.fyb_registrations.level,
    unit: row.fyb_registrations.unit,
    shareCode: row.share_code,
});

/** Every category, newest sort order first. `includeArchived` is admin-only. */
export const getCategories = async (
    includeArchived = false
): Promise<AwardCategory[]> => {
    const supabase = createServerSupabase();
    let query = supabase
        .from("fyb_award_categories")
        .select("id, slug, title, description, sort_order, is_archived")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (!includeArchived) query = query.eq("is_archived", false);

    const { data, error } = await query.returns<CategoryRow[]>();
    if (error) {
        console.error("getCategories failed:", error.message);
        return [];
    }
    return (data ?? []).map(toCategory);
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
    return rows.filter(hasRegistration).map((row) => ({
        ...toCandidate(row),
        categoryId: row.category_id,
        email: row.fyb_registrations.email,
    }));
};

/**
 * The ballot for one voter: live categories, their candidates, and this voter's
 * existing pick per category. No counts — see the module note.
 */
export const getBallotCategories = async (
    voterProfileId: string
): Promise<BallotCategory[]> => {
    const categories = await getCategories();
    if (categories.length === 0) return [];

    const ids = categories.map((c) => c.id);
    const supabase = createServerSupabase();

    const [rows, votesRes] = await Promise.all([
        getCandidateRows(ids),
        supabase
            .from("fyb_award_votes")
            .select("category_id, candidate_id")
            .eq("voter_profile_id", voterProfileId)
            .in("category_id", ids)
            .returns<{ category_id: string; candidate_id: string }[]>(),
    ]);

    if (votesRes.error) console.error("ballot votes read failed:", votesRes.error.message);

    const myVotes = new Map(
        (votesRes.data ?? []).map((v) => [v.category_id, v.candidate_id])
    );

    const byCategory = new Map<string, AwardCandidate[]>();
    for (const row of rows.filter(hasRegistration)) {
        const list = byCategory.get(row.category_id) ?? [];
        list.push(toCandidate(row));
        byCategory.set(row.category_id, list);
    }

    return categories.map((category) => ({
        ...category,
        candidates: byCategory.get(category.id) ?? [],
        myVoteCandidateId: myVotes.get(category.id) ?? null,
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
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                nickname: candidate.nickname,
                photoUrl: candidate.photoUrl,
                votes: votesFor,
                share:
                    votesCast === 0
                        ? 0
                        : Math.round((votesFor / votesCast) * 1000) / 10,
                isLeader: votesFor === top && top > 0 && !tied,
            };
        })
        .sort((a, b) => b.votes - a.votes || a.firstName.localeCompare(b.firstName));

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
    for (const row of rows.filter(hasRegistration)) {
        const list = candidatesByCategory.get(row.category_id) ?? [];
        list.push(toCandidate(row));
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
    // story the organizers actually want to know before the night.
    const registrationByCandidateId = new Map(
        rows.filter(hasRegistration).map((row) => [row.id, toCandidate(row)])
    );
    const leaderCategories = new Map<string, { candidate: AwardCandidate; titles: string[] }>();

    for (const result of results) {
        const leader = result.candidates.find((c) => c.isLeader);
        if (!leader) continue;

        const candidate = registrationByCandidateId.get(leader.candidateId);
        if (!candidate) continue;

        const entry = leaderCategories.get(candidate.registrationId) ?? {
            candidate,
            titles: [],
        };
        entry.titles.push(result.title);
        leaderCategories.set(candidate.registrationId, entry);
    }

    const multiLeaders: MultiLeader[] = [...leaderCategories.values()]
        .filter((entry) => entry.titles.length > 1)
        .map((entry) => ({
            registrationId: entry.candidate.registrationId,
            firstName: entry.candidate.firstName,
            lastName: entry.candidate.lastName,
            photoUrl: entry.candidate.photoUrl,
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

type CampaignRow = {
    id: string;
    nickname: string;
    share_code: string;
    fyb_registrations: { first_name: string; last_name: string; photo_url: string } | null;
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
            "id, nickname, share_code, fyb_registrations(first_name, last_name, photo_url), fyb_award_categories(title, description, slug, is_archived)"
        )
        .eq("share_code", code)
        .maybeSingle<CampaignRow>();

    if (error) console.error("getCampaignCard failed:", error.message);
    if (!data?.fyb_registrations || !data.fyb_award_categories) return null;
    if (data.fyb_award_categories.is_archived) return null;

    return {
        candidateId: data.id,
        shareCode: data.share_code,
        firstName: data.fyb_registrations.first_name,
        lastName: data.fyb_registrations.last_name,
        nickname: data.nickname,
        photoUrl: data.fyb_registrations.photo_url,
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
 * This is the number that decides whether voting may be open at all: archived
 * categories don't count, because nobody can vote in them. Zero here means the
 * awards page would be a stack of empty rails.
 */
export const countVotableCandidates = async (): Promise<number> => {
    const supabase = createServerSupabase();
    const { count, error } = await supabase
        .from("fyb_award_candidates")
        .select("id, fyb_award_categories!inner(is_archived)", {
            count: "exact",
            head: true,
        })
        .eq("fyb_award_categories.is_archived", false);

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
