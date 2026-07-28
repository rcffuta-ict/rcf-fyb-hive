"use client";

import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePairingStore } from "@/store/pairing.store";

/** Step 1 — the finalist identifies themselves with their own consent token. */
const TokenStep = (): React.JSX.Element => {
    const tokenInput = usePairingStore((s) => s.tokenInput);
    const setTokenInput = usePairingStore((s) => s.setTokenInput);
    const resolveSelf = usePairingStore((s) => s.resolveSelf);
    const resolving = usePairingStore((s) => s.resolving);
    const error = usePairingStore((s) => s.error);

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        void resolveSelf();
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-md animate-fade-in">
            <div className="surface p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
                    <KeyRound size={24} />
                </div>

                <h2 className="font-luxury text-2xl text-foreground">Start with your token</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-foreground/70">
                    The one we emailed when you registered. Four characters, like FYB-7K2M —
                    capitals don&apos;t matter.
                </p>

                <Input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="FYB-••••"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="mt-6 h-14 text-center font-mono text-xl tracking-[0.3em]"
                    aria-label="Your consent token"
                    aria-invalid={Boolean(error)}
                />

                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

                <Button
                    type="submit"
                    size="lg"
                    disabled={resolving || !tokenInput.trim()}
                    className="sheen mt-6 w-full"
                >
                    {resolving ? <Loader2 size={18} className="animate-spin" /> : null}
                    {resolving ? "Looking you up…" : "Continue"}
                </Button>

                <p className="mt-4 text-xs text-muted-foreground">
                    Lost it? Ask the organizers to resend — you&apos;ll get the same token back.
                </p>
            </div>
        </form>
    );
};

export default TokenStep;
