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

type FeatureState = {
    /** Can someone use this right now — vote, pair, register. */
    now: Record<FeatureKey, boolean>;
    /** Has it ever been live this season. Never cleared once set. */
    ever: Record<FeatureKey, boolean>;
};

/**
 * The two questions a flag gets asked, which are not the same question.
 *
 * `now` gates the thing itself. `ever` gates the *link* to it, because a link
 * answers "is there anything at that address worth opening" and the two come
 * apart the moment a season ends: voting closes and the awards link would
 * vanish, taking the winners screen with it on the one night it matters;
 * pairing closes and the page that would tell somebody they've missed the
 * deadline becomes the one page they can't reach.
 *
 * The pages behind these links each say which state they are in, so a link that
 * outlives its feature lands somewhere honest rather than on a stale form.
 */
const useFeatureState = (): FeatureState => {
    const awardsRan = useSettingsStore((s) => s.awardsRan);
    const pairingRan = useSettingsStore((s) => s.pairingRan);
    const resultsPublic = useSettingsStore((s) => s.awardsResultsPublic);

    const now: Record<FeatureKey, boolean> = {
        registration: useFeature("registration"),
        pairing: useFeature("pairing"),
        awards: useFeature("awards"),
    };

    return {
        now,
        ever: {
            registration: now.registration,
            pairing: now.pairing || pairingRan,
            awards: now.awards || awardsRan || resultsPublic,
        },
    };
};

/** Only the links a visitor can actually open right now. */
export const useLiveNavLinks = (): NavLink[] => {
    const { ever } = useFeatureState();

    const links = baseLinks
        .map((link) => ({
            ...link,
            enabled: link.feature === null || ever[link.feature],
        }))
        .filter((link) => link.enabled);

    // The winners screen is worth linking to before it has anything to reveal:
    // while voting is open it is a wall of sealed envelopes, which is the point
    // of it. Appended here rather than added to `site.nav` because it is live
    // for a season, not forever, and a link in the config file would need a
    // fourth feature key to gate something that already has two switches.
    if (!ever.awards) return links;

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

/**
 * What a card should say once its season is over.
 *
 * Without this, broadening the cards to survive a closed feature would leave
 * "cast your votes and crown the standout finalists" pointing at a shut ballot
 * — which is worse than the greyed-out card it replaced, because it reads as an
 * invitation.
 */
const CLOSED_COPY: Partial<Record<FeatureKey, Pick<FeatureCard, "title" | "description">>> = {
    awards: {
        title: "Award Winners",
        description:
            "Voting has closed and the envelopes are sealed. See every award, its criteria, and who takes it home.",
    },
    pairing: {
        title: "Pairing Closed",
        description:
            "The window for registering the person you're coming with has shut. Paired in time? You're set.",
    },
};

/** Landing-page feature cards, each tagged with whether it's live yet. */
export const useFeatureCards = (): FeatureCard[] => {
    const { now, ever } = useFeatureState();

    return baseCards.map((card) => {
        const closed = ever[card.feature] && !now[card.feature];
        return { ...card, ...(closed ? CLOSED_COPY[card.feature] : {}), enabled: ever[card.feature] };
    });
};
