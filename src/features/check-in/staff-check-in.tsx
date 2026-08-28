"use client";

import { useMemo, useState } from "react";
import { RefreshCw, ScanLine, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckInRoster } from "@/hooks/use-check-in-roster";
import { searchPairs } from "@/lib/pair-search";
import { appToast } from "@/providers/ToastProvider";
import type { CheckInManager } from "@/types/fyb.types";
import CheckInCard from "./check-in-card";
import CheckInStats from "./check-in-stats";

/**
 * The door, for whoever is working it.
 *
 * One box, one list, one button per couple. Everybody here has already paid and
 * already been emailed their invitation, so the only question left is whether
 * the two people standing there are the two people on the row — nothing else
 * competes for the space.
 *
 * Nothing is listed until something is typed: with a few hundred couples an
 * unfiltered roster is scrolling, not searching.
 */
const MIN_QUERY = 2;

const StaffCheckIn = ({ manager }: { manager: CheckInManager }): React.JSX.Element => {
    const [query, setQuery] = useState("");
    const { roster, loading, busyId, refresh, checkIn, undo } = useCheckInRoster(
        `${manager.firstName} ${manager.lastName}`.trim()
    );

    const results = useMemo(
        () => (query.trim().length < MIN_QUERY ? [] : searchPairs(roster, query)),
        [roster, query]
    );

    const run = async (
        action: () => Promise<{ ok: boolean; message: string }>
    ): Promise<void> => {
        const result = await action();
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    const handleUndo = (intentId: string): void => {
        if (!window.confirm("Undo this check-in? Only do this if the wrong couple was marked.")) return;
        void run(() => undo(intentId));
    };

    const searching = query.trim().length >= MIN_QUERY;

    return (
        <>
            <div className="relative mt-4" role="search">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name, email, phone, code or table…"
                    className="h-14 pl-12 pr-14 text-lg"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={refresh}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    title="Reload the roster"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : undefined} />
                </Button>
            </div>

            <CheckInStats roster={roster} />

            <div className="surface mt-4 overflow-hidden p-0">
                {loading && roster.length === 0 && (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                        Loading the roster…
                    </p>
                )}

                {!loading && !searching && (
                    <div className="p-10 text-center">
                        <ScanLine size={28} className="mx-auto text-muted-foreground" />
                        <p className="mt-3 font-medium text-foreground">Search for the couple</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Either of their names, either email, either phone number, the code
                            on their invitation — or their table.
                        </p>
                    </div>
                )}

                {searching && results.length === 0 && !loading && (
                    <div className="p-10 text-center">
                        <p className="font-medium text-foreground">Nobody matches “{query}”</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Only approved, paid pairings are on this list. If they insist they
                            paid, send them to an organizer before turning anyone away.
                        </p>
                    </div>
                )}

                {results.map((pair) => (
                    <CheckInCard
                        key={pair.intentId}
                        pair={pair}
                        busy={busyId === pair.intentId}
                        onCheckIn={(id) => void run(() => checkIn(id))}
                        onUndo={handleUndo}
                    />
                ))}
            </div>
        </>
    );
};

export default StaffCheckIn;
