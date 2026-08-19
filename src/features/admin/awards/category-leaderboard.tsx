"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import EntryAvatar from "@/components/ui/entry-avatar";
import { cn } from "@/lib/utils";
import ResultBars from "./result-bars";
import type { CategoryResult } from "@/types/awards.types";

/**
 * Every category at a glance, one card each.
 *
 * Twenty categories × thirty candidates rendered as bars is six hundred rows of
 * chart — technically complete and practically unreadable. So each category
 * collapses to the only line that matters at a glance (who leads, by how much),
 * and opens into the full bars on demand.
 *
 * A grid rather than a stack: the summary line is short, and one category per
 * full-width row meant scrolling past a screen of mostly-empty rows to compare
 * two races. Several cards open at once for the same reason — comparing is the
 * point, and a single-open accordion makes that impossible.
 */

const CategoryLeaderboard = ({
    results,
}: {
    results: CategoryResult[];
}): React.JSX.Element => {
    const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());

    const handleToggle = (categoryId: string): void => {
        setOpenIds((current) => {
            const next = new Set(current);
            if (!next.delete(categoryId)) next.add(categoryId);
            return next;
        });
    };

    return (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {results.map((result) => {
                const leader = result.candidates[0];
                const open = openIds.has(result.categoryId);
                const tied = result.margin === 0 && result.votesCast > 0;

                return (
                    <div
                        key={result.categoryId}
                        className={cn(
                            "surface flex flex-col self-start overflow-hidden transition-colors",
                            open && "ring-1 ring-primary/30"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => handleToggle(result.categoryId)}
                            aria-expanded={open}
                            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-foreground/[0.03]"
                        >
                            {leader && leader.votes > 0 ? (
                                <EntryAvatar
                                    entryKind={leader.entryKind}
                                    imageUrl={leader.imageUrl}
                                    members={leader.members}
                                    alt={leader.displayName}
                                    size={36}
                                    className="ring-1 ring-primary/40"
                                />
                            ) : (
                                <span className="h-9 w-9 shrink-0 rounded-full border border-dashed border-border" />
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {result.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {result.candidates.length === 0
                                        ? "No candidates yet"
                                        : result.votesCast === 0
                                          ? `${result.candidates.length} standing · no votes yet`
                                          : tied
                                            ? `Tied at the top · ${leader.votes} each`
                                            : `${leader.displayName} leads · ${leader.share}%`}
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-sm tabular-nums text-foreground">
                                    {result.votesCast}
                                </p>
                                <p
                                    className={cn(
                                        "text-[11px] tabular-nums",
                                        tied ? "text-amber-600" : "text-muted-foreground"
                                    )}
                                >
                                    {result.votesCast === 0
                                        ? "votes"
                                        : tied
                                          ? "tie"
                                          : `+${result.margin}`}
                                </p>
                            </div>

                            <ChevronDown
                                size={16}
                                className={cn(
                                    "shrink-0 text-muted-foreground transition-transform",
                                    open && "rotate-180"
                                )}
                            />
                        </button>

                        {open && (
                            <div className="border-t border-border/60 bg-background/40 p-3">
                                <ResultBars result={result} bare />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryLeaderboard;
