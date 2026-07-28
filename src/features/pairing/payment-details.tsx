"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";

import { appToast } from "@/providers/ToastProvider";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The transfer instructions.
 *
 * Everything here is one tap to copy, because the alternative is someone
 * squinting at a 10-digit account number and typing it wrong. The narration
 * gets the loudest treatment: a transfer without it is money the organizers
 * can't match to anybody, which is the single most expensive mistake on this
 * screen.
 */

/** Copy with a fallback for browsers that block the async clipboard API. */
const copyText = async (value: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        // Older mobile browsers, or a non-secure context.
        try {
            const area = document.createElement("textarea");
            area.value = value;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(area);
            return ok;
        } catch {
            return false;
        }
    }
};

const useCopy = (): [string | null, (key: string, value: string) => void] => {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = (key: string, value: string): void => {
        void copyText(value).then((ok) => {
            if (!ok) {
                appToast.error("Couldn't copy — press and hold to select it instead.");
                return;
            }
            setCopied(key);
            setTimeout(() => setCopied((current) => (current === key ? null : current)), 2000);
        });
    };

    return [copied, copy];
};

type Props = {
    bankName: string;
    accountName: string;
    accountNumber: string;
    amountLabel: string;
    narration: string;
};

const PaymentDetails = ({
    bankName,
    accountName,
    accountNumber,
    amountLabel,
    narration,
}: Props): React.JSX.Element => {
    const [copied, copy] = useCopy();

    // Never render an empty account. If settings are missing or half-saved,
    // say so loudly — a blank field on a payment screen reads as a broken page
    // and gets money sent nowhere.
    if (!accountNumber.trim() || !bankName.trim() || !accountName.trim()) {
        return (
            <div className="mt-5 flex gap-3 rounded-token border-2 border-destructive/50 bg-destructive/10 p-5 text-left">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
                <div>
                    <p className="text-sm font-semibold text-destructive">
                        The payment account isn&apos;t set up yet
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">
                        Your pairing is saved under <strong>{narration}</strong> — nothing is
                        lost. Please screenshot this and send it to the organizers at{" "}
                        <a href={`mailto:${site.contact.email}`} className="text-primary underline">
                            {site.contact.email}
                        </a>{" "}
                        so they can add the account details.
                    </p>
                </div>
            </div>
        );
    }

    const rows = [
        { key: "bank", label: "Bank", value: bankName },
        { key: "name", label: "Account name", value: accountName },
        { key: "amount", label: "Amount", value: amountLabel },
    ];

    return (
        <div className="mt-5 text-left">
            {/* Account number — the thing they'll actually paste into their app. */}
            <button
                type="button"
                onClick={() => copy("number", accountNumber)}
                className="surface-interactive flex w-full items-center justify-between gap-3 p-5 text-left"
            >
                <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                        Account number
                    </span>
                    <span className="block font-mono text-2xl font-bold tracking-[0.12em] text-foreground">
                        {accountNumber}
                    </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
                    {copied === "number" ? <Check size={16} /> : <Copy size={16} />}
                    {copied === "number" ? "Copied" : "Copy"}
                </span>
            </button>

            <div className="surface mt-3 p-5">
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="flex items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0"
                    >
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {row.label}
                            </p>
                            <p className="truncate font-medium text-foreground">{row.value}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => copy(row.key, row.value)}
                            className="flex shrink-0 items-center gap-1.5 rounded-token px-2.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-accent"
                        >
                            {copied === row.key ? <Check size={15} /> : <Copy size={15} />}
                            <span className="sr-only">Copy {row.label}</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Narration last and loudest: without it, a transfer can't be matched. */}
            <div
                className={cn(
                    "mt-3 rounded-token border-2 border-primary/50 bg-accent/60 p-5",
                    copied === "narration" && "border-primary"
                )}
            >
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    Put this in the narration — don&apos;t skip it
                </p>
                <p className="mt-2 break-all font-mono text-xl font-bold tracking-[0.12em] text-secondary">
                    {narration}
                </p>
                <button
                    type="button"
                    onClick={() => copy("narration", narration)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-token bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
                >
                    {copied === "narration" ? <Check size={16} /> : <Copy size={16} />}
                    {copied === "narration" ? "Narration copied" : "Copy narration"}
                </button>
                <p className="mt-2.5 text-xs text-muted-foreground">
                    A transfer without this code can&apos;t be matched to you, and confirming it
                    will take much longer.
                </p>
            </div>
        </div>
    );
};

export default PaymentDetails;
