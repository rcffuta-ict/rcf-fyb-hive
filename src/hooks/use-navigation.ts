"use client";

import { Crown } from "lucide-react";

import { baseCards, baseLinks, type FeatureCard, type NavLink } from "@/constants/navigation";
import type { FeatureKey } from "@/config/site";
import { useFeature, useSettingsStore } from "@/store/settings.store";

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
    const resultsPublic = useSettingsStore((s) => s.awardsResultsPublic);

    const links = baseLinks
        .map((link) => ({
            ...link,
            enabled: link.feature === null || live[link.feature],
        }))
        .filter((link) => link.enabled);

    // The winners screen answers to publication, not to the awards flag: by the
    // time results are read out, voting is normally closed and `awards` is off,
    // and that is exactly when this link has to appear. It is appended here
    // rather than added to `site.nav` because it is live for a night, not for a
    // season — and because a link in the config file would need a fourth
    // feature key to gate something that already has a switch.
    if (!resultsPublic) return links;

    return [
        ...links,
        {
            label: "Winners",
            href: "/awards/winners",
            feature: null,
            enabled: true,
            icon: Crown,
        },
    ];
};

/** Landing-page feature cards, each tagged with whether it's live yet. */
export const useFeatureCards = (): FeatureCard[] => {
    const live = useLiveFeatures();
    return baseCards.map((card) => ({ ...card, enabled: live[card.feature] }));
};
