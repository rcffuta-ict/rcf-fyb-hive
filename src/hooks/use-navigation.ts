"use client";

import { baseCards, baseLinks, type FeatureCard, type NavLink } from "@/constants/navigation";
import type { FeatureKey } from "@/config/site";
import { useFeature } from "@/store/settings.store";

/**
 * Nav and landing-page cards, resolved against the *runtime* feature flags.
 *
 * These are hooks rather than constants because `pairing` now lives in the
 * database: a module-level constant would freeze whatever the flag was when the
 * bundle was built, so an admin could switch pairing on and the nav would keep
 * hiding it until someone redeployed.
 */

const useLiveFeatures = (): Record<FeatureKey, boolean> => ({
    registration: useFeature("registration"),
    pairing: useFeature("pairing"),
    awards: useFeature("awards"),
});

/** Only the links a visitor can actually open right now. */
export const useLiveNavLinks = (): NavLink[] => {
    const live = useLiveFeatures();

    return baseLinks
        .map((link) => ({
            ...link,
            enabled: link.feature === null || live[link.feature],
        }))
        .filter((link) => link.enabled);
};

/** Landing-page feature cards, each tagged with whether it's live yet. */
export const useFeatureCards = (): FeatureCard[] => {
    const live = useLiveFeatures();
    return baseCards.map((card) => ({ ...card, enabled: live[card.feature] }));
};
