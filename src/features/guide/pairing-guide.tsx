"use client";

import { AlertTriangle, KeyRound, Lock, Users } from "lucide-react";

import { formatMoney, site } from "@/config/site";
import { useFeature } from "@/store/settings.store";

/**
 * Pairing half of the guide. Rendered only when pairing is live, so the guide
 * grows with the app rather than describing a page nobody can open yet.
 */

const steps = [
    {
        icon: KeyRound,
        title: "Bring your token",
        body: "Open the pairing page and enter the consent token we emailed you. Your profile comes up — that's how you prove it's yours.",
    },
    {
        icon: Users,
        title: "Add your date",
        body: "Either a fellow finalist — you'll need their token too, so ask them for it — or an associate: someone outside the fellowship, whose details you fill in yourself.",
    },
    {
        icon: Lock,
        title: "Pay to lock it in",
        body: "You'll get a narration code. Transfer the fee with that code so the organizers can match it to you on the bank statement.",
    },
    {
        icon: KeyRound,
        title: "Get your invitation",
        body: "Once the organizers confirm your payment, both of you receive an invitation email. That email is your entry pass — bring it on the night.",
    },
];

const rules = [
    "The dinner pairs a brother with a sister — that's how the tokens are checked.",
    "Until payment is confirmed, nothing is reserved. Someone else can still pair with your date.",
    "Whoever's payment is confirmed first gets the pairing. That's the only tiebreaker.",
    "Payments are not refunded — not if you lose a conflict, not if a pairing is cancelled.",
    "Once a pairing is approved, both people are locked in. It can't be swapped.",
];

const PairingGuide = (): React.JSX.Element | null => {
    const live = useFeature("pairing");
    if (!live) return null;

    return (
        <>
            <h2 className="mt-14 text-center font-luxury text-2xl text-foreground">
                Pairing up
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-foreground/70">
                No date, no entry. Here&apos;s how you and your date get through the door.
            </p>

            <ol className="mt-8 space-y-4">
                {steps.map((step, index) => (
                    <li key={step.title} className="surface flex gap-4 p-6">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                            <step.icon size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                                Step {index + 1}
                            </span>
                            <h3 className="mt-1 font-luxury text-xl text-foreground">
                                {step.title}
                            </h3>
                            <p className="mt-1.5 leading-relaxed text-foreground/70">
                                {step.body}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className="surface mt-8 border-primary/30 p-7">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="shrink-0 text-primary" />
                    <h3 className="font-luxury text-xl text-foreground">
                        The money rules — read these
                    </h3>
                </div>
                <p className="mt-3 leading-relaxed text-foreground/70">
                    The fee is {formatMoney(site.payment.amount)} per pair, paid by transfer to
                    the account shown when you pair.
                </p>
                <ul className="mt-4 space-y-2.5">
                    {rules.map((rule) => (
                        <li key={rule} className="flex gap-2.5 text-foreground/70">
                            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{rule}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default PairingGuide;
