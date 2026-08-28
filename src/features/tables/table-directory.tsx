"use client";

import { useMemo, useState } from "react";
import { Armchair, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { SeatedPair } from "@/services/check-in.service";
import SeatRow from "./seat-row";

/**
 * The seating plan, as a guest reads it off their phone in a doorway.
 *
 * Everybody is listed by default: this is a wall chart, and the first thing
 * anyone does with one is scan it. The search box is for the person who has
 * been scanning for a minute.
 *
 * Nothing here admits anybody — the door is the staff view of this same page.
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
            <div className="relative mt-4">
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

            {results.length > 0 && (
                <ul className="surface mt-6 divide-y divide-border p-0">
                    {results.map((pair) => (
                        <SeatRow key={pair.intentId} pair={pair} />
                    ))}
                </ul>
            )}
        </>
    );
};

export default TableDirectory;
