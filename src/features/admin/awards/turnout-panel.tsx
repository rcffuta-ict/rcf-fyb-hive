"use client";

import { Activity, GraduationCap } from "lucide-react";

import DayChart from "../day-chart";
import type { LevelTurnout, TimelinePoint } from "@/types/awards.types";

/**
 * Who is voting, and when.
 *
 * The level bars are scaled to their own maximum rather than to a shared axis:
 * the question is "is anyone below 400 level turning out?", and the exact figure
 * sits next to every bar.
 */
const TurnoutPanel = ({
    levels,
    timeline,
}: {
    levels: LevelTurnout[];
    timeline: TimelinePoint[];
}): React.JSX.Element => {
    const levelTop = Math.max(1, ...levels.map((l) => l.voters));

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            <div className="surface p-5">
                <h3 className="flex items-center gap-2 font-luxury text-base text-foreground">
                    <GraduationCap size={16} className="text-primary" />
                    Voters by level
                </h3>

                {levels.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Nobody has voted yet.</p>
                ) : (
                    <ul className="mt-4 space-y-2.5">
                        {levels.map((level) => (
                            <li key={level.level} className="flex items-center gap-3">
                                <span className="w-14 shrink-0 text-xs text-muted-foreground">
                                    {level.level}
                                </span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary/50"
                                        style={{ width: `${(level.voters / levelTop) * 100}%` }}
                                    />
                                </div>
                                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-foreground/80">
                                    {level.voters}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <DayChart
                title="Votes per day"
                icon={Activity}
                unit="votes"
                empty="No votes yet."
                points={timeline.map((point) => ({ day: point.day, value: point.votes }))}
            />
        </div>
    );
};

export default TurnoutPanel;
