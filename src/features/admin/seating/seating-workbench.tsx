"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Armchair, QrCode, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckInRoster } from "@/hooks/use-check-in-roster";
import { searchPairs, squashTable } from "@/lib/pair-search";
import { appToast } from "@/providers/ToastProvider";
import type { AdminProfile, CheckInPair } from "@/types/fyb.types";
import SeatingRow from "./seating-row";

/**
 * The seating plan, built one couple at a time.
 *
 * This is an organizer's screen, not the door — there is no check-in button on
 * it. It opens on the couples with no table, because that list is the work: it
 * starts as everybody and is finished when it is empty.
 *
 * The whole roster is listed rather than hidden behind a search, which is the
 * opposite of the door's rule. Seating is done in one sitting, in order; the
 * door is done one couple at a time, out of order.
 */
type Filter = "unassigned" | "assigned" | "all";

const FILTERS: { key: Filter; label: string }[] = [
    { key: "unassigned", label: "Unassigned" },
    { key: "assigned", label: "Assigned" },
    { key: "all", label: "All" },
];

const matchesFilter = (pair: CheckInPair, filter: Filter): boolean => {
    if (filter === "unassigned") return !pair.tableNumber;
    if (filter === "assigned") return Boolean(pair.tableNumber);
    return true;
};

const SeatingWorkbench = ({ admin }: { admin: AdminProfile }): React.JSX.Element => {
    const [filter, setFilter] = useState<Filter>("unassigned");
    const [query, setQuery] = useState("");
    const { roster, loading, busyId, refresh, setTable } = useCheckInRoster(
        `${admin.firstName} ${admin.lastName}`.trim()
    );

    const counts = useMemo(
        () => ({
            unassigned: roster.filter((pair) => !pair.tableNumber).length,
            assigned: roster.filter((pair) => pair.tableNumber).length,
            all: roster.length,
        }),
        [roster]
    );

    const results = useMemo(() => {
        const inTab = roster.filter((pair) => matchesFilter(pair, filter));
        // Search narrows the tab rather than replacing it, so "assigned + R"
        // means what it looks like.
        const found = query.trim() ? searchPairs(inTab, query, 200) : inTab;
        // Unseated first inside a mixed list — they are the outstanding work.
        return [...found].sort(
            (a, b) => Number(Boolean(a.tableNumber)) - Number(Boolean(b.tableNumber))
        );
    }, [roster, filter, query]);

    const handleSetTable = async (intentId: string, value: string): Promise<void> => {
        // The roster in hand already knows most clashes, so the common case is
        // answered without a round trip. The unique index is still the
        // authority — this only spares a wasted trip to the server.
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

    return (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="eyebrow">Before the doors open</span>
                    <h1 className="mt-1 font-luxury text-foreground">Seating plan</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {counts.assigned} of {counts.all} couples seated
                        {counts.unassigned > 0 && ` · ${counts.unassigned} to go`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        The door is worked at{" "}
                        <Link href="/tables" className="underline underline-offset-4">
                            /tables
                        </Link>{" "}
                        — couples are admitted there, seated here.
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

            <div className="mt-6 flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
                    <Button
                        key={f.key}
                        size="sm"
                        variant={filter === f.key ? "default" : "outline"}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                        <span className="ml-1 opacity-70">{counts[f.key]}</span>
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={refresh}
                    title="Reload the roster"
                    className="ml-auto"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : undefined} />
                </Button>
            </div>

            <div className="relative mt-3">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Narrow this tab — name, email, phone, code or table…"
                    className="h-11 pl-10"
                    autoCapitalize="none"
                    autoCorrect="off"
                />
            </div>

            <div className="surface mt-4 overflow-hidden p-0">
                {loading && roster.length === 0 && (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                        Loading couples…
                    </p>
                )}

                {!loading && results.length === 0 && (
                    <div className="p-12 text-center">
                        <Armchair size={28} className="mx-auto text-muted-foreground" />
                        <p className="mt-3 font-medium text-foreground">
                            {query
                                ? `Nobody matches “${query}” here`
                                : filter === "unassigned"
                                  ? "Everyone has a table"
                                  : "Nothing in this tab yet"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {filter === "unassigned" && !query
                                ? "The plan is complete — the door can seat every approved couple."
                                : "Approved pairings appear here as payments are confirmed."}
                        </p>
                    </div>
                )}

                {results.map((pair) => (
                    <SeatingRow
                        key={pair.intentId}
                        pair={pair}
                        busy={busyId === pair.intentId}
                        onSetTable={(id, value) => void handleSetTable(id, value)}
                    />
                ))}
            </div>
        </section>
    );
};

export default SeatingWorkbench;
