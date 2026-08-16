import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Resolving a member from what they type.
 *
 * Registration and awards voting both start the same way: someone types an
 * email or a phone number and we find their `profiles` row. The rules they
 * apply afterwards differ (registration gates on finalist level, voting does
 * not), but the lookup itself is one behaviour and lives here so a fix to phone
 * matching lands in both places at once.
 */

export type ProfileRow = {
    id: string;
    first_name: string;
    last_name: string;
    gender: string | null;
    email: string | null;
    phone_number: string | null;
    matric_number: string | null;
    avatar_url: string | null;
    entry_year: number | null;
    class_sets: { entry_year: number | null } | null;
};

export const PROFILE_COLUMNS =
    "id, first_name, last_name, gender, email, phone_number, matric_number, avatar_url, entry_year, class_sets(entry_year)";

const isEmail = (value: string): boolean => value.includes("@");

/**
 * Plausible stored variants of a Nigerian phone number. Numbers were typed into
 * the portal over years by different people, so the same line exists as
 * `08012345678`, `8012345678` and `+2348012345678` across the table — matching
 * on one form only would tell a real member they don't exist.
 */
export const phoneCandidates = (raw: string): string[] => {
    const digits = raw.replace(/\D/g, "");
    const variants = new Set<string>([raw.trim(), digits]);

    let local = digits;
    if (digits.startsWith("234")) local = digits.slice(3);
    else if (digits.startsWith("0")) local = digits.slice(1);

    if (local) {
        variants.add(local); // 8012345678
        variants.add(`0${local}`); // 08012345678
        variants.add(`234${local}`); // 2348012345678
        variants.add(`+234${local}`); // +2348012345678
    }

    return [...variants].filter(Boolean);
};

/** The member behind an email or phone number, or null if there isn't one. */
export const resolveProfile = async (identifier: string): Promise<ProfileRow | null> => {
    const supabase = createServerSupabase();
    const value = identifier.trim();
    if (!value) return null;

    const orFilter = isEmail(value)
        ? `email.eq.${value.toLowerCase()}`
        : phoneCandidates(value)
              .map((candidate) => `phone_number.eq.${candidate}`)
              .join(",");

    const { data } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .or(orFilter)
        .limit(1)
        .maybeSingle<ProfileRow>();

    return data ?? null;
};
