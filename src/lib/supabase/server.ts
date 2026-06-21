import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role).
 *
 * There is no end-user auth in this app — all reads of `profiles`/`class_sets`/
 * `tenures` and writes to the `fyb_*` tables happen inside server actions using
 * the service-role key. NEVER import this from a client component: the key
 * bypasses RLS and must never reach the browser.
 */

let client: SupabaseClient | null = null;

export const createServerSupabase = (): SupabaseClient => {
    if (client) return client;

    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
        );
    }

    client = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    return client;
};
