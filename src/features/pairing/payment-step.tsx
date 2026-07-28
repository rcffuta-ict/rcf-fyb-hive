"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { BadgeCheck, Check, Clock, Copy, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";
import { formatMoney } from "@/config/site";
import { usePairingStore } from "@/store/pairing.store";
import { useSettingsStore } from "@/store/settings.store";
import RefundNotice from "./refund-notice";

/**
 * Final step — how to pay, and what to write on the transfer.
 *
 * The account details sit behind an acknowledgement checkbox on purpose. This
 * is real money and the pairing can still be lost to a faster payer, so the
 * rule gets read before it can be acted on rather than after.
 */

const CopyRow = ({ label, value }: { label: string; value: string }): React.JSX.Element => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            appToast.error("Couldn't copy — long-press to select it instead.");
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="truncate font-medium text-foreground">{value}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void handleCopy()}>
                {copied ? <Check size={15} className="text-primary" /> : <Copy size={15} />}
                <span className="sr-only">Copy {label}</span>
            </Button>
        </div>
    );
};

const PaymentStep = (): React.JSX.Element | null => {
    const code = usePairingStore((s) => s.code);
    const amount = usePairingStore((s) => s.amount);
    const partner = usePairingStore((s) => s.partner);
    const associate = usePairingStore((s) => s.associate);
    const existingStatus = usePairingStore((s) => s.existingStatus);
    const reset = usePairingStore((s) => s.reset);

    const [acknowledged, setAcknowledged] = useState(false);

    // Bank details come from admin settings, not site.config.json — the
    // organizers can correct an account number without a redeploy.
    const bankName = useSettingsStore((s) => s.bankName);
    const accountName = useSettingsStore((s) => s.accountName);
    const accountNumber = useSettingsStore((s) => s.accountNumber);

    const alreadyApproved = existingStatus === "approved";

    useEffect(() => {
        // No confetti for a pairing that merely already existed — celebrating a
        // lookup would be odd, and an approved pair has already had its moment.
        if (existingStatus) return;

        const timer = setTimeout(() => {
            void confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.3 },
                colors: ["#e8c77b", "#b38841", "#550b18"],
                disableForReducedMotion: true,
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [existingStatus]);

    if (!code) return null;

    const dateName = partner?.firstName ?? associate?.name.split(" ")[0] ?? "your date";
    const narration = `FYB PAIR ${code}`;

    return (
        <div className="mx-auto max-w-md animate-fade-in text-center">
            <div className="surface p-8">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
                    {alreadyApproved ? (
                        <BadgeCheck size={24} />
                    ) : existingStatus ? (
                        <Clock size={24} />
                    ) : (
                        <PartyPopper size={24} />
                    )}
                </div>

                <h2 className="font-luxury text-2xl text-foreground">
                    {alreadyApproved
                        ? `You and ${dateName} are locked in`
                        : existingStatus
                          ? `You and ${dateName} are already paired`
                          : `You and ${dateName} are on the way`}
                </h2>
                <p className="mt-2 text-sm text-foreground/70">
                    {alreadyApproved
                        ? "Payment confirmed. Your invitation is in your inbox — that email is your entry pass."
                        : existingStatus
                          ? "This pairing already exists, so here's the same code as before — not a new one. It's still waiting on payment."
                          : `One transfer left. Send ${formatMoney(amount)} and put the code below in the narration so the organizers can find it.`}
                </p>

                <div className="mt-6 rounded-token border-2 border-primary/40 bg-accent/60 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                        Payment narration
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold tracking-[0.15em] text-secondary">
                        {narration}
                    </p>
                </div>

                {!alreadyApproved && <RefundNotice partnerName={dateName} className="mt-5" />}

                {alreadyApproved ? null : acknowledged ? (
                    <div className="mt-5 text-left">
                        <div className="surface p-5">
                            <CopyRow label="Bank" value={bankName} />
                            <CopyRow label="Account name" value={accountName} />
                            <CopyRow label="Account number" value={accountNumber} />
                            <CopyRow label="Amount" value={formatMoney(amount)} />
                            <CopyRow label="Narration" value={narration} />
                        </div>
                        <p className="mt-4 text-center text-sm text-foreground/70">
                            Screenshot this. Once the organizers confirm your payment, both of you
                            get an invitation by email — that email is your entry pass.
                        </p>
                    </div>
                ) : (
                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-token border border-border p-4 text-left">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                        />
                        <span className="text-sm text-foreground/80">
                            I understand payment is what confirms the pairing, and that it&apos;s
                            non-refundable.
                        </span>
                    </label>
                )}

                <Button variant="outline" onClick={reset} className="mt-6 w-full">
                    {alreadyApproved ? "Done" : "Start over"}
                </Button>
            </div>
        </div>
    );
};

export default PaymentStep;
