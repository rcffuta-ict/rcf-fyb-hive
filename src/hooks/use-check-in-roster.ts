"use client";

import { useCallback, useEffect, useState } from "react";

import {
    assignTableNumber,
    checkInPair,
    loadCheckInRoster,
    undoCheckIn,
    type CheckInResult,
    type TableResult,
} from "@/actions/check-in.action";
import type { CheckInPair } from "@/types/fyb.types";

/**
 * The gate's copy of the approved roster.
 *
 * Fetched once and held in memory so searching is instant and survives the
 * venue's wifi. Only the mutations go back to the server, and each one patches
 * its own row in place rather than refetching everything — a reload mid-queue
 * would lose the search the operator is standing in.
 */
export type CheckInRoster = {
    roster: CheckInPair[];
    loading: boolean;
    busyId: string | null;
    refresh: () => void;
    checkIn: (intentId: string) => Promise<CheckInResult>;
    undo: (intentId: string) => Promise<CheckInResult>;
    setTable: (intentId: string, value: string) => Promise<TableResult>;
};

export const useCheckInRoster = (adminName: string): CheckInRoster => {
    const [roster, setRoster] = useState<CheckInPair[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    // Bumped by `refresh` so the fetch stays entirely inside the effect — the
    // only state written outside it is by the mutations below.
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            const rows = await loadCheckInRoster();
            if (!active) return;
            setRoster(rows);
            setLoading(false);
        };

        void load();
        return () => {
            active = false;
        };
    }, [reloadKey]);

    const refresh = useCallback((): void => {
        setLoading(true);
        setReloadKey((key) => key + 1);
    }, []);

    /** Run one mutation, then fold its result into that row and nothing else. */
    const run = useCallback(
        async <T extends { ok: boolean }>(
            intentId: string,
            action: () => Promise<T>,
            patch: (result: T) => Partial<CheckInPair>
        ): Promise<T> => {
            setBusyId(intentId);
            const result = await action();
            setBusyId(null);

            if (result.ok) {
                setRoster((current) =>
                    current.map((pair) =>
                        pair.intentId === intentId
                            ? { ...pair, ...patch(result) }
                            : pair
                    )
                );
            }
            return result;
        },
        []
    );

    return {
        roster,
        loading,
        busyId,
        refresh,
        checkIn: (intentId) =>
            run(intentId, () => checkInPair(intentId), (result) => ({
                checkedInAt: result.checkedInAt ?? null,
                checkedInBy: adminName,
            })),
        undo: (intentId) =>
            run(intentId, () => undoCheckIn(intentId), () => ({
                checkedInAt: null,
                checkedInBy: null,
            })),
        setTable: (intentId, value) =>
            run(intentId, () => assignTableNumber(intentId, value), (result) => ({
                tableNumber: result.tableNumber ?? null,
            })),
    };
};
