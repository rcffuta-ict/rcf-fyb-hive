import { z } from "zod";
import rawConfig from "./site.config.json";

/**
 * Typed, validated access to all editable site content.
 *
 * Everything human-editable (branding, sponsors, event + payment details, nav,
 * copy, feature flags, active theme) lives in `site.config.json`. Components must
 * read from the exported `site` object rather than hardcoding strings.
 */

const featureKeys = ["registration", "pairing", "awards"] as const;
export type FeatureKey = (typeof featureKeys)[number];

const SiteConfigSchema = z.object({
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    description: z.string(),
    theme: z.string(),
    branding: z.object({
        logos: z.object({
            fybHive: z.string(),
            rcffuta: z.string(),
            ict: z.string(),
            armyOfLight: z.string(),
        }),
        favicon: z.string(),
    }),
    links: z.object({
        rcffuta: z.string(),
        ict: z.string(),
        ictPortalRegister: z.string(),
    }),
    contact: z.object({
        email: z.string(),
        socials: z.array(z.object({ label: z.string(), url: z.string() })),
    }),
    sponsors: z.array(
        z.object({
            name: z.string(),
            role: z.string().optional(),
            url: z.string(),
            logo: z.string(),
        })
    ),
    event: z.object({
        title: z.string(),
        dateISO: z.string(),
        venue: z.string(),
        dressCode: z.string(),
        audience: z.string(),
    }),
    payment: z.object({
        bankName: z.string(),
        accountName: z.string(),
        accountNumber: z.string(),
        amount: z.number(),
        currency: z.string(),
    }),
    nav: z.array(
        z.object({
            label: z.string(),
            href: z.string(),
            feature: z.enum(featureKeys).nullable(),
        })
    ),
    copy: z.object({
        heroEyebrow: z.string(),
        heroTitle: z.string(),
        heroSubtitle: z.string(),
        heroCtaPrimary: z.string(),
        heroCtaSecondary: z.string(),
        aboutEyebrow: z.string(),
        aboutBody: z.string(),
        exploreEyebrow: z.string(),
        exploreTitle: z.string(),
        ctaTitle: z.string(),
        ctaSubtitle: z.string(),
        ctaButton: z.string(),
        tribute: z.string(),
        poweredBy: z.string(),
        footerNote: z.string(),
    }),
    features: z.object({
        registration: z.boolean(),
        pairing: z.boolean(),
        awards: z.boolean(),
    }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type NavItem = SiteConfig["nav"][number];
export type Sponsor = SiteConfig["sponsors"][number];

export const site: SiteConfig = SiteConfigSchema.parse(rawConfig);

/** Whether a feature flag is enabled (used for "Coming soon" gating). */
export const isFeatureEnabled = (feature: FeatureKey): boolean =>
    site.features[feature];

/** Nav items whose feature is enabled (or has no feature gate). */
export const enabledNav = (): NavItem[] =>
    site.nav.filter((item) => item.feature === null || site.features[item.feature]);

/** Format an amount using the configured currency (e.g. ₦6,000). */
export const formatMoney = (amount: number): string =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: site.payment.currency,
        maximumFractionDigits: 0,
    }).format(amount);
