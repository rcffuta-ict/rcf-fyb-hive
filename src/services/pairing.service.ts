import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { PairingStatus } from "@/types/fyb.types";

/**
 * Relationship status, derived from `fyb_pairings`:
 *
 *   single      — no pairing row at all
 *   in_between  — paired, but not yet paid *and* approved by an admin
 *   taken       — paired, paid and confirmed
 *
 * Pairing hasn't shipped yet, so in practice this returns `single` for
 * everyone. It's derived rather than hardcoded so the day the pairing feature
 * lands, every surface showing a status starts telling the truth on its own —
 * no second pass through the app to un-hardcode it.
 */

type PairingRow = {
    finalist_registration_id: string;
    partner_registration_id: string | null;
    paid: boolean;
    confirmed: boolean;
};

const statusFor = (row: PairingRow): PairingStatus =>
    row.paid && row.confirmed ? "taken" : "in_between";

/** Status per registration id. Ids with no pairing row come back `single`. */
export const getPairingStatuses = async (
    registrationIds: string[]
): Promise<Map<string, PairingStatus>> => {
    const statuses = new Map<string, PairingStatus>(
        registrationIds.map((id) => [id, "single" as PairingStatus])
    );
    if (registrationIds.length === 0) return statuses;

    const supabase = createServerSupabase();
    const idList = `(${registrationIds.join(",")})`;

    // A registration can sit on either side of a pairing — the finalist who
    // shared their token, or the partner who redeemed it.
    const { data, error } = await supabase
        .from("fyb_pairings")
        .select("finalist_registration_id, partner_registration_id, paid, confirmed")
        .or(
            `finalist_registration_id.in.${idList},partner_registration_id.in.${idList}`
        )
        .returns<PairingRow[]>();

    if (error) {
        // Never fail a listing over a decorative badge.
        console.error("getPairingStatuses failed:", error.message);
        return statuses;
    }

    for (const row of data ?? []) {
        const status = statusFor(row);
        for (const id of [row.finalist_registration_id, row.partner_registration_id]) {
            if (id && statuses.has(id)) statuses.set(id, status);
        }
    }

    return statuses;
};
