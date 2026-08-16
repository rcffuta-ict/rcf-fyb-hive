import "server-only";

import { cache } from "react";

import { site, type FeatureKey } from "@/config/site";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Runtime settings.
 *
 * Feature flags used to live only in `site.config.json`, which is bundled at
 * build time — fine for a flag a developer flips, useless for one an admin
 * flips. The `fyb_settings` table is now the authority; the JSON supplies the
 * default whenever a key is missing, so the app behaves identically before the
 * migration is applied and if the table is ever unreachable.
 */

export type AppSettings = {
    pairingEnabled: boolean;
    pairAmount: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    awardsEnabled: boolean;
    /** Whether vote counts may be shown to anyone other than an admin. */
    awardsResultsPublic: boolean;
};

type SettingRow = { key: string; value: unknown };

const defaults = (): AppSettings => ({
    pairingEnabled: site.features.pairing,
    pairAmount: site.payment.amount,
    bankName: site.payment.bankName,
    accountName: site.payment.accountName,
    accountNumber: site.payment.accountNumber,
    awardsEnabled: site.features.awards,
    // Never defaults open: a settings read that failed must not be the reason a
    // tally goes public before the organizers meant it to.
    awardsResultsPublic: false,
});

/**
 * Cached per request: several Server Components read flags in a single render
 * (layout, page, nav) and none of them should cost another round trip.
 */
export const getSettings = cache(async (): Promise<AppSettings> => {
    try {
        const supabase = createServerSupabase();
        const { data, error } = await supabase
            .from("fyb_settings")
            .select("key, value")
            .returns<SettingRow[]>();

        if (error) {
            console.error("getSettings failed:", error.message);
            return defaults();
        }

        const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
        const fallback = defaults();
        const text = (key: string): string | null => {
            const value = byKey.get(key);
            return typeof value === "string" && value.trim() ? value : null;
        };
        const flag = (key: string, fallbackValue: boolean): boolean =>
            typeof byKey.get(key) === "boolean" ? (byKey.get(key) as boolean) : fallbackValue;

        return {
            pairingEnabled: flag("pairing_enabled", fallback.pairingEnabled),
            pairAmount:
                typeof byKey.get("pair_amount") === "number"
                    ? (byKey.get("pair_amount") as number)
                    : fallback.pairAmount,
            bankName: text("pay_bank_name") ?? fallback.bankName,
            accountName: text("pay_account_name") ?? fallback.accountName,
            accountNumber: text("pay_account_number") ?? fallback.accountNumber,
            awardsEnabled: flag("awards_enabled", fallback.awardsEnabled),
            awardsResultsPublic: flag(
                "awards_results_public",
                fallback.awardsResultsPublic
            ),
        };
    } catch (error) {
        console.error("getSettings threw:", error);
        return defaults();
    }
});

/** Server-side feature check. Client components use `useFeature()` instead. */
export const isFeatureLive = async (feature: FeatureKey): Promise<boolean> => {
    if (feature === "registration") return site.features.registration;

    const settings = await getSettings();
    return feature === "pairing" ? settings.pairingEnabled : settings.awardsEnabled;
};

export type SettingKey =
    | "pairing_enabled"
    | "pair_amount"
    | "pay_bank_name"
    | "pay_account_name"
    | "pay_account_number"
    | "awards_enabled"
    | "awards_results_public";

export const updateSetting = async (
    key: SettingKey,
    value: boolean | number | string,
    updatedBy: string
): Promise<{ success: boolean; error?: string }> => {
    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_settings")
        .upsert({ key, value, updated_by: updatedBy }, { onConflict: "key" });

    if (error) {
        console.error("updateSetting failed:", error.message);
        return { success: false, error: error.message };
    }
    return { success: true };
};
