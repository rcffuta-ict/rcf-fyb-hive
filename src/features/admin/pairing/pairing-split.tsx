"use client";

import { Users2 } from "lucide-react";

/**
 * Who is pairing with whom.
 *
 * Worth its own panel because the two kinds cost the organizers different
 * things: an associate pairing means a guest nobody in the fellowship knows,
 * and that is a headcount and a seating problem, not just a number.
 */
const PairingSplit = ({
    finalistPairs,
    associatePairs,
}: {
    finalistPairs: number;
    associatePairs: number;
}): React.JSX.Element => {
    const total = finalistPairs + associatePairs;
    const finalistPct = total === 0 ? 0 : Math.round((finalistPairs / total) * 100);

    const rows = [
        {
            label: "Finalist with finalist",
            value: finalistPairs,
            hint: "both from the set",
            bar: "bg-primary/60",
        },
        {
            label: "Finalist with an associate",
            value: associatePairs,
            hint: "a guest from outside",
            bar: "bg-metallic-gold/70",
        },
    ];

    return (
        <div className="surface p-5">
            <h3 className="flex items-center gap-2 font-luxury text-base text-foreground">
                <Users2 size={16} className="text-primary" />
                Approved pairings
            </h3>

            {total === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    Nothing approved yet — confirmed payments land here.
                </p>
            ) : (
                <>
                    <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary/60"
                            style={{ width: `${finalistPct}%` }}
                        />
                        <div className="h-full flex-1 bg-metallic-gold/70" />
                    </div>

                    <ul className="mt-4 space-y-3">
                        {rows.map((row) => (
                            <li key={row.label} className="flex items-center gap-3">
                                <span
                                    aria-hidden
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.bar}`}
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm text-foreground">
                                        {row.label}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {row.hint}
                                    </span>
                                </span>
                                <span className="shrink-0 font-luxury text-xl tabular-nums text-foreground">
                                    {row.value}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default PairingSplit;
