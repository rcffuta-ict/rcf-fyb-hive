"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";

import { useBallot } from "@/hooks/use-ballot";
import BallotHeader from "./ballot-header";
import CategoryRail from "./category-rail";
import type { Ballot } from "@/types/awards.types";

/**
 * The ballot: a vertical stack of categories, each a horizontal rail of
 * candidates. All state and writes live in `useBallot` — this is the layout.
 */

const BallotBoard = ({
    ballot,
    spotlightCandidateId = null,
}: {
    ballot: Ballot;
    /** Arrived via a campaign link — ring this card and scroll to it. */
    spotlightCandidateId?: string | null;
}): React.JSX.Element => {
    const { categories, voted, handleVote, handleSignOut } = useBallot(
        ballot,
        spotlightCandidateId
    );

    return (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <header className="text-center">
                <span className="eyebrow">The Honours</span>
                <h1 className="mt-2 font-luxury text-4xl text-foreground sm:text-5xl">
                    Crown the set
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/70">
                    One vote in each category. Change your mind as many times as you like —
                    only your last pick counts, and only you can see it.
                </p>

                {/* Nobody on this ballot got here by being popular — everyone
                    cleared a published checklist first. Said once at the top,
                    and repeated per category in the rail disclosures. */}
                <Link
                    href="/awards/standard"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                >
                    <ScrollText size={13} />
                    How these awards are decided
                </Link>
            </header>

            <div className="mt-8">
                <BallotHeader
                    firstName={ballot.voter.firstName}
                    avatarUrl={ballot.voter.avatarUrl}
                    voted={voted}
                    total={categories.length}
                    onSignOut={handleSignOut}
                />
            </div>

            {!ballot.votingOpen && (
                <p className="mt-6 rounded-token border border-amber-500/30 bg-amber-500/5 p-4 text-center text-sm text-amber-600">
                    Voting has closed. Your picks are locked in — see you at the dinner.
                </p>
            )}

            {categories.length === 0 ? (
                <p className="surface mt-8 p-8 text-center text-sm text-muted-foreground">
                    The categories are still being finalised. Come back shortly — this is
                    where you&apos;ll crown the set.
                </p>
            ) : (
                <div className="mt-10 space-y-14">
                    {categories.map((category, index) => (
                        <CategoryRail
                            key={category.id}
                            category={category}
                            index={index}
                            votingOpen={ballot.votingOpen}
                            spotlightCandidateId={spotlightCandidateId}
                            onVote={handleVote}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BallotBoard;
