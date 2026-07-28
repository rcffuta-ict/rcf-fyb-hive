"use client";

import { create } from "zustand";

import { site, type FeatureKey } from "@/config/site";
import type { AppSettings } from "@/services/settings.service";

/**
 * Client-side mirror of the runtime settings.
 *
 * Hydrated once from the root layout (a Server Component) so client components
 * like the header and hero can gate on a flag an admin toggles, without every
 * one of them fetching. Same hydrate pattern as `admin.store.ts`.
 */

type SettingsState = AppSettings & {
    hydrated: boolean;
    hydrate: (settings: AppSettings) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
    pairingEnabled: site.features.pairing,
    pairAmount: site.payment.amount,
    bankName: site.payment.bankName,
    accountName: site.payment.accountName,
    accountNumber: site.payment.accountNumber,
    hydrated: false,
    hydrate: (settings) => set({ ...settings, hydrated: true }),
}));

/**
 * Whether a feature is live for the current visitor. `pairing` comes from the
 * database so admin can flip it without a redeploy; the rest are still
 * build-time flags in `site.config.json`.
 */
export const useFeature = (feature: FeatureKey): boolean => {
    const pairingEnabled = useSettingsStore((s) => s.pairingEnabled);
    if (feature === "pairing") return pairingEnabled;
    return site.features[feature];
};
