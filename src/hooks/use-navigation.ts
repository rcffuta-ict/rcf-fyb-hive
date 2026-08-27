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

/**
 * Deliberately broader than `useFeature()`, which answers "can anyone use this
 * right now". A nav link answers a different question: is there anything at
 * that address worth opening. The two come apart the moment a season ends.
 *
 * Voting closes and the awards link would vanish — taking the winners screen
 * with it on the one night it matters. Pairing closes and the page that would
 * tell somebody they've missed the deadline becomes the one page they can't
 * reach. So both links follow "has this ever run", a flag stamped once and
 * never cleared, and the pages themselves say which state they're in.
 */
const useLiveFeatures = (): Record<FeatureKey, boolean> => {
    const awardsRan = useSettingsStore((s) => s.awardsRan);
    const pairingRan = useSettingsStore((s) => s.pairingRan);
    const resultsPublic = useSettingsStore((s) => s.awardsResultsPublic);

    return {
        registration: useFeature("registration"),
        pairing: useFeature("pairing") || pairingRan,
        awards: useFeature("awards") || awardsRan || resultsPublic,
    };
};

/** Only the links a visitor can actually open right now. */
export const useLiveNavLinks = (): NavLink[] => {
    const live = useLiveFeatures();

    const links = baseLinks
        .map((link) => ({
            ...link,
            enabled: link.feature === null || live[link.feature],
        }))
        .filter((link) => link.enabled);

    // The winners screen is worth linking to before it has anything to reveal:
    // while voting is open it is a wall of sealed envelopes, which is the point
    // of it. So it follows either switch rather than publication alone.
    //
    // Appended here rather than added to `site.nav` because it is live for a
    // season, not forever, and a link in the config file would need a fourth
    // feature key to gate something that already has two switches.
    if (!live.awards) return links;

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
