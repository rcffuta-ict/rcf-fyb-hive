"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { appToast } from "@/providers/ToastProvider";
import { useAdminStore } from "@/store/admin.store";
import RegistrationRow from "./registration-row";

/** The registrations table — extracted so the dashboard can host tabs. */
const RegistrationsPanel = (): React.JSX.Element => {
    const rows = useAdminStore((s) => s.registrations);
    const total = useAdminStore((s) => s.total);
    const page = useAdminStore((s) => s.page);
    const pageSize = useAdminStore((s) => s.pageSize);
    const loading = useAdminStore((s) => s.loading);
    const search = useAdminStore((s) => s.search);
    const load = useAdminStore((s) => s.load);
    const resendingId = useAdminStore((s) => s.resendingId);
    const resendConsent = useAdminStore((s) => s.resendConsent);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const handleResend = async (id: string): Promise<void> => {
        const result = await resendConsent(id);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    return (
        <>
            <div className="surface mt-4 overflow-hidden p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Finalist</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead className="hidden md:table-cell">Unit</TableHead>
                            <TableHead className="hidden sm:table-cell">Contact</TableHead>
                            <TableHead>Consent email</TableHead>
                            <TableHead className="text-right">Registered</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r) => (
                            <RegistrationRow
                                key={r.id}
                                registration={r}
                                resending={resendingId === r.id}
                                onResend={(id) => void handleResend(id)}
                            />
                        ))}
                    </TableBody>
                </Table>

                {loading && (
                    <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
                )}
                {!loading && rows.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="font-medium text-foreground">No registrations found</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {search
                                ? "Try a different search."
                                : "They'll appear here as finalists register."}
                        </p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => void load({ page: page - 1 })}
                    >
                        <ChevronLeft size={16} /> Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || loading}
                        onClick={() => void load({ page: page + 1 })}
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            )}
        </>
    );
};

export default RegistrationsPanel;
