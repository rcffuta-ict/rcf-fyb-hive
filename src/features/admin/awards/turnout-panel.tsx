"use client";

import { Activity, GraduationCap } from "lucide-react";

import type { LevelTurnout, TimelinePoint } from "@/types/awards.types";

/**
 * Who is voting, and when.
 *
 * Both charts are scaled to their own maximum rather than to a shared axis:
 * these are shape-readers ("did the push on Sunday work?", "is anyone below
 * 400 level turning out?"), and the exact figure sits next to every bar.
 */

const dayLabel = (day: string): string =>
    new Date(`${day}T00:00:00`).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
    });

const TurnoutPanel = ({
    levels,
    timeline,
}: {
    levels: LevelTurnout[];
    timeline: TimelinePoint[];
}): React.JSX.Element => {
    const levelTop = Math.max(1, ...levels.map((l) => l.voters));
    const dayTop = Math.max(1, ...timeline.map((t) => t.votes));

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

            <div className="surface p-5">
                <h3 className="flex items-center gap-2 font-luxury text-base text-foreground">
                    <Activity size={16} className="text-primary" />
                    Votes per day
                </h3>

                {timeline.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">No votes yet.</p>
                ) : (
                    <>
                        <div className="mt-5 flex h-24 items-end gap-1">
                            {timeline.map((point) => (
                                <div
                                    key={point.day}
                                    title={`${dayLabel(point.day)}: ${point.votes}`}
                                    className="flex-1 rounded-t bg-metallic-gold/70 transition-all hover:bg-metallic-gold"
                                    style={{
                                        height: `${Math.max(4, (point.votes / dayTop) * 100)}%`,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                            <span>{dayLabel(timeline[0].day)}</span>
                            <span>{dayLabel(timeline[timeline.length - 1].day)}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TurnoutPanel;
