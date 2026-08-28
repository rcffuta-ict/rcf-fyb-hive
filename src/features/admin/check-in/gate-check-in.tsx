"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, QrCode, RefreshCw, ScanLine, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckInRoster } from "@/hooks/use-check-in-roster";
import { searchPairs, squashTable } from "@/lib/pair-search";
import { appToast } from "@/providers/ToastProvider";
import type { AdminProfile } from "@/types/fyb.types";
import CheckInCard from "./check-in-card";
import CheckInStats from "./check-in-stats";

/**
 * The gate.
 *
 * One box, one list, one couple per row. Two jobs share it, and they happen at
 * different times: seating is assigned ahead of the evening, and the door is
 * worked as people arrive. That is why the table field is not part of the
 * check-in button — a couple can be given VIP 1 in the afternoon and admitted
 * hours later by somebody else.
 *
 * Everybody on this screen has already paid and already been emailed their
 * invitation, so the only question left at the door is whether the two people
 * standing there are the two people on the row.
 *
 * Nothing is listed until something is typed: with a few hundred approved pairs
 * an unfiltered roster is scrolling, not searching.
 */
const MIN_QUERY = 2;

const GateCheckIn = ({ admin }: { admin: AdminProfile }): React.JSX.Element => {
    const [query, setQuery] = useState("");
    const { roster, loading, busyId, refresh, checkIn, undo, setTable } = useCheckInRoster(
        `${admin.firstName} ${admin.lastName}`.trim()
    );

    const results = useMemo(
        () => (query.trim().length < MIN_QUERY ? [] : searchPairs(roster, query)),
        [roster, query]
    );

    const handleCheckIn = async (intentId: string): Promise<void> => {
        const result = await checkIn(intentId);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    const handleSetTable = async (intentId: string, value: string): Promise<void> => {
        // The roster in hand already knows most clashes, so the common case is
        // answered without a round trip. The unique index is still the
        // authority — this only spares the operator a wasted trip to the server.
        // Squashed, like the unique index: "VIP1" collides with "VIP 1".
        const wanted = squashTable(value);
        const clash = roster.find(
            (pair) =>
                pair.intentId !== intentId &&
                pair.tableNumber !== null &&
                squashTable(pair.tableNumber) === wanted
        );
        if (wanted && clash) {
            appToast.error(
                `Table ${wanted} is already ${clash.people.map((p) => p.name.split(" ")[0]).join(" & ")}'s.`
            );
            return;
        }

        const result = await setTable(intentId, value);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    const handleUndo = async (intentId: string): Promise<void> => {
        if (!window.confirm("Undo this check-in? Only do this if the wrong couple was marked.")) return;
        const result = await undo(intentId);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    const searching = query.trim().length >= MIN_QUERY;

    return (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="eyebrow">At the door</span>
                    <h1 className="mt-1 font-luxury text-foreground">Check-in</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {admin.firstName} on the gate · seat them now, admit them later
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        The check-in team works the door at{" "}
                        <Link href="/tables" className="underline underline-offset-4">
                            /tables
                        </Link>{" "}
                        — tables are assigned here only.
                    </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin">
                            <ArrowLeft size={16} /> Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/check-in/qr">
                            <QrCode size={16} /> Table QR poster
                        </Link>
                    </Button>
                </div>
            </div>

            <form
                onSubmit={(e) => e.preventDefault()}
                className="relative mt-6"
                role="search"
            >
                <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name, email, phone, code or table…"
                    className="h-14 pl-12 pr-24 text-lg"
                    // Gate phones: no autocorrect turning a surname into a word.
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
            </form>

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
                            Either of their names, either email, either phone number, the
                            code on their invitation — or a table, to see whose it is.
                        </p>
                    </div>
                )}

                {searching && results.length === 0 && !loading && (
                    <div className="p-10 text-center">
                        <p className="font-medium text-foreground">Nobody matches “{query}”</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Only approved, paid pairings are on this list. If they insist they
                            paid, check the Pairings tab before turning anyone away.
                        </p>
                    </div>
                )}

                {results.map((pair) => (
                    <CheckInCard
                        key={pair.intentId}
                        pair={pair}
                        busy={busyId === pair.intentId}
                        onCheckIn={(id) => void handleCheckIn(id)}
                        onUndo={(id) => void handleUndo(id)}
                        onSetTable={(id, value) => void handleSetTable(id, value)}
                    />
                ))}
            </div>
        </section>
    );
};

export default GateCheckIn;
