"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DoorOpen, HeartHandshake } from "lucide-react";

import {
    approvePairIntent,
    cancelPairIntent,
    listPairIntents,
    revokePairApproval,
} from "@/actions/admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";
import type { PairIntentRecord, PairIntentStatus } from "@/types/fyb.types";
import PairIntentRow from "./pair-intent-row";

const FILTERS: { key: PairIntentStatus | "all"; label: string }[] = [
    { key: "pending", label: "Awaiting payment" },
    { key: "approved", label: "Approved" },
    { key: "cancelled", label: "Cancelled" },
    { key: "all", label: "All" },
];

const PairIntentsPanel = (): React.JSX.Element => {
    const [filter, setFilter] = useState<PairIntentStatus | "all">("pending");
    const [intents, setIntents] = useState<PairIntentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    // Bumped after any action to re-run the effect below — the fetch lives
    // entirely inside the effect so nothing sets state from outside it.
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            setLoading(true);
            const rows = await listPairIntents(filter === "all" ? undefined : filter);
            if (!active) return;
            setIntents(rows);
            setLoading(false);
        };

        void load();
        return () => {
            active = false;
        };
    }, [filter, refreshKey]);

    const run = async (
        id: string,
        action: () => Promise<{ ok: boolean; message: string }>
    ): Promise<void> => {
        setBusyId(id);
        const result = await action();
        setBusyId(null);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
        setRefreshKey((key) => key + 1);
    };

    const handleApprove = (id: string): void => {
        // Approval is irreversible and decides who loses a conflict — worth a
        // confirm, since the money has already moved by this point.
        if (!window.confirm("Confirm you've seen this payment? This is final and sends both invitations.")) return;
        void run(id, () => approvePairIntent(id));
    };

    const handleCancel = (id: string): void => {
        const reason = window.prompt("Why are you cancelling this pairing?") ?? "";
        if (!reason.trim()) return;
        void run(id, () => cancelPairIntent(id, reason.trim()));
    };

    const handleRevoke = (id: string): void => {
        const reason = window.prompt("Revoking an approved pairing — what went wrong?") ?? "";
        if (!reason.trim()) return;
        void run(id, () => revokePairApproval(id, reason.trim()));
    };

    return (
        <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <Button
                            key={f.key}
                            size="sm"
                            variant={filter === f.key ? "default" : "outline"}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>

                {/* The door is its own screen — this is the only way in. */}
                <Button size="sm" variant="secondary" asChild>
                    <Link href="/admin/check-in">
                        <DoorOpen size={14} /> Gate check-in
                    </Link>
                </Button>
            </div>

            <div className="surface mt-4 overflow-hidden p-0">
                {loading && (
                    <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
                )}

                {!loading && intents.length === 0 && (
                    <div className="p-12 text-center">
                        <HeartHandshake size={28} className="mx-auto text-muted-foreground" />
                        <p className="mt-3 font-medium text-foreground">Nothing here yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pairings appear as finalists redeem their tokens.
                        </p>
                    </div>
                )}

                {!loading &&
                    intents.map((intent) => (
                        <PairIntentRow
                            key={intent.id}
                            intent={intent}
                            busy={busyId === intent.id}
                            onApprove={handleApprove}
                            onCancel={handleCancel}
                            onRevoke={handleRevoke}
                        />
                    ))}
            </div>
        </div>
    );
};

export default PairIntentsPanel;
