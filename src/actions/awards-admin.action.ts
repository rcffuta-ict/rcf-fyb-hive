"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdmin } from "@/actions/admin.action";
import { createServerSupabase } from "@/lib/supabase/server";
import {
    countEligibleVoters,
    countVotableCandidates,
    getAdminCandidates,
    getBallotCompletion,
    getCategories,
    getCategoryResults,
    getDocumentedCategories,
    getLevelTurnout,
    getVoteTimeline,
    findFinalistByEmail,
} from "@/services/awards.service";
import { isRenderableLogoUrl } from "@/constants/brand-logo";
import { hasConsentToken } from "@/services/consent.service";
import { getSettings, updateSetting } from "@/services/settings.service";
import type {
    AdminCandidate,
    AwardSettings,
    AwardStats,
    DocumentedCategory,
    FinalistOption,
} from "@/types/awards.types";

/**
 * Awards — the admin half: curating categories, standing candidates, and the
 * tally. Everything here re-checks `getCurrentAdmin()`; a Server Action is a
 * public endpoint, and these read the numbers nobody else is allowed to see yet.
 */

export type AwardActionResult = { ok: boolean; message: string };

const denied: AwardActionResult = { ok: false, message: "Not authorized." };

/**
 * Close voting if the ballot has just been emptied.
 *
 * Called after anything that can remove the last candidate — deleting or
 * archiving a category, removing a candidate. Voting left open over an empty
 * ballot would send every member to a page of empty rails, so the flag follows
 * reality rather than waiting for an admin to notice. Returns a sentence to
 * append to the action's own message, or "" when nothing changed.
 */
const closeVotingIfEmpty = async (by: string): Promise<string> => {
    const { awardsEnabled } = await getSettings();
    if (!awardsEnabled) return "";
    if ((await countVotableCandidates()) > 0) return "";

    const result = await updateSetting("awards_enabled", false, by);
    if (!result.success) return "";

    revalidatePath("/", "layout");
    return " Voting was closed automatically — no candidates are left on the ballot.";
};

export async function listCategories(): Promise<DocumentedCategory[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return getDocumentedCategories(true);
}

/**
 * Categories are not created here, and there is no picker any more.
 *
 * The jsonrc is the list of awards the fellowship recognises, so every award in
 * it gets a category automatically — `getCategories` provisions the missing
 * rows. An award the committee does not want to run this year is **archived**,
 * which is a recorded decision that survives every later sync, rather than a
 * category somebody simply never got round to creating.
 */
export async function updateCategory(input: {
    id: string;
    title: string;
    description: string;
    isArchived: boolean;
}): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const title = input.title?.trim();
    if (!title) return { ok: false, message: "Give the category a title." };

    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_award_categories")
        .update({
            title,
            description: input.description?.trim() || null,
            is_archived: input.isArchived,
        })
        .eq("id", input.id);

    if (error) {
        console.error("updateCategory failed:", error.message);
        return { ok: false, message: "Could not save the category." };
    }

    // Archiving can take the last live category — and with it, every candidate.
    const closed = input.isArchived
        ? await closeVotingIfEmpty(admin.email ?? admin.profileId)
        : "";

    revalidatePath("/awards");
    return { ok: true, message: `Saved.${closed}` };
}

/**
 * Swap a category with its neighbour. Two writes rather than a re-index of the
 * whole list, so a failure can't scramble an order that was fine.
 */
export async function moveCategory(
    id: string,
    direction: "up" | "down"
): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const categories = await getCategories(true);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return { ok: false, message: "That category no longer exists." };

    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= categories.length) return { ok: true, message: "" };

    const supabase = createServerSupabase();
    const a = categories[index];
    const b = categories[swapWith];

    const [first, second] = await Promise.all([
        supabase
            .from("fyb_award_categories")
            .update({ sort_order: b.sortOrder })
            .eq("id", a.id),
        supabase
            .from("fyb_award_categories")
            .update({ sort_order: a.sortOrder })
            .eq("id", b.id),
    ]);

    if (first.error || second.error) {
        console.error("moveCategory failed:", first.error?.message ?? second.error?.message);
        return { ok: false, message: "Could not reorder." };
    }

    revalidatePath("/awards");
    return { ok: true, message: "" };
}

/**
 * There is deliberately no `deleteCategory`.
 *
 * Deleting one would achieve nothing: the category is derived from the
 * standard, so the next page load would provision it straight back — but its
 * nominees and their votes would be gone for good. Archiving is the operation
 * that actually expresses "we are not running this award", and it keeps the
 * votes. Removing an award entirely means removing it from the jsonrc.
 */

// ─── Candidates ─────────────────────────────────────────────────────────────

export async function listCandidates(categoryId: string): Promise<AdminCandidate[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return getAdminCandidates(categoryId);
}

type NamedRegistration = { id: string; first_name: string; last_name: string };

/**
 * Put one resolved registration on a category's ballot.
 *
 * Shared by the picker, the email form and the bulk paste, so all three agree
 * on ordering, duplicate handling and the wording of the result.
 */
const standCandidate = async (
    categoryId: string,
    registration: NamedRegistration,
    nickname: string
): Promise<AwardActionResult> => {
    // A candidacy is a registered finalist holding a consent token. Checked
    // here rather than at each caller so the picker, the email form and the
    // bulk paste cannot disagree about who is eligible to stand.
    if (!(await hasConsentToken(registration.id))) {
        return {
            ok: false,
            message: `${registration.first_name} registered but has no consent token yet — resend it from Registrations first.`,
        };
    }

    const supabase = createServerSupabase();

    const { data: last } = await supabase
        .from("fyb_award_candidates")
        .select("sort_order")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();

    const { error } = await supabase.from("fyb_award_candidates").insert({
        category_id: categoryId,
        entry_kind: "individual",
        registration_id: registration.id,
        nickname,
        sort_order: (last?.sort_order ?? 0) + 1,
    });

    if (error) {
        if (error.code === "23505") {
            return {
                ok: false,
                message: `${registration.first_name} is already standing in this category.`,
            };
        }
        console.error("standCandidate failed:", error.message);
        return { ok: false, message: "Could not add the candidate." };
    }

    revalidatePath("/awards");
    return { ok: true, message: `${registration.first_name} ${registration.last_name} added.` };
};

/**
 * Stand a finalist in a category by their dinner email.
 *
 * The email must belong to a `fyb_registrations` row — the finalists who
 * registered and hold consent tokens. A member who never registered has no
 * photo and no snapshot, so there is nothing to put on a card. Kept for the
 * bulk paste; the picker below is what admins use one at a time.
 */
export async function addCandidate(input: {
    categoryId: string;
    email: string;
    nickname: string;
}): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const email = input.email?.trim().toLowerCase();
    const nickname = input.nickname?.trim();
    if (!email) return { ok: false, message: "Enter the finalist's email." };
    if (!nickname) return { ok: false, message: "Give them a nickname for this category." };

    const supabase = createServerSupabase();
    const { data: registration } = await supabase
        .from("fyb_registrations")
        .select("id, first_name, last_name")
        .ilike("email", email)
        .maybeSingle<NamedRegistration>();

    if (!registration) {
        return {
            ok: false,
            message: `No dinner registration for ${email} — only registered finalists can stand.`,
        };
    }

    return standCandidate(input.categoryId, registration, nickname);
}

export type FinalistLookup =
    | { status: "ok"; finalist: FinalistOption }
    | { status: "standing"; finalist: FinalistOption }
    | { status: "no_token"; finalist: FinalistOption; message: string }
    | { status: "not_found"; message: string };

/**
 * Whether this email may stand in this category, and who it belongs to.
 *
 * The single verdict shared by the one-at-a-time form and the bulk paste, so
 * the two can never disagree about who is eligible. Unauthenticated on purpose
 * — it is not exported; every caller is behind its own admin check.
 */
const verifyFinalist = async (
    categoryId: string,
    email: string
): Promise<FinalistLookup> => {
    const value = email?.trim();
    if (!value) return { status: "not_found", message: "" };

    const finalist = await findFinalistByEmail(categoryId, value);
    if (!finalist) {
        return {
            status: "not_found",
            message: `No dinner registration for ${value} — only finalists who registered can stand.`,
        };
    }
    if (finalist.standing) return { status: "standing", finalist };

    if (!(await hasConsentToken(finalist.registrationId))) {
        return {
            status: "no_token",
            finalist,
            message: `${finalist.firstName} has no consent token yet — resend it from Registrations first.`,
        };
    }

    return { status: "ok", finalist };
};

/**
 * Check an email before anyone commits to it.
 *
 * The admin types the address they were given; this says whose it is, with the
 * photo, so a typo is caught by not recognising the face rather than by a
 * stranger appearing on the ballot.
 */
export async function lookupFinalist(
    categoryId: string,
    email: string
): Promise<FinalistLookup> {
    const admin = await getCurrentAdmin();
    if (!admin) return { status: "not_found", message: "Not authorized." };

    return verifyFinalist(categoryId, email);
}

/** Stand the finalist the email resolved to — the id can't be mistyped. */
export async function addCandidateById(input: {
    categoryId: string;
    registrationId: string;
    nickname: string;
}): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const nickname = input.nickname?.trim();
    if (!nickname) return { ok: false, message: "Give them a nickname for this category." };

    const supabase = createServerSupabase();
    const { data: registration } = await supabase
        .from("fyb_registrations")
        .select("id, first_name, last_name")
        .eq("id", input.registrationId)
        .maybeSingle<NamedRegistration>();

    if (!registration) {
        return { ok: false, message: "That registration no longer exists." };
    }

    return standCandidate(input.categoryId, registration, nickname);
}

/** A line the paste couldn't use, quoted back so admin can find it. */
export type BulkProblem = {
    /** 1-based, counting only non-blank lines — matches what admin sees. */
    line: number;
    text: string;
    reason: string;
};

export type BulkAddResult =
    | { ok: true; added: number }
    | { ok: false; problems: BulkProblem[] };

/** Deliberately loose: Postgres and the registrations table are the real check. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ParsedLine = { line: number; text: string; email: string; nickname: string };

/**
 * Split `email, nickname` lines. The nickname may itself contain commas
 * ("Ada, The Encourager" is a plausible thing to type), so only the first
 * separator counts and the rest of the line is the nickname.
 */
const parseBulkLines = (raw: string): ParsedLine[] =>
    raw
        .split("\n")
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text, index) => {
            const cut = text.search(/[,\t]/);
            const email = (cut === -1 ? text : text.slice(0, cut)).trim().toLowerCase();
            const nickname = cut === -1 ? "" : text.slice(cut + 1).trim();
            return {
                line: index + 1,
                text,
                email,
                // A missing nickname is a typo, not a default worth inventing —
                // "ada" is nobody's award title. Reported below rather than used.
                nickname,
            };
        });

/**
 * Paste a block of `email, nickname` lines.
 *
 * **Nothing is written until every line checks out.** A nomination sheet is
 * pasted once and then trusted; the old behaviour added the good lines and
 * reported the rest, which left the category half-populated and the admin
 * re-pasting a corrected sheet on top of it — at which point the lines that did
 * work come back as "already standing" and the real failures are lost in the
 * noise. Verify everything, then insert everything, or change nothing.
 */
export async function addCandidatesBulk(
    categoryId: string,
    raw: string
): Promise<BulkAddResult> {
    const admin = await getCurrentAdmin();
    if (!admin) {
        return { ok: false, problems: [{ line: 0, text: "", reason: "Not authorized." }] };
    }

    const parsed = parseBulkLines(raw);
    if (parsed.length === 0) {
        return { ok: false, problems: [{ line: 0, text: "", reason: "Nothing to add." }] };
    }

    const problems: BulkProblem[] = [];
    const resolved: { registrationId: string; nickname: string }[] = [];
    const seen = new Map<string, number>();

    for (const entry of parsed) {
        const fail = (reason: string): void => {
            problems.push({ line: entry.line, text: entry.text, reason });
        };

        if (!EMAIL.test(entry.email)) {
            fail("Doesn't look like an email address.");
            continue;
        }
        if (!entry.nickname) {
            fail("No nickname — add one after a comma.");
            continue;
        }

        // Caught here rather than by the unique index, which would only fire
        // once the batch was already halfway in.
        const earlier = seen.get(entry.email);
        if (earlier) {
            fail(`Same email as line ${earlier}.`);
            continue;
        }
        seen.set(entry.email, entry.line);

        const verdict = await verifyFinalist(categoryId, entry.email);
        if (verdict.status !== "ok") {
            fail(verdict.status === "standing" ? "Already standing here." : verdict.message);
            continue;
        }

        resolved.push({
            registrationId: verdict.finalist.registrationId,
            nickname: entry.nickname,
        });
    }

    if (problems.length > 0) return { ok: false, problems };

    const supabase = createServerSupabase();

    const { data: last } = await supabase
        .from("fyb_award_candidates")
        .select("sort_order")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();

    const base = last?.sort_order ?? 0;

    // One statement, so the unique index can still make it all-or-nothing if
    // someone stood one of these people while the sheet was being verified.
    const { error } = await supabase.from("fyb_award_candidates").insert(
        resolved.map((row, index) => ({
            category_id: categoryId,
            entry_kind: "individual",
            registration_id: row.registrationId,
            nickname: row.nickname,
            sort_order: base + index + 1,
        }))
    );

    if (error) {
        console.error("addCandidatesBulk failed:", error.message);
        return {
            ok: false,
            problems: [
                {
                    line: 0,
                    text: "",
                    reason:
                        error.code === "23505"
                            ? "One of these people was added by someone else just now. Nothing was saved — check the list and paste again."
                            : "Could not save the list. Nothing was added.",
                },
            ],
        };
    }

    revalidatePath("/awards");
    return { ok: true, added: resolved.length };
}

/**
 * Resolve a list of member emails to registrations, or explain what's wrong.
 *
 * Every member of a clique, and every founder behind a brand, must be a
 * registered finalist. That is not bureaucracy: it is what guarantees each one
 * has a photo, which is what lets a clique render as real faces instead of
 * initials — and it keeps a group entry from smuggling someone onto the ballot
 * who was never screened.
 */
const resolveMembers = async (
    categoryId: string,
    emails: string[]
): Promise<{ ok: true; ids: string[] } | { ok: false; message: string }> => {
    const cleaned = emails.map((email) => email.trim().toLowerCase()).filter(Boolean);
    const unique = [...new Set(cleaned)];

    if (unique.length !== cleaned.length) {
        return { ok: false, message: "The same email is listed twice." };
    }

    const ids: string[] = [];
    for (const email of unique) {
        const finalist = await findFinalistByEmail(categoryId, email);
        if (!finalist) {
            return {
                ok: false,
                message: `No dinner registration for ${email} — every member must be a registered finalist.`,
            };
        }
        if (!(await hasConsentToken(finalist.registrationId))) {
            return {
                ok: false,
                message: `${finalist.firstName} has no consent token yet — resend it from Registrations first.`,
            };
        }
        ids.push(finalist.registrationId);
    }

    return { ok: true, ids };
};

/**
 * Insert a group candidacy and its roster.
 *
 * The two writes are not a transaction — Supabase's REST client has no way to
 * ask for one — so the order matters: the candidate row goes in first, and if
 * the member insert then fails the candidate is deleted again. A group entry
 * with no members would render as an empty mosaic on a live ballot, which is
 * worse than the entry simply not existing.
 */
const standGroup = async (input: {
    categoryId: string;
    entryKind: "clique" | "brand";
    displayName: string;
    nickname: string;
    logoUrl: string | null;
    members: { registrationId: string; role: string | null }[];
}): Promise<AwardActionResult> => {
    const supabase = createServerSupabase();

    const { data: last } = await supabase
        .from("fyb_award_candidates")
        .select("sort_order")
        .eq("category_id", input.categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();

    const { data: created, error } = await supabase
        .from("fyb_award_candidates")
        .insert({
            category_id: input.categoryId,
            entry_kind: input.entryKind,
            registration_id: null,
            display_name: input.displayName,
            logo_url: input.logoUrl,
            nickname: input.nickname,
            sort_order: (last?.sort_order ?? 0) + 1,
        })
        .select("id")
        .maybeSingle<{ id: string }>();

    if (error || !created) {
        if (error?.code === "23505") {
            return {
                ok: false,
                message: `“${input.displayName}” is already standing in this category.`,
            };
        }
        console.error("standGroup failed:", error?.message);
        return { ok: false, message: "Could not add the entry." };
    }

    const { error: memberError } = await supabase
        .from("fyb_award_candidate_members")
        .insert(
            input.members.map((member, index) => ({
                candidate_id: created.id,
                registration_id: member.registrationId,
                role: member.role,
                sort_order: index,
            }))
        );

    if (memberError) {
        console.error("standGroup members failed:", memberError.message);
        await supabase.from("fyb_award_candidates").delete().eq("id", created.id);
        return { ok: false, message: "Could not save the members. Nothing was added." };
    }

    revalidatePath("/awards");
    return { ok: true, message: `“${input.displayName}” added.` };
};

/** Stand a clique: a name, and the finalists who are actually in it. */
export async function addCliqueCandidate(input: {
    categoryId: string;
    name: string;
    nickname: string;
    emails: string[];
}): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const name = input.name?.trim();
    const nickname = input.nickname?.trim();
    if (!name) return { ok: false, message: "Give the clique a name." };
    if (!nickname) return { ok: false, message: "Give the clique a nickname for this category." };

    const emails = input.emails.filter((email) => email.trim());
    // Three is the standard's own floor for what counts as a clique rather than
    // a friendship — enforced here so it can't be bypassed by the form.
    if (emails.length < 3) {
        return {
            ok: false,
            message: "A clique needs at least 3 members — that's the standard's own floor.",
        };
    }

    const resolved = await resolveMembers(input.categoryId, emails);
    if (!resolved.ok) return resolved;

    return standGroup({
        categoryId: input.categoryId,
        entryKind: "clique",
        displayName: name,
        nickname,
        logoUrl: null,
        members: resolved.ids.map((registrationId) => ({ registrationId, role: null })),
    });
}

/** Stand a brand: its name, its logo, and the FYB founders behind it. */
export async function addBrandCandidate(input: {
    categoryId: string;
    name: string;
    nickname: string;
    logoUrl: string;
    emails: string[];
}): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const name = input.name?.trim();
    const nickname = input.nickname?.trim();
    const logoUrl = input.logoUrl?.trim();

    if (!name) return { ok: false, message: "Give the brand its name." };
    if (!nickname) return { ok: false, message: "Give the brand a nickname for this category." };
    if (!logoUrl || !isRenderableLogoUrl(logoUrl)) {
        return {
            ok: false,
            message: "A brand needs a logo — upload one, or paste a public https image link.",
        };
    }

    const emails = input.emails.filter((email) => email.trim());
    if (emails.length === 0) {
        return {
            ok: false,
            message: "Name at least one founder — the award is shared by whoever founded it.",
        };
    }

    const resolved = await resolveMembers(input.categoryId, emails);
    if (!resolved.ok) return resolved;

    return standGroup({
        categoryId: input.categoryId,
        entryKind: "brand",
        displayName: name,
        nickname,
        logoUrl,
        // The first named person is the founder; anyone after is a co-founder.
        // The standard treats them as equals for the award itself — this only
        // records what the nominator said, for the stats panel.
        members: resolved.ids.map((registrationId, index) => ({
            registrationId,
            role: index === 0 ? "founder" : "co-founder",
        })),
    });
}

export async function updateCandidateNickname(
    id: string,
    nickname: string
): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const value = nickname?.trim();
    if (!value) return { ok: false, message: "A nickname can't be blank." };

    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_award_candidates")
        .update({ nickname: value })
        .eq("id", id);

    if (error) {
        console.error("updateCandidateNickname failed:", error.message);
        return { ok: false, message: "Could not save the nickname." };
    }

    revalidatePath("/awards");
    return { ok: true, message: "Saved." };
}

/** Removing a candidate removes the votes cast for them. Says so in the UI. */
export async function removeCandidate(id: string): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const supabase = createServerSupabase();
    const { error } = await supabase.from("fyb_award_candidates").delete().eq("id", id);

    if (error) {
        console.error("removeCandidate failed:", error.message);
        return { ok: false, message: "Could not remove the candidate." };
    }

    const closed = await closeVotingIfEmpty(admin.email ?? admin.profileId);

    revalidatePath("/awards");
    return { ok: true, message: `Removed.${closed}` };
}

// ─── Stats & settings ───────────────────────────────────────────────────────

const emptyStats: AwardStats = {
    voters: 0,
    eligibleVoters: 0,
    totalVotes: 0,
    categoryCount: 0,
    candidateCount: 0,
    emptyCategories: [],
    thinCategories: [],
    undocumentedCategories: [],
    zeroVoteCandidates: 0,
    completion: { averageVoted: 0, finishedAll: 0, votedOnce: 0 },
    levels: [],
    timeline: [],
    multiLeaders: [],
    results: [],
};

export async function getAwardStats(): Promise<AwardStats> {
    const admin = await getCurrentAdmin();
    if (!admin) return emptyStats;

    const live = await getDocumentedCategories();
    const liveCategories = live.length;

    const [tally, eligibleVoters, levels, timeline, completion] = await Promise.all([
        getCategoryResults(),
        countEligibleVoters(),
        getLevelTurnout(),
        getVoteTimeline(),
        getBallotCompletion(liveCategories),
    ]);

    return {
        voters: tally.voters,
        eligibleVoters,
        totalVotes: tally.totalVotes,
        categoryCount: tally.results.length,
        candidateCount: tally.candidateCount,
        emptyCategories: tally.results
            .filter((result) => result.candidates.length === 0)
            .map((result) => result.title),
        // Two candidates is a coin toss, not a race — worth flagging while
        // there's still time to nominate more.
        thinCategories: tally.results
            .filter((result) => result.candidates.length > 0 && result.candidates.length < 3)
            .map((result) => result.title),
        // The hard stop, separated from the nudges above: these categories are
        // live in the database but match no award in the standard, so no voter
        // will ever see them and voting cannot open while they exist.
        undocumentedCategories: live
            .filter((category) => !category.standard)
            .map((category) => category.title),
        zeroVoteCandidates: tally.results
            .flatMap((result) => result.candidates)
            .filter((candidate) => candidate.votes === 0).length,
        completion,
        levels,
        timeline,
        multiLeaders: tally.multiLeaders,
        results: tally.results,
    };
}

export async function getAwardSettings(): Promise<AwardSettings> {
    const admin = await getCurrentAdmin();
    if (!admin) return { awardsEnabled: false, resultsPublic: false };

    const settings = await getSettings();
    return {
        awardsEnabled: settings.awardsEnabled,
        resultsPublic: settings.awardsResultsPublic,
    };
}

export async function saveAwardSettings(
    input: AwardSettings
): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    // An open ballot with nobody standing is a broken promise: members follow a
    // nav link to a page of empty rails. Refuse it at the source rather than
    // handle it in the UI, so no route can reach that state.
    if (input.awardsEnabled) {
        // The gate that makes the standard binding rather than advisory. A live
        // category with no published criteria is invisible to voters already —
        // but letting voting open around it would mean an award season running
        // with a category nobody can screen against, which is exactly the state
        // the standard exists to make impossible. Named, so the fix is obvious.
        const undocumented = (await getDocumentedCategories()).filter(
            (category) => !category.standard
        );
        if (undocumented.length > 0) {
            const names = undocumented.map((category) => `“${category.title}”`).join(", ");
            return {
                ok: false,
                message:
                    `Voting can't open: ${names} ${undocumented.length === 1 ? "has" : "have"} no published criteria. ` +
                    "Archive the category, or add its award to award-standard.jsonrc and deploy.",
            };
        }

        const candidates = await countVotableCandidates();
        if (candidates === 0) {
            return {
                ok: false,
                message:
                    "Voting can't open with no candidates — add candidates to at least one live category first.",
            };
        }
    }

    const by = admin.email ?? admin.profileId;
    const results = await Promise.all([
        updateSetting("awards_enabled", input.awardsEnabled, by),
        updateSetting("awards_results_public", input.resultsPublic, by),
    ]);

    if (results.some((r) => !r.success)) {
        return { ok: false, message: "Could not save settings." };
    }

    // Flags are read per request, so every route picks this up immediately.
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved." };
}
