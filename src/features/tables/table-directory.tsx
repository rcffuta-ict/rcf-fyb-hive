"use client";

import { useMemo, useState } from "react";
import { Armchair, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { SeatedPair } from "@/services/check-in.service";

/**
 * The seating plan, as a guest reads it off their phone in a doorway.
 *
 * Everybody is listed by default — this is a wall chart, and the first thing
 * someone does with one is scan it. The search box is there for the person who
 * has already been scanning for a minute.
 */
const TableDirectory = ({ pairs }: { pairs: SeatedPair[] }): React.JSX.Element => {
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return pairs;
        const squashed = term.replace(/\s+/g, "");
        return pairs.filter(
            (pair) =>
                pair.tableNumber.toLowerCase().replace(/\s+/g, "").includes(squashed) ||
                pair.names.some((name) => name.toLowerCase().includes(term))
        );
    }, [pairs, query]);

    return (
        <>
            <div className="relative mt-6">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Your name, or a table…"
                    className="h-13 pl-12 text-base"
                    autoCapitalize="none"
                    autoCorrect="off"
                />
            </div>

            {pairs.length === 0 && (
                <div className="surface mt-6 p-10 text-center">
                    <Armchair size={28} className="mx-auto text-muted-foreground" />
                    <p className="mt-3 font-medium text-foreground">
                        Seating isn&apos;t out yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Check back shortly — tables go up here as they&apos;re assigned.
                    </p>
                </div>
            )}

            {pairs.length > 0 && results.length === 0 && (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Nothing matches “{query}”. Try one name on its own, or ask at the desk.
                </p>
            )}

            <ul className="surface mt-6 divide-y divide-border p-0">
                {results.map((pair) => (
                    <li
                        key={pair.tableNumber}
                        className="flex items-center justify-between gap-4 px-4 py-3.5"
                    >
                        <p className="min-w-0 text-sm text-foreground">
                            {pair.names.join(" & ")}
                        </p>
                        <span className="shrink-0 rounded-token bg-accent/60 px-3 py-1 font-mono text-sm font-bold tracking-wider text-primary">
                            {pair.tableNumber}
                        </span>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default TableDirectory;
