"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import {
    clearVoterCookie,
    readVoterProfileId,
    setVoterCookie,
} from "@/lib/voter-session";
import {
    candidateBelongsToCategory,
    getBallotCategories,
    upsertVote,
} from "@/services/awards.service";
import { resolveProfile } from "@/services/profile.service";
import { getSettings } from "@/services/settings.service";
import type {
    Ballot,
    VoteResult,
    VoterIdentity,
    VoterLookupResult,
} from "@/types/awards.types";

/**
 * Voting — the public half.
 *
 * Every write here re-resolves the voter from the httpOnly cookie and re-checks
 * that voting is still open. The client is never trusted for either: a stale
 * tab left open after voting closes, or a crafted request naming someone else's
 * profile, both fail server-side.
 */

type VoterRow = {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
};

const VOTER_COLUMNS = "id, first_name, last_name, avatar_url";

const toVoter = (row: VoterRow): VoterIdentity => ({
    profileId: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
});

/** The identified voter, or null. Re-read every call, never cached client-side. */
const getCurrentVoter = async (): Promise<VoterIdentity | null> => {
    const profileId = await readVoterProfileId();
    if (!profileId) return null;

    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("profiles")
        .select(VOTER_COLUMNS)
        .eq("id", profileId)
        .maybeSingle<VoterRow>();

    return data ? toVoter(data) : null;
};

/**
 * Claim a ballot. Any member profile qualifies — level is irrelevant here, which
 * is the whole point: the class is crowned by the fellowship, not only by itself.
 */
export async function identifyVoter(identifier: string): Promise<VoterLookupResult> {
    const value = identifier?.trim();
    if (!value) {
        return { status: "error", message: "Enter your email or phone number." };
    }

    try {
        const { awardsEnabled } = await getSettings();
        if (!awardsEnabled) {
            return { status: "closed", message: "Voting isn't open yet." };
        }

        const profile = await resolveProfile(value);
        if (!profile) return { status: "not_member" };

        await setVoterCookie(profile.id);

        return {
            status: "ok",
            voter: {
                profileId: profile.id,
                firstName: profile.first_name,
                lastName: profile.last_name,
                avatarUrl: profile.avatar_url,
            },
        };
    } catch (error) {
        console.error("identifyVoter failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}

/** The full ballot for whoever holds the cookie, or null if nobody does. */
export async function getBallot(): Promise<Ballot | null> {
    try {
        const voter = await getCurrentVoter();
        if (!voter) return null;

        const [settings, categories] = await Promise.all([
            getSettings(),
            getBallotCategories(voter.profileId),
        ]);

        return {
            voter,
            categories,
            votingOpen: settings.awardsEnabled,
            resultsPublic: settings.awardsResultsPublic,
        };
    } catch (error) {
        console.error("getBallot failed:", error);
        return null;
    }
}

/**
 * Cast or move this voter's pick in one category.
 *
 * Idempotent by construction — voting for the same candidate twice is one row
 * either way — so the client can fire optimistically without a confirm step.
 */
export async function castVote(
    categoryId: string,
    candidateId: string
): Promise<VoteResult> {
    if (!categoryId || !candidateId) {
        return { status: "invalid", message: "Pick a candidate first." };
    }

    try {
        const profileId = await readVoterProfileId();
        if (!profileId) {
            return {
                status: "not_identified",
                message: "Tell us who you are before voting.",
            };
        }

        const { awardsEnabled } = await getSettings();
        if (!awardsEnabled) {
            return { status: "closed", message: "Voting has closed." };
        }

        // The category is client-supplied, so the pairing of candidate to
        // category is verified here rather than assumed. The DB trigger catches
        // it too; this just turns a 500 into a sentence.
        const belongs = await candidateBelongsToCategory(candidateId, categoryId);
        if (!belongs) {
            return { status: "invalid", message: "That candidate isn't in this category." };
        }

        const result = await upsertVote({ categoryId, candidateId, voterProfileId: profileId });
        if (!result.success) {
            return { status: "error", message: result.message ?? "Could not record your vote." };
        }

        return { status: "ok" };
    } catch (error) {
        console.error("castVote failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}

/** Hand the ballot to someone else on a shared phone. Votes already cast stay. */
export async function signOutVoter(): Promise<void> {
    await clearVoterCookie();
}
