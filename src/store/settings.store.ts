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
    awardsEnabled: site.features.awards,
    awardsResultsPublic: false,
    awardsRan: false,
    pairingRan: false,
    hydrated: false,
    hydrate: (settings) => set({ ...settings, hydrated: true }),
}));

/**
 * Whether a feature is live for the current visitor. `pairing` and `awards`
 * come from the database so admin can flip them without a redeploy;
 * `registration` is still a build-time flag in `site.config.json`.
 */
export const useFeature = (feature: FeatureKey): boolean => {
    const pairingEnabled = useSettingsStore((s) => s.pairingEnabled);
    const awardsEnabled = useSettingsStore((s) => s.awardsEnabled);

    if (feature === "pairing") return pairingEnabled;
    if (feature === "awards") return awardsEnabled;
    return site.features.registration;
};
