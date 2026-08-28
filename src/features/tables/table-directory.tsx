"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Armchair, RefreshCw, Search } from "lucide-react";

import { checkInPair, loadSeating, undoCheckIn } from "@/actions/check-in.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/providers/ToastProvider";
import type { SeatedPair } from "@/services/check-in.service";
import type { CheckInManager } from "@/types/fyb.types";
import SeatRow from "./seat-row";
import StaffBar from "./staff-bar";

/**
 * The seating plan, as a guest reads it off their phone in a doorway — and as
 * the registration team works it at the door.
 *
 * Everybody is listed by default: this is a wall chart, and the first thing
 * anyone does with one is scan it. The search box is for the person who has
 * been scanning for a minute, and for the manager with a couple in front of
 * them.
 */
const TableDirectory = ({
    pairs: initial,
    manager,
}: {
    pairs: SeatedPair[];
    manager: CheckInManager | null;
}): React.JSX.Element => {
    const router = useRouter();
    const [pairs, setPairs] = useState(initial);
    const [query, setQuery] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [refreshing, startRefresh] = useTransition();

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

    const handleRefresh = (): void => {
        startRefresh(async () => {
            setPairs(await loadSeating());
        });
    };

    /** Both door actions are the same shape: run it, patch that one row. */
    const run = async (
        intentId: string,
        action: () => Promise<{ ok: boolean; message: string }>,
        checkedIn: boolean
    ): Promise<void> => {
        setBusyId(intentId);
        const result = await action();
        setBusyId(null);

        if (!result.ok) {
            appToast.error(result.message);
            // A refusal usually means somebody else got there first — the list
            // in hand is stale, so replace it rather than argue with it.
            handleRefresh();
            return;
        }

        appToast.success(result.message);
        setPairs((current) =>
            current.map((pair) =>
                pair.intentId === intentId ? { ...pair, checkedIn } : pair
            )
        );
    };

    const inside = pairs.filter((pair) => pair.checkedIn).length;

    return (
        <>
            <StaffBar manager={manager} onChange={() => router.refresh()} />

            <div className="relative mt-4">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Your name, or a table…"
                    className="h-13 pl-12 pr-12 text-base"
                    autoCapitalize="none"
                    autoCorrect="off"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={refreshing}
                    onClick={handleRefresh}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    title="Reload the seating list"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : undefined} />
                </Button>
            </div>

            {manager && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    {inside} of {pairs.length} seated couples are inside.
                </p>
            )}

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
                    <SeatRow
                        key={pair.intentId}
                        pair={pair}
                        staffing={Boolean(manager)}
                        busy={busyId === pair.intentId}
                        onCheckIn={(id) =>
                            void run(id, () => checkInPair(id), true)
                        }
                        onUndo={(id) => void run(id, () => undoCheckIn(id), false)}
                    />
                ))}
            </ul>
        </>
    );
};

export default TableDirectory;
