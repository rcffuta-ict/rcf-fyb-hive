"use client";

import { useEffect, useState, useTransition } from "react";
import confetti from "canvas-confetti";

import { castVote, signOutVoter } from "@/actions/awards.action";
import { appToast } from "@/providers/ToastProvider";
import type { Ballot, BallotCategory } from "@/types/awards.types";

/**
 * Ballot state: the picks, the writes, and the feedback around them.
 *
 * Votes apply optimistically and roll back if the server disagrees. That is the
 * right trade here: the write is idempotent and the failure modes are narrow
 * (voting closed, candidate withdrawn), so making everyone wait on a round trip
 * to see their own crown move would cost far more than the rare rollback does.
 */

const celebrate = (): void => {
    void confetti({
        particleCount: 70,
        spread: 72,
        startVelocity: 34,
        scalar: 0.9,
        origin: { y: 0.7 },
        colors: ["#F7E7CE", "#E8B86D", "#B8860B"],
    });
};

export type UseBallot = {
    categories: BallotCategory[];
    voted: number;
    handleVote: (categoryId: string, candidateId: string) => void;
    handleSignOut: () => void;
};

export const useBallot = (
    ballot: Ballot,
    spotlightCandidateId: string | null
): UseBallot => {
    const [categories, setCategories] = useState<BallotCategory[]>(ballot.categories);
    const [, startTransition] = useTransition();

    // Scroll the spotlit candidate into view — vertically to their category,
    // horizontally to their card within the rail. Runs once; voting afterwards
    // leaves the scroll position alone.
    useEffect(() => {
        if (!spotlightCandidateId) return;
        const node = document.getElementById(`candidate-${spotlightCandidateId}`);
        if (!node) return;

        const timer = window.setTimeout(
            () =>
                node.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                }),
            250
        );
        return () => window.clearTimeout(timer);
    }, [spotlightCandidateId]);

    const voted = categories.filter((c) => c.myVoteCandidateId).length;

    const setPick = (categoryId: string, candidateId: string | null): void => {
        setCategories((current) =>
            current.map((category) =>
                category.id === categoryId
                    ? { ...category, myVoteCandidateId: candidateId }
                    : category
            )
        );
    };

    const handleVote = (categoryId: string, candidateId: string): void => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return;

        const previous = category.myVoteCandidateId;
        if (previous === candidateId) return;

        const candidate = category.candidates.find((c) => c.id === candidateId);

        // One toast per category, keyed by slug: voting down a long ballot fires
        // these in quick succession, and a shared id would let a later category's
        // result overwrite the feedback for an earlier one still in flight.
        const toastId = `vote-${category.slug}`;
        appToast.loading(previous ? "Changing your pick…" : "Recording your vote…", toastId);

        setPick(categoryId, candidateId);
        // First vote of the session earns the confetti; every one after that
        // would turn a celebration into a nuisance.
        if (voted === 0) celebrate();

        startTransition(async () => {
            const result = await castVote(categoryId, candidateId);

            if (result.status === "ok") {
                appToast.success(
                    candidate
                        ? `${candidate.firstName} it is — ${category.title}.`
                        : `Vote recorded — ${category.title}.`,
                    toastId
                );
                return;
            }

            setPick(categoryId, previous);
            appToast.error(result.message ?? "Could not record your vote.", toastId);
        });
    };

    const handleSignOut = (): void => {
        startTransition(async () => {
            await signOutVoter();
            window.location.reload();
        });
    };

    return { categories, voted, handleVote, handleSignOut };
};
