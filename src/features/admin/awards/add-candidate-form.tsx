"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import {
    addCandidateById,
    lookupFinalist,
    type FinalistLookup,
} from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounced } from "@/hooks/use-debounced";
import { appToast } from "@/providers/ToastProvider";
import FinalistPreview from "./finalist-preview";

/**
 * Add a candidate by their dinner email — validated as it's typed.
 *
 * The old form took the email on trust and only argued on submit, which put the
 * two things an admin gets wrong (wrong address, person already standing) after
 * the click instead of before it. Here the address resolves to a face and a
 * verdict first, and Add is only live once that verdict is good.
 */
const AddCandidateForm = ({
    categoryId,
    onAdded,
}: {
    categoryId: string;
    onAdded: () => void;
}): React.JSX.Element => {
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [lookup, setLookup] = useState<FinalistLookup | null>(null);
    const [checking, setChecking] = useState(false);
    const [busy, setBusy] = useState(false);

    const typed = useDebounced(email.trim());

    useEffect(() => {
        let active = true;

        const check = async (): Promise<void> => {
            if (!typed) {
                setLookup(null);
                setChecking(false);
                return;
            }
            setChecking(true);
            const result = await lookupFinalist(categoryId, typed);
            if (!active) return;
            setLookup(result);
            setChecking(false);
        };

        void check();
        return () => {
            active = false;
        };
    }, [categoryId, typed]);

    const ready = lookup?.status === "ok";

    const handleAdd = async (): Promise<void> => {
        if (!ready) return;

        setBusy(true);
        const result = await addCandidateById({
            categoryId,
            registrationId: lookup.finalist.registrationId,
            nickname,
        });
        setBusy(false);

        if (!result.ok) {
            appToast.error(result.message);
            return;
        }

        appToast.success(result.message);
        setEmail("");
        setNickname("");
        setLookup(null);
        onAdded();
    };

    return (
        <div className="mt-4">
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative sm:flex-1">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Their dinner registration email"
                        aria-label="Finalist's dinner email"
                    />
                    {checking && (
                        <Loader2
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                        />
                    )}
                </div>

                <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
                    placeholder="Nickname for this category"
                    aria-label="Nickname for this category"
                    className="sm:flex-1"
                />

                <Button
                    onClick={() => void handleAdd()}
                    disabled={busy || !ready || !nickname.trim()}
                >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Add
                </Button>
            </div>

            {lookup?.status === "not_found" && lookup.message && (
                <p className="mt-2 text-xs text-destructive">{lookup.message}</p>
            )}

            {lookup && lookup.status !== "not_found" && (
                <FinalistPreview
                    finalist={lookup.finalist}
                    valid={lookup.status === "ok"}
                    note={
                        lookup.status === "standing"
                            ? "Already standing in this category."
                            : lookup.status === "no_token"
                              ? lookup.message
                              : "Registered finalist — good to stand."
                    }
                />
            )}
        </div>
    );
};

export default AddCandidateForm;
