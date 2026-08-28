"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";

import {
    addCheckInManager,
    listCheckInManagers,
    removeCheckInManager,
} from "@/actions/check-in-access.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/providers/ToastProvider";
import type { CheckInManager } from "@/types/fyb.types";

/**
 * The door roster: who on the registration team may admit couples.
 *
 * Deliberately a narrow grant. A manager checks couples in and nothing else —
 * they cannot assign or move a table, so the seating plan can't be rewritten at
 * the door. Anyone added must already exist in the member directory, which is
 * also what makes the name stamped on each arrival mean something.
 */
const CheckInManagersPanel = (): React.JSX.Element => {
    const [managers, setManagers] = useState<CheckInManager[]>([]);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            const rows = await listCheckInManagers();
            if (!active) return;
            setManagers(rows);
            setLoading(false);
        };

        void load();
        return () => {
            active = false;
        };
    }, [refreshKey]);

    const handleAdd = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!email.trim()) return;
        setBusy(true);
        const result = await addCheckInManager(email.trim());
        setBusy(false);
        if (result.ok) {
            appToast.success(result.message);
            setEmail("");
            setRefreshKey((key) => key + 1);
            return;
        }
        appToast.error(result.message);
    };

    const handleRemove = async (manager: CheckInManager): Promise<void> => {
        if (!window.confirm(`Remove ${manager.firstName} from the check-in team?`)) return;
        setBusy(true);
        const result = await removeCheckInManager(manager.profileId);
        setBusy(false);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
        setRefreshKey((key) => key + 1);
    };

    return (
        <div className="mt-4">
            <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Their member email…"
                    className="h-11 min-w-0 flex-1 sm:max-w-sm"
                    autoComplete="off"
                    required
                />
                <Button type="submit" disabled={busy}>
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    Add to door
                </Button>
            </form>

            <p className="mt-2 text-xs text-muted-foreground">
                They sign in at <span className="font-medium text-foreground">/tables</span> —
                the same page the QR poster opens — and can check couples in, but never
                assign or change a table.
            </p>

            <div className="surface mt-4 overflow-hidden p-0">
                {loading && (
                    <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
                )}

                {!loading && managers.length === 0 && (
                    <div className="p-10 text-center">
                        <ShieldCheck size={26} className="mx-auto text-muted-foreground" />
                        <p className="mt-3 font-medium text-foreground">Nobody on the door yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Organizers can always check couples in — this list is for the
                            registration team.
                        </p>
                    </div>
                )}

                {managers.map((manager) => (
                    <div
                        key={manager.profileId}
                        className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                                {manager.firstName} {manager.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {manager.email ?? "No email on file"}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => void handleRemove(manager)}
                        >
                            <Trash2 size={14} /> Remove
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CheckInManagersPanel;
