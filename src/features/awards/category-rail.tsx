"use client";

import { useRef } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import CandidateCard from "./candidate-card";
import CriteriaSheet from "./criteria-sheet";
import type { BallotCategory } from "@/types/awards.types";

/**
 * One award: the title block, then a horizontal rail of everyone standing.
 *
 * The rail is a radiogroup, not a list of buttons — arrow keys move between
 * candidates and only the current pick is tabbable, so a keyboard user crosses
 * ten categories in ten tabs instead of a hundred.
 */

const CategoryRail = ({
    category,
    index,
    votingOpen,
    spotlightCandidateId = null,
    onVote,
}: {
    category: BallotCategory;
    index: number;
    votingOpen: boolean;
    spotlightCandidateId?: string | null;
    onVote: (categoryId: string, candidateId: string) => void;
}): React.JSX.Element => {
    const railRef = useRef<HTMLDivElement>(null);
    const { candidates, myVoteCandidateId } = category;

    const scrollBy = (direction: 1 | -1): void => {
        railRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();

        const current = candidates.findIndex((c) => c.id === myVoteCandidateId);
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = candidates[Math.max(0, (current === -1 ? 0 : current) + step)];
        if (next && votingOpen) onVote(category.id, next.id);
    };

    return (
        <section className="animate-fade-in">
            <header className="flex flex-wrap items-end justify-between gap-3 px-1">
                <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-1 font-luxury text-2xl leading-tight text-foreground sm:text-[28px]">
                        {category.title}
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-sm text-foreground/70">
                        {category.description || category.standard.blurb}
                    </p>

                    {/* The criteria sit beside the faces, not on a page nobody
                        visits — this is where "is this just a popularity vote?"
                        gets asked, so it is where it gets answered. */}
                    <CriteriaSheet standard={category.standard} />
                </div>

                <div className="flex items-center gap-2">
                    {myVoteCandidateId && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Check size={13} /> Voted
                        </span>
                    )}
                    <div className="hidden gap-1 sm:flex">
                        <button
                            type="button"
                            aria-label={`Scroll ${category.title} left`}
                            onClick={() => scrollBy(-1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            aria-label={`Scroll ${category.title} right`}
                            onClick={() => scrollBy(1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {candidates.length === 0 ? (
                <p className="surface mt-4 p-6 text-center text-sm text-muted-foreground">
                    Nominees for this one are still being confirmed. Check back.
                </p>
            ) : (
                <div className="relative mt-4">
                    {/* Fades hint that the rail continues past the viewport edge. */}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
                    />

                    <div
                        ref={railRef}
                        role="radiogroup"
                        aria-label={category.title}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-3 pt-1",
                            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        )}
                    >
                        {candidates.map((candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                railId={category.id}
                                selected={candidate.id === myVoteCandidateId}
                                spotlit={candidate.id === spotlightCandidateId}
                                disabled={!votingOpen}
                                onSelect={() => onVote(category.id, candidate.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default CategoryRail;
