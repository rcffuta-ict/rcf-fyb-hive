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
    getLevelTurnout,
    getVoteTimeline,
} from "@/services/awards.service";
import { getSettings, updateSetting } from "@/services/settings.service";
import type {
    AdminCandidate,
    AwardCategory,
    AwardSettings,
    AwardStats,
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

/** URL-safe slug from a title, with a short suffix keeping it unique. */
const toSlug = (title: string): string => {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48);
    return `${base || "category"}-${Math.random().toString(36).slice(2, 6)}`;
};

export async function listCategories(): Promise<AwardCategory[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return getCategories(true);
}

export async function createCategory(input: {
    title: string;
    description: string;
}): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const title = input.title?.trim();
    if (!title) return { ok: false, message: "Give the category a title." };

    const supabase = createServerSupabase();
    // New categories land at the bottom of the ballot rather than jumping the
    // order someone already arranged.
    const { data: last } = await supabase
        .from("fyb_award_categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();

    const { error } = await supabase.from("fyb_award_categories").insert({
        slug: toSlug(title),
        title,
        description: input.description?.trim() || null,
        sort_order: (last?.sort_order ?? 0) + 1,
    });

    if (error) {
        console.error("createCategory failed:", error.message);
        return { ok: false, message: "Could not create the category." };
    }

    revalidatePath("/awards");
    return { ok: true, message: `“${title}” added.` };
}

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

/** Deletes the category, its candidates and their votes. Archive instead if live. */
export async function deleteCategory(id: string): Promise<AwardActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return denied;

    const supabase = createServerSupabase();
    const { error } = await supabase.from("fyb_award_categories").delete().eq("id", id);

    if (error) {
        console.error("deleteCategory failed:", error.message);
        return { ok: false, message: "Could not delete the category." };
    }

    const closed = await closeVotingIfEmpty(admin.email ?? admin.profileId);

    revalidatePath("/awards");
    return { ok: true, message: `Category deleted.${closed}` };
}

// ─── Candidates ─────────────────────────────────────────────────────────────

export async function listCandidates(categoryId: string): Promise<AdminCandidate[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return getAdminCandidates(categoryId);
}

/**
 * Stand a finalist in a category by their dinner email.
 *
 * The email must belong to a `fyb_registrations` row — the finalists who
 * registered and hold consent tokens. A member who never registered has no
 * photo and no snapshot, so there is nothing to put on a card.
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
        .maybeSingle<{ id: string; first_name: string; last_name: string }>();

    if (!registration) {
        return {
            ok: false,
            message: `No dinner registration for ${email} — only registered finalists can stand.`,
        };
    }

    const { data: last } = await supabase
        .from("fyb_award_candidates")
        .select("sort_order")
        .eq("category_id", input.categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();

    const { error } = await supabase.from("fyb_award_candidates").insert({
        category_id: input.categoryId,
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
        console.error("addCandidate failed:", error.message);
        return { ok: false, message: "Could not add the candidate." };
    }

    revalidatePath("/awards");
    return { ok: true, message: `${registration.first_name} ${registration.last_name} added.` };
}

export type BulkAddResult = {
    added: number;
    /** One line per email that didn't work, and why — shown verbatim to admin. */
    failures: string[];
};

/**
 * Paste a block of `email, nickname` lines. Sequential, not parallel: each line
 * is a few round trips and the failure report has to name the exact line that
 * failed, which a settled batch makes fiddlier than it's worth.
 */
export async function addCandidatesBulk(
    categoryId: string,
    raw: string
): Promise<BulkAddResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { added: 0, failures: ["Not authorized."] };

    const lines = raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    let added = 0;
    const failures: string[] = [];

    for (const line of lines) {
        const [email, ...rest] = line.split(/[,\t]/);
        const nickname = rest.join(",").trim();
        const result = await addCandidate({
            categoryId,
            email: email ?? "",
            nickname: nickname || (email ?? "").split("@")[0],
        });
        if (result.ok) added += 1;
        else failures.push(`${email?.trim() || line} — ${result.message}`);
    }

    return { added, failures };
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

    const liveCategories = (await getCategories()).length;

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
