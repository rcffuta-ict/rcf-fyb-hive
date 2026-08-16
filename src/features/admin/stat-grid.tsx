"use client";

import type { LucideIcon } from "lucide-react";

/**
 * The headline-number grid, shared by awards and pairing stats.
 *
 * Every tile carries a hint line because a bare number is rarely the answer —
 * "48 paired" only means something next to how many finalists there are.
 */

export type Tile = {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
};

const StatGrid = ({ tiles }: { tiles: Tile[] }): React.JSX.Element => (
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

export default StatGrid;
