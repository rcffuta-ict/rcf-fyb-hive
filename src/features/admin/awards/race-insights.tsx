"use client";

import Image from "next/image";
import { Crown, Flame } from "lucide-react";

import type { CategoryResult, MultiLeader } from "@/types/awards.types";

/**
 * The two questions a wall of bars can't answer: which races are still live,
 * and who is winning more than one.
 *
 * "Close" is a margin of two votes or fewer among categories that have votes.
 * A margin of zero is a tie, and ties sort first — those are the ones that will
 * still be moving on the last night.
 */

const CLOSE_MARGIN = 2;
const MAX_SHOWN = 5;

const RaceInsights = ({
    results,
    multiLeaders,
}: {
    results: CategoryResult[];
    multiLeaders: MultiLeader[];
}): React.JSX.Element | null => {
    const close = results
        .filter((result) => result.votesCast > 0 && result.candidates.length > 1)
        .filter((result) => result.margin <= CLOSE_MARGIN)
        .sort((a, b) => a.margin - b.margin || b.votesCast - a.votesCast)
        .slice(0, MAX_SHOWN);

    if (close.length === 0 && multiLeaders.length === 0) return null;

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            {close.length > 0 && (
                <div className="surface p-5">
                    <h3 className="flex items-center gap-2 font-luxury text-base text-foreground">
                        <Flame size={16} className="text-primary" />
                        Too close to call
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                        {close.map((result) => (
                            <li
                                key={result.categoryId}
                                className="flex items-baseline justify-between gap-3 text-sm"
                            >
                                <span className="truncate text-foreground/85">
                                    {result.title}
                                </span>
                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                    {result.margin === 0
                                        ? "tied"
                                        : `${result.margin} vote${result.margin === 1 ? "" : "s"} in it`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {multiLeaders.length > 0 && (
                <div className="surface p-5">
                    <h3 className="flex items-center gap-2 font-luxury text-base text-foreground">
                        <Crown size={16} className="text-primary" />
                        Leading more than one
                    </h3>
                    <ul className="mt-3 space-y-3">
                        {multiLeaders.slice(0, MAX_SHOWN).map((leader) => (
                            <li key={leader.registrationId} className="flex items-center gap-3">
                                <Image
                                    src={leader.photoUrl}
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-primary/40"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-foreground">
                                        {leader.firstName} {leader.lastName}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {leader.categories.join(" · ")}
                                    </p>
                                </div>
                                <span className="shrink-0 text-sm tabular-nums text-primary">
                                    ×{leader.categories.length}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RaceInsights;
