import { create } from "zustand";

import {
    createAssociateIntent,
    createFinalistIntent,
    findPairingBetween,
    resolveConsentToken,
} from "@/actions/pairing.action";
import { appToast } from "@/providers/ToastProvider";
import type { AssociateFormValues } from "@/features/pairing/schema";
import type { Gender, PairCard } from "@/types/fyb.types";

/**
 * Pairing flow state.
 *
 * Same shape as `registration.store.ts` — a `step` string machine plus
 * submitting/error flags — so the two flows read the same way.
 */

export type PairStep = "token" | "matched" | "partner" | "associate" | "payment";
export type PartnerMode = "finalist" | "associate";

type PairingState = {
    step: PairStep;
    mode: PartnerMode;

    tokenInput: string;
    partnerTokenInput: string;

    self: PairCard | null;
    partner: PairCard | null;
    /** Gender the partner must be, derived from `self`. */
    expects: Gender | null;
    expectsTerm: string;

    associate: AssociateFormValues | null;
    code: string | null;
    amount: number;
    /**
     * Set when the pairing already existed rather than being created now — the
     * payment screen reads this to show status instead of "you're on the way".
     */
    existingStatus: "pending" | "approved" | null;

    resolving: boolean;
    submitting: boolean;
    error: string | null;

    setTokenInput: (value: string) => void;
    setPartnerTokenInput: (value: string) => void;
    setMode: (mode: PartnerMode) => void;
    resolveSelf: () => Promise<void>;
    resolvePartner: () => Promise<void>;
    submitFinalist: () => Promise<boolean>;
    submitAssociate: (values: AssociateFormValues) => Promise<boolean>;
    back: () => void;
    reset: () => void;
};

const initial = {
    step: "token" as PairStep,
    mode: "finalist" as PartnerMode,
    tokenInput: "",
    partnerTokenInput: "",
    self: null,
    partner: null,
    expects: null,
    expectsTerm: "person",
    associate: null,
    code: null,
    amount: 0,
    existingStatus: null,
    resolving: false,
    submitting: false,
    error: null,
};

export const usePairingStore = create<PairingState>((set, get) => ({
    ...initial,

    setTokenInput: (value) => set({ tokenInput: value, error: null }),
    setPartnerTokenInput: (value) => set({ partnerTokenInput: value, error: null }),
    setMode: (mode) => set({ mode, error: null }),

    resolveSelf: async () => {
        const raw = get().tokenInput.trim();
        if (!raw) return set({ error: "Enter your consent token." });

        set({ resolving: true, error: null });
        const result = await resolveConsentToken(raw);

        if (result.status !== "ok") {
            return set({ resolving: false, error: result.message });
        }

        // No gender on record means we can't apply the brother/sister rule at
        // lookup, and they'd only be stopped at submit. Say so now.
        if (!result.card.gender) {
            return set({
                resolving: false,
                error:
                    "Your profile has no gender on record, so we can't pair you yet. " +
                    "Reach out to the ICT Coordinator to get it fixed.",
            });
        }

        // Someone already paired and paid can't start a new pairing at all —
        // say so here rather than letting them fill in a partner first.
        if (!result.card.available) {
            return set({
                resolving: false,
                error: result.card.unavailableReason ?? "You can't pair right now.",
            });
        }

        set({
            resolving: false,
            self: result.card,
            expects: result.expects,
            expectsTerm: result.expectsTerm,
            step: "matched",
        });
    },

    resolvePartner: async () => {
        const raw = get().partnerTokenInput.trim();
        if (!raw) return set({ error: "Enter their consent token." });

        set({ resolving: true, error: null });
        const result = await resolveConsentToken(raw);

        if (result.status !== "ok") {
            return set({ resolving: false, error: result.message });
        }

        const { self, expects, tokenInput } = get();
        if (self && result.card.registrationId === self.registrationId) {
            return set({ resolving: false, error: "That's your own token." });
        }
        // Same gender: say so plainly and by name, right where they typed it.
        // This is the one mistake people will make repeatedly, so the message
        // names the person and what's actually needed.
        if (!result.card.gender) {
            return set({
                resolving: false,
                partner: null,
                error: `${result.card.firstName} has no gender on record, so we can't check the brother/sister rule. Ask them to contact the ICT Coordinator.`,
            });
        }
        if (expects && result.card.gender !== expects) {
            const both = expects === "female" ? "brothers" : "sisters";
            return set({
                resolving: false,
                partner: null,
                error:
                    `Ah ah! ${result.card.firstName} is not a ${get().expectsTerm} — you're both ${both}. 😅 ` +
                    `Be serious now: the dinner pairs a brother with a sister, so you need a ${get().expectsTerm}'s token.`,
            });
        }

        // Check for an existing pairing BEFORE the availability guard: two
        // people already paired with each other read as unavailable, but what
        // they want is to see their own pairing, not be turned away from it.
        const existing = await findPairingBetween(tokenInput, raw);
        if (existing) {
            return set({
                resolving: false,
                partner: result.card,
                code: existing.code,
                amount: existing.amount,
                existingStatus: existing.intentStatus,
                step: "payment",
            });
        }

        if (!result.card.available) {
            return set({
                resolving: false,
                error: result.card.unavailableReason ?? "They can't pair right now.",
            });
        }

        set({ resolving: false, partner: result.card });
    },

    submitFinalist: async () => {
        const { tokenInput, partnerTokenInput } = get();
        set({ submitting: true, error: null });

        const result = await createFinalistIntent(tokenInput, partnerTokenInput);

        // "existing" is a success from the user's point of view: their pairing
        // is there, they just didn't make it in this session.
        if (result.status === "existing") {
            set({
                submitting: false,
                code: result.code,
                amount: result.amount,
                existingStatus: result.intentStatus,
                step: "payment",
            });
            return true;
        }

        if (result.status !== "ok") {
            set({ submitting: false, error: result.message });
            appToast.error(result.message);
            return false;
        }

        set({
            submitting: false,
            code: result.code,
            amount: result.amount,
            existingStatus: null,
            step: "payment",
        });
        return true;
    },

    submitAssociate: async (values) => {
        const { tokenInput } = get();
        set({ submitting: true, error: null });

        const result = await createAssociateIntent(tokenInput, values);
        if (result.status !== "ok" && result.status !== "existing") {
            set({ submitting: false, error: result.message });
            appToast.error(result.message);
            return false;
        }

        set({
            submitting: false,
            associate: values,
            code: result.code,
            amount: result.amount,
            existingStatus: result.status === "existing" ? result.intentStatus : null,
            step: "payment",
        });
        return true;
    },

    back: () => {
        const { step } = get();
        if (step === "partner" || step === "associate") {
            return set({ step: "matched", partner: null, error: null });
        }
        if (step === "matched") return set({ ...initial });
        set({ error: null });
    },

    reset: () => set({ ...initial }),
}));
