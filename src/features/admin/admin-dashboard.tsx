"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, LogOut, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAdminStore } from "@/store/admin.store";

const dateFmt = new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const AdminDashboard = (): React.JSX.Element => {
    const admin = useAdminStore((s) => s.admin);
    const rows = useAdminStore((s) => s.registrations);
    const total = useAdminStore((s) => s.total);
    const page = useAdminStore((s) => s.page);
    const pageSize = useAdminStore((s) => s.pageSize);
    const loading = useAdminStore((s) => s.loading);
    const search = useAdminStore((s) => s.search);
    const setSearch = useAdminStore((s) => s.setSearch);
    const load = useAdminStore((s) => s.load);
    const logout = useAdminStore((s) => s.logout);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const handleSearch = (e: React.FormEvent): void => {
        e.preventDefault();
        void load({ page: 1, search });
    };

    return (
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
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
                <div className="inline-flex items-center gap-2 rounded-token bg-accent/50 px-4 py-2 text-sm font-medium text-foreground">
                    <Users size={16} className="text-primary" /> {total} registered
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

            <div className="surface mt-4 overflow-hidden p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Finalist</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead className="hidden md:table-cell">Department</TableHead>
                            <TableHead className="hidden sm:table-cell">Contact</TableHead>
                            <TableHead className="text-right">Registered</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={r.photoUrl}
                                            alt={r.firstName}
                                            width={36}
                                            height={36}
                                            className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                                        />
                                        <span className="font-medium text-foreground">
                                            {r.firstName} {r.lastName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                                        {r.level}
                                    </span>
                                </TableCell>
                                <TableCell className="hidden text-foreground/80 md:table-cell">
                                    {r.department ?? "—"}
                                </TableCell>
                                <TableCell className="hidden text-foreground/80 sm:table-cell">
                                    {r.email ?? r.phoneNumber ?? "—"}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {dateFmt.format(new Date(r.createdAt))}
                                </TableCell>
                            </TableRow>
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
                            {search ? "Try a different search." : "They'll appear here as finalists register."}
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
        </section>
    );
};

export default AdminDashboard;
