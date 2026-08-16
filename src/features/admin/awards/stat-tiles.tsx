"use client";

import { BarChart3, ListChecks, Trophy, UserCheck, Users } from "lucide-react";

import type { AwardStats } from "@/types/awards.types";

/**
 * The numbers worth glancing at before anything else.
 *
 * Turnout carries its denominator because "312 voters" means nothing without
 * the size of the room, and completion is here because with 10+ categories the
 * interesting question stops being how many voted and becomes how many finished.
 */
const StatTiles = ({ stats }: { stats: AwardStats }): React.JSX.Element => {
    const turnout =
        stats.eligibleVoters === 0
            ? 0
            : Math.round((stats.voters / stats.eligibleVoters) * 100);

    const finishedPct =
        stats.voters === 0
            ? 0
            : Math.round((stats.completion.finishedAll / stats.voters) * 100);

    const tiles = [
        {
            label: "Voters",
            value: stats.voters.toLocaleString(),
            hint: `${turnout}% of ${stats.eligibleVoters.toLocaleString()} members`,
            icon: UserCheck,
        },
        {
            label: "Votes cast",
            value: stats.totalVotes.toLocaleString(),
            hint: `${stats.completion.averageVoted} categories per voter`,
            icon: BarChart3,
        },
        {
            label: "Finished the ballot",
            value: `${finishedPct}%`,
            hint: `${stats.completion.finishedAll} voted every category`,
            icon: ListChecks,
        },
        {
            label: "Categories",
            value: String(stats.categoryCount),
            hint:
                stats.emptyCategories.length > 0
                    ? `${stats.emptyCategories.length} with no candidates`
                    : "all populated",
            icon: Trophy,
        },
        {
            label: "Candidates",
            value: String(stats.candidateCount),
            hint:
                stats.zeroVoteCandidates > 0
                    ? `${stats.zeroVoteCandidates} with no votes yet`
                    : "all have votes",
            icon: Users,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {tiles.map(({ label, value, hint, icon: Icon }) => (
                <div key={label} className="surface p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon size={14} />
                        <span className="text-xs uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="mt-2 font-luxury text-3xl tabular-nums text-foreground">
                        {value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
                </div>
            ))}
        </div>
    );
};

export default StatTiles;
