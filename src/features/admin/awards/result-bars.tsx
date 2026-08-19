"use client";

import { Crown } from "lucide-react";

import EntryAvatar from "@/components/ui/entry-avatar";
import { cn } from "@/lib/utils";
import type { CategoryResult } from "@/types/awards.types";

/**
 * One category's standings.
 *
 * Bars are scaled against the leader rather than against 100%, because a
 * five-way race where nobody clears 30% is unreadable at true scale — the
 * percentage label carries the absolute truth, the bar carries the shape of it.
 */
const ResultBars = ({
    result,
    bare = false,
}: {
    result: CategoryResult;
    /** Inside the leaderboard the row already carries the title and frame. */
    bare?: boolean;
}): React.JSX.Element => {
    const top = Math.max(1, ...result.candidates.map((c) => c.votes));

    return (
        <div className={bare ? "" : "surface p-5"}>
            {!bare && (
                <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-luxury text-lg text-foreground">{result.title}</h3>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {result.votesCast} vote{result.votesCast === 1 ? "" : "s"}
                    </span>
                </div>
            )}

            {result.candidates.length === 0 ? (
                <p className={cn("text-sm text-amber-600", !bare && "mt-3")}>
                    Nobody is standing in this category yet.
                </p>
            ) : (
                <ul className={cn("space-y-3", bare ? "mt-1" : "mt-4")}>
                    {result.candidates.map((candidate) => (
                        <li key={candidate.candidateId} className="flex items-center gap-3">
                            <EntryAvatar
                                entryKind={candidate.entryKind}
                                imageUrl={candidate.imageUrl}
                                members={candidate.members}
                                alt={candidate.displayName}
                                size={32}
                                className={cn(candidate.isLeader && "ring-2 ring-primary")}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="truncate text-sm text-foreground">
                                        {candidate.displayName}
                                        <span className="ml-1.5 text-xs text-primary">
                                            &ldquo;{candidate.nickname}&rdquo;
                                        </span>
                                        {candidate.isLeader && (
                                            <Crown
                                                size={13}
                                                className="ml-1.5 inline text-primary"
                                                aria-label="leading"
                                            />
                                        )}
                                    </p>
                                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                        {candidate.votes} · {candidate.share}%
                                    </span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            candidate.isLeader
                                                ? "bg-metallic-gold"
                                                : "bg-primary/40"
                                        )}
                                        style={{ width: `${(candidate.votes / top) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ResultBars;
