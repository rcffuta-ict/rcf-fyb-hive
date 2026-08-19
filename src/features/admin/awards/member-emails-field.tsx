"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plus, X } from "lucide-react";

import { lookupFinalist } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FaceAvatar from "@/components/ui/face-avatar";
import { cn } from "@/lib/utils";
import type { FinalistOption } from "@/types/awards.types";

/**
 * The people behind a group entry, added one email at a time and resolved to a
 * face before they are accepted.
 *
 * A clique or a brand is the one place on this ballot where a single form
 * submission puts several people's names on a public page at once, so each
 * address is checked as it is added rather than all of them on submit. The face
 * is the check that matters: an admin catches a mistyped address by not
 * recognising the person, long before a stranger appears inside someone's
 * friend group.
 */

export type ResolvedMember = { email: string; finalist: FinalistOption };

const MemberEmailsField = ({
    categoryId,
    members,
    onChange,
    label,
    hint,
}: {
    categoryId: string;
    members: ResolvedMember[];
    onChange: (members: ResolvedMember[]) => void;
    label: string;
    hint: string;
}): React.JSX.Element => {
    const [email, setEmail] = useState("");
    const [checking, setChecking] = useState(false);
    const [problem, setProblem] = useState<string | null>(null);

    const handleAdd = async (): Promise<void> => {
        const value = email.trim().toLowerCase();
        if (!value) return;

        if (members.some((member) => member.email === value)) {
            setProblem("That person is already in this list.");
            return;
        }

        setChecking(true);
        setProblem(null);
        const result = await lookupFinalist(categoryId, value);
        setChecking(false);

        // "standing" is fine here and not elsewhere: it means they are already
        // up in this category as their own entry, which for a clique member is
        // worth flagging to the admin but is not, by itself, disallowed.
        if (result.status === "not_found" || result.status === "no_token") {
            setProblem(result.message);
            return;
        }

        onChange([...members, { email: value, finalist: result.finalist }]);
        setEmail("");
    };

    const handleRemove = (target: string): void => {
        onChange(members.filter((member) => member.email !== target));
    };

    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        void handleAdd();
                    }}
                    placeholder="Their dinner registration email"
                    aria-label={label}
                    className="sm:flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={checking || !email.trim()}
                    onClick={() => void handleAdd()}
                >
                    {checking ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <Plus size={15} />
                    )}
                    Add
                </Button>
            </div>

            <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>

            {problem && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    {problem}
                </p>
            )}

            {members.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {members.map(({ email: value, finalist }, index) => (
                        <li
                            key={value}
                            className={cn(
                                "flex items-center gap-3 rounded-token border p-2.5",
                                finalist.standing
                                    ? "border-amber-500/40 bg-amber-500/5"
                                    : "border-border"
                            )}
                        >
                            <FaceAvatar
                                src={finalist.photoUrl}
                                size={32}
                                className="h-8 w-8"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-foreground">
                                    {finalist.firstName} {finalist.lastName}
                                    {index === 0 && (
                                        <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">
                                            first named
                                        </span>
                                    )}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {finalist.level}
                                    {finalist.standing &&
                                        " · already standing in this category"}
                                </p>
                            </div>
                            {finalist.standing ? (
                                <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                            ) : (
                                <CheckCircle2 size={15} className="shrink-0 text-primary" />
                            )}
                            <button
                                type="button"
                                aria-label={`Remove ${finalist.firstName}`}
                                onClick={() => handleRemove(value)}
                                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                            >
                                <X size={15} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MemberEmailsField;
