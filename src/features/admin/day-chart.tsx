"use client";

import type { LucideIcon } from "lucide-react";

/**
 * A day-by-day column chart, scaled to its own maximum.
 *
 * This is a shape-reader — "did the push after service work?" — not a
 * measuring instrument, so there's no axis; the exact figure is in the tooltip.
 *
 * Bars are dimmed with `opacity`, not with a `/70` colour suffix: the gold is a
 * custom utility that sets the `background` shorthand to a gradient, and Tailwind
 * has no alpha variant for that — `bg-metallic-gold/70` compiles to nothing, so
 * the bars were invisible until the `hover:` rule brought the fill back.
 */

export type DayPoint = { day: string; value: number };

const dayLabel = (day: string): string =>
    new Date(`${day}T00:00:00`).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
    });

const DayChart = ({
    title,
    icon: Icon,
    points,
    empty,
    unit,
}: {
    title: string;
    icon: LucideIcon;
    points: DayPoint[];
    empty: string;
    unit: string;
}): React.JSX.Element => {
    const top = Math.max(1, ...points.map((point) => point.value));

    return (
        <div className="surface p-5">
            <h3 className="flex items-center gap-2 font-luxury text-base text-foreground">
                <Icon size={16} className="text-primary" />
                {title}
            </h3>

            {points.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
            ) : (
                <>
                    <div className="mt-5 flex h-24 items-end gap-1">
                        {points.map((point) => (
                            <div
                                key={point.day}
                                title={`${dayLabel(point.day)}: ${point.value} ${unit}`}
                                className="flex-1 rounded-t bg-metallic-gold opacity-80 transition-all hover:opacity-100"
                                style={{
                                    height: `${Math.max(4, (point.value / top) * 100)}%`,
                                }}
                            />
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                        <span>{dayLabel(points[0].day)}</span>
                        <span>{dayLabel(points[points.length - 1].day)}</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default DayChart;
