import { Home, UserPlus, HeartHandshake, Trophy, type LucideIcon } from "lucide-react";

import { site, isFeatureEnabled, type FeatureKey } from "@/config/site";

/** A header/footer nav link, resolved against the active feature flags. */
export type NavLink = {
    label: string;
    href: string;
    feature: FeatureKey | null;
    enabled: boolean;
    icon: LucideIcon;
};

const NAV_ICONS: Record<string, LucideIcon> = {
    "/": Home,
    "/register": UserPlus,
    "/pairing": HeartHandshake,
    "/awards": Trophy,
};

/** All nav links from config, each tagged with whether its feature is live. */
export const navLinks: NavLink[] = site.nav.map((item) => ({
    label: item.label,
    href: item.href,
    feature: item.feature,
    enabled: item.feature === null || isFeatureEnabled(item.feature),
    icon: NAV_ICONS[item.href] ?? Home,
}));

/** Only the links a visitor can actually open right now. */
export const liveNavLinks: NavLink[] = navLinks.filter((l) => l.enabled);

/** Richer cards for the landing page's "what you can do" section. */
export type FeatureCard = {
    feature: FeatureKey;
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    enabled: boolean;
};

const baseCards: Omit<FeatureCard, "enabled">[] = [
    {
        feature: "registration",
        href: "/register",
        title: "Register",
        description:
            "Confirm your place at the dinner. Look up your RCF FUTA profile and add a clear photo — finalists only.",
        icon: UserPlus,
    },
    {
        feature: "pairing",
        href: "/pairing",
        title: "Pair Your Date",
        description:
            "No date, no entry. Register the partner you're coming with and validate your pairing.",
        icon: HeartHandshake,
    },
    {
        feature: "awards",
        href: "/awards",
        title: "Awards Voting",
        description:
            "Celebrate the class — cast your votes and crown the standout finalists of the set.",
        icon: Trophy,
    },
];

export const featureCards: FeatureCard[] = baseCards.map((c) => ({
    ...c,
    enabled: isFeatureEnabled(c.feature),
}));
