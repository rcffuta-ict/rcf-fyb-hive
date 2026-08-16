"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import ResultBars from "./result-bars";
import type { CategoryResult } from "@/types/awards.types";

/**
 * Every category at a glance, one row each.
 *
 * Ten categories × thirty candidates rendered as bars is three hundred rows of
 * chart — technically complete and practically unreadable. So each category
 * collapses to the only line that matters at a glance (who leads, by how much),
 * and opens into the full bars on demand.
 */

const CategoryLeaderboard = ({
    results,
}: {
    results: CategoryResult[];
}): React.JSX.Element => {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <div className="surface divide-y divide-border">
            {results.map((result) => {
                const leader = result.candidates[0];
                const open = openId === result.categoryId;
                const tied = result.margin === 0 && result.votesCast > 0;

                return (
                    <div key={result.categoryId}>
                        <button
                            type="button"
                            onClick={() => setOpenId(open ? null : result.categoryId)}
                            aria-expanded={open}
                            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-foreground/[0.03]"
                        >
                            {leader && leader.votes > 0 ? (
                                <Image
                                    src={leader.photoUrl}
                                    alt=""
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-primary/40"
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
                                            : `${leader.firstName} leads · ${leader.share}%`}
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
