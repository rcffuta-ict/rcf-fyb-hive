import { create } from "zustand";

import {
    createAssociateIntent,
    createFinalistIntent,
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

        const { self, expects } = get();
        if (self && result.card.registrationId === self.registrationId) {
            return set({ resolving: false, error: "That's your own token." });
        }
        if (expects && result.card.gender && result.card.gender !== expects) {
            return set({
                resolving: false,
                error: `You need a ${get().expectsTerm}'s token for this one.`,
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
        if (result.status !== "ok") {
            set({ submitting: false, error: result.message });
            appToast.error(result.message);
            return false;
        }

        set({
            submitting: false,
            code: result.code,
            amount: result.amount,
            step: "payment",
        });
        return true;
    },

    submitAssociate: async (values) => {
        const { tokenInput } = get();
        set({ submitting: true, error: null });

        const result = await createAssociateIntent(tokenInput, values);
        if (result.status !== "ok") {
            set({ submitting: false, error: result.message });
            appToast.error(result.message);
            return false;
        }

        set({
            submitting: false,
            associate: values,
            code: result.code,
            amount: result.amount,
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
