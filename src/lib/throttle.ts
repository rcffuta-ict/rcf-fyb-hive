import "server-only";

import { headers } from "next/headers";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Consent-token lookup throttle.
 *
 * A token is four characters from a 31-character alphabet — about 923,000
 * combinations — and a successful lookup returns someone's photo and full name.
 * That is worth brute-forcing, and without a limit it's a weekend's work. This
 * app runs serverless, so an in-memory counter would reset constantly and not
 * be shared across instances; the counter lives in Postgres instead.
 *
 * Failures are weighted heavier than successes: someone working through their
 * own pairing makes a handful of correct lookups, while an enumeration attack
 * is almost entirely misses.
 */

const WINDOW_MINUTES = 10;
const MAX_FAILURES = 12;
const MAX_TOTAL = 40;

export type ThrottleResult = { allowed: boolean; message?: string };

const clientIp = async (): Promise<string> => {
    const headerList = await headers();
    // x-forwarded-for is a comma-separated chain; the client is the first entry.
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return headerList.get("x-real-ip") ?? "unknown";
};

/** Check the caller's recent attempts. Call before doing the lookup. */
export const checkTokenThrottle = async (): Promise<ThrottleResult> => {
    try {
        const ip = await clientIp();
        const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

        const supabase = createServerSupabase();
        const { data, error } = await supabase
            .from("fyb_token_attempts")
            .select("succeeded")
            .eq("ip", ip)
            .gte("attempted_at", since)
            .returns<{ succeeded: boolean }[]>();

        // Fail open: a throttle outage must not take the pairing flow down.
        if (error) {
            console.error("throttle check failed:", error.message);
            return { allowed: true };
        }

        const attempts = data ?? [];
        const failures = attempts.filter((a) => !a.succeeded).length;

        if (failures >= MAX_FAILURES || attempts.length >= MAX_TOTAL) {
            return {
                allowed: false,
                message: "Too many attempts. Give it a few minutes and try again.",
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error("throttle check threw:", error);
        return { allowed: true };
    }
};

/** Record the outcome. Best-effort — never blocks or fails the caller. */
export const recordTokenAttempt = async (succeeded: boolean): Promise<void> => {
    try {
        const ip = await clientIp();
        const supabase = createServerSupabase();
        await supabase.from("fyb_token_attempts").insert({ ip, succeeded });
    } catch (error) {
        console.error("throttle record failed:", error);
    }
};
