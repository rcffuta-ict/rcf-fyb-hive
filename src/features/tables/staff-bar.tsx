"use client";

import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkInLogin, checkInLogout } from "@/actions/check-in-access.action";
import { appToast } from "@/providers/ToastProvider";
import type { CheckInManager } from "@/types/fyb.types";

/**
 * The door team's way in, on the page everyone else uses to find their seat.
 *
 * Folded away behind one small link until asked for: the guest reading this
 * page in a doorway should see a seating list, not a login form. Signed in, it
 * becomes the bar that says whose name will be stamped on every arrival.
 */
type Props = {
    manager: CheckInManager | null;
    onChange: () => void;
};

const StaffBar = ({ manager, onChange }: Props): React.JSX.Element => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);

    const handleSignIn = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!email.trim()) return;
        setBusy(true);
        const result = await checkInLogin(email.trim());
        setBusy(false);
        if (!result.ok) {
            appToast.error(result.message ?? "Could not sign you in.");
            return;
        }
        setOpen(false);
        setEmail("");
        appToast.success(`Signed in — arrivals will be stamped ${result.manager?.firstName}.`);
        onChange();
    };

    const handleSignOut = async (): Promise<void> => {
        await checkInLogout();
        appToast.success("Signed out.");
        onChange();
    };

    if (manager) {
        return (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-token border border-primary/30 bg-primary/5 px-4 py-2.5">
                <p className="text-sm text-foreground">
                    <ShieldCheck size={14} className="mr-1.5 inline text-primary" />
                    Checking in as{" "}
                    <span className="font-semibold">
                        {manager.firstName} {manager.lastName}
                    </span>
                    {manager.isAdmin && (
                        <span className="ml-1 text-xs text-muted-foreground">(organizer)</span>
                    )}
                </p>
                <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                    <LogOut size={14} /> Sign out
                </Button>
            </div>
        );
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-6 block w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
                Check-in team? Sign in
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSignIn}
            className="mt-6 flex flex-wrap items-center gap-2 rounded-token border border-border bg-card/60 p-3"
        >
            <Input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="h-10 min-w-0 flex-1"
                required
            />
            <Button type="submit" disabled={busy}>
                {busy ? "Checking…" : "Sign in"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
            </Button>
        </form>
    );
};

export default StaffBar;
