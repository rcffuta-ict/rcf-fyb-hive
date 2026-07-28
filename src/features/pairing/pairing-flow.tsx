"use client";

import { useEffect } from "react";

import { usePairingStore } from "@/store/pairing.store";
import AssociateStep from "./associate-step";
import MatchedStep from "./matched-step";
import PartnerStep from "./partner-step";
import PaymentStep from "./payment-step";
import TokenStep from "./token-step";
import VibeFeed from "./vibe-feed";

const PairingFlow = (): React.JSX.Element => {
    const step = usePairingStore((s) => s.step);
    const reset = usePairingStore((s) => s.reset);

    // Start every visit fresh, matching the registration flow — stale state
    // here would mean showing someone else's card.
    useEffect(() => {
        reset();
    }, [reset]);

    return (
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
            <div className="text-center">
                <span className="eyebrow mb-3">No date, no entry</span>
                <h1 className="font-luxury text-foreground">Pair up</h1>
                <p className="mx-auto mt-3 max-w-md text-foreground/70">
                    Your consent token is how you say yes. Bring it, bring theirs, and
                    you&apos;re in.
                </p>
            </div>

            <div className="mt-10">
                {step === "token" && <TokenStep />}
                {step === "matched" && <MatchedStep />}
                {step === "partner" && <PartnerStep />}
                {step === "associate" && <AssociateStep />}
                {step === "payment" && <PaymentStep />}
            </div>

            {step === "token" && <VibeFeed />}
        </section>
    );
};

export default PairingFlow;
