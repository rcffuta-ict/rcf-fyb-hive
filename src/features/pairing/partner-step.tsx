"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertOctagon, ArrowLeft, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePairingStore } from "@/store/pairing.store";
import PairCard from "./pair-card";
import RefundNotice from "./refund-notice";

/** Step 3a — pair with another finalist, using their consent token. */
const PartnerStep = (): React.JSX.Element | null => {
    const self = usePairingStore((s) => s.self);
    const partner = usePairingStore((s) => s.partner);
    const expectsTerm = usePairingStore((s) => s.expectsTerm);
    const partnerTokenInput = usePairingStore((s) => s.partnerTokenInput);
    const setPartnerTokenInput = usePairingStore((s) => s.setPartnerTokenInput);
    const resolvePartner = usePairingStore((s) => s.resolvePartner);
    const submitFinalist = usePairingStore((s) => s.submitFinalist);
    const resolving = usePairingStore((s) => s.resolving);
    const submitting = usePairingStore((s) => s.submitting);
    const error = usePairingStore((s) => s.error);
    const back = usePairingStore((s) => s.back);

    if (!self) return null;

    const handleResolve = (e: React.FormEvent): void => {
        e.preventDefault();
        void resolvePartner();
    };

    return (
        <div className="mx-auto max-w-md animate-fade-in">
            <PairCard card={self} caption="You" />

            <AnimatePresence mode="wait">
                {partner ? (
                    <motion.div key="partner" className="mt-3">
                        {/* Gold sweep: the moment the pair becomes possible. */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative"
                        >
                            <PairCard card={partner} caption="Your date" delay={0.05} />
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.form
                        key="input"
                        onSubmit={handleResolve}
                        exit={{ opacity: 0 }}
                        className="surface mt-3 p-6"
                    >
                        <label
                            htmlFor="partner-token"
                            className="text-sm font-medium text-foreground"
                        >
                            Their consent token
                        </label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ask the {expectsTerm} you&apos;re bringing for theirs.
                        </p>

                        <Input
                            id="partner-token"
                            value={partnerTokenInput}
                            onChange={(e) => setPartnerTokenInput(e.target.value)}
                            placeholder="FYB-••••"
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            className="mt-4 h-13 text-center font-mono text-lg tracking-[0.3em]"
                        />

                        <Button
                            type="submit"
                            disabled={resolving || !partnerTokenInput.trim()}
                            className="mt-4 w-full"
                        >
                            {resolving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {resolving ? "Checking…" : "Look them up"}
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>

            {error && (
                // Loud on purpose: the same-gender mistake is the one people
                // make over and over, and a grey line under the input gets
                // scrolled past.
                <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.45 }}
                    role="alert"
                    className="mt-4 flex gap-3 rounded-token border-2 border-destructive/50 bg-destructive/10 px-4 py-3.5 text-left"
                >
                    <AlertOctagon size={18} className="mt-0.5 shrink-0 text-destructive" />
                    <p className="text-sm font-medium leading-relaxed text-destructive">{error}</p>
                </motion.div>
            )}

            {partner && (
                <>
                    <RefundNotice partnerName={partner.firstName} className="mt-5" />

                    <Button
                        size="lg"
                        disabled={submitting}
                        onClick={() => void submitFinalist()}
                        className="sheen mt-4 w-full"
                    >
                        {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {submitting ? "Locking it in…" : "Pair us up"}
                    </Button>
                </>
            )}

            <Button variant="ghost" onClick={back} className="mt-3 w-full">
                <ArrowLeft size={16} /> Back
            </Button>
        </div>
    );
};

export default PartnerStep;
