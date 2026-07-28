"use client";

import { LogOut, MailPlus, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/providers/ToastProvider";
import { useAdminStore } from "@/store/admin.store";

/** Title bar, registration count, consent-email backfill and search. */
const DashboardHeader = (): React.JSX.Element => {
    const admin = useAdminStore((s) => s.admin);
    const total = useAdminStore((s) => s.total);
    const search = useAdminStore((s) => s.search);
    const setSearch = useAdminStore((s) => s.setSearch);
    const load = useAdminStore((s) => s.load);
    const logout = useAdminStore((s) => s.logout);
    const backfilling = useAdminStore((s) => s.backfilling);
    const backfillConsent = useAdminStore((s) => s.backfillConsent);

    const handleSearch = (e: React.FormEvent): void => {
        e.preventDefault();
        void load({ page: 1, search });
    };

    const handleBackfill = async (): Promise<void> => {
        // This can send hundreds of emails at once — always confirm first.
        const confirmed = window.confirm(
            "Send the consent token email to every registered finalist who hasn't received one yet?"
        );
        if (!confirmed) return;

        const result = await backfillConsent();
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="eyebrow">Organizer dashboard</span>
                    <h1 className="mt-1 font-luxury text-foreground">Registrations</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Signed in as {admin?.firstName} {admin?.lastName}
                    </p>
                </div>
                <Button variant="ghost" onClick={() => void logout()}>
                    <LogOut size={16} /> Sign out
                </Button>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-token bg-accent/50 px-4 py-2 text-sm font-medium text-foreground">
                        <Users size={16} className="text-primary" /> {total} registered
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={backfilling}
                        onClick={() => void handleBackfill()}
                    >
                        <MailPlus size={16} />
                        {backfilling ? "Sending…" : "Send pending consent emails"}
                    </Button>
                </div>
                <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone…"
                        className="h-10 pl-10"
                    />
                </form>
            </div>
        </>
    );
};

export default DashboardHeader;
