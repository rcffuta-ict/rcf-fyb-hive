"use client";

import { ArrowLeft, HeartHandshake, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePairingStore } from "@/store/pairing.store";
import PairCard from "./pair-card";

/** Step 2 — "this is you". Then the fork: another finalist, or an associate. */
const MatchedStep = (): React.JSX.Element | null => {
    const self = usePairingStore((s) => s.self);
    const expectsTerm = usePairingStore((s) => s.expectsTerm);
    const setMode = usePairingStore((s) => s.setMode);
    const back = usePairingStore((s) => s.back);

    if (!self) return null;

    const handleChoose = (mode: "finalist" | "associate"): void => {
        setMode(mode);
        usePairingStore.setState({ step: mode === "finalist" ? "partner" : "associate" });
    };

    return (
        <div className="mx-auto max-w-md animate-fade-in">
            <PairCard card={self} caption="That's you" />

            <p className="mt-6 text-center text-sm text-foreground/70">
                Who are you bringing? The dinner pairs a brother with a sister, so
                you&apos;re looking for a <strong className="text-foreground">{expectsTerm}</strong>.
            </p>

            <div className="mt-4 space-y-3">
                <button
                    type="button"
                    onClick={() => handleChoose("finalist")}
                    className="surface-interactive sheen flex w-full items-center gap-4 p-5 text-left"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                        <HeartHandshake size={20} />
                    </span>
                    <span>
                        <span className="block font-medium text-foreground">
                            A fellow finalist
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                            They have a consent token too. You&apos;ll need it.
                        </span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => handleChoose("associate")}
                    className="surface-interactive flex w-full items-center gap-4 p-5 text-left"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                        <UserPlus size={20} />
                    </span>
                    <span>
                        <span className="block font-medium text-foreground">
                            Someone outside the fellowship
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                            We call them an associate. You fill in their details — and it takes
                            you off the market straight away.
                        </span>
                    </span>
                </button>
            </div>

            <Button variant="ghost" onClick={back} className="mt-5 w-full">
                <ArrowLeft size={16} /> Not you? Start over
            </Button>
        </div>
    );
};

export default MatchedStep;
