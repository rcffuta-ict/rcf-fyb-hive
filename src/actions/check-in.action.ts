"use server";

import { getCurrentAdmin } from "@/actions/admin.action";
import {
    clearCheckIn,
    getCheckInRoster,
    markCheckedIn,
} from "@/services/check-in.service";
import type { CheckInPair } from "@/types/fyb.types";

/**
 * Gate actions.
 *
 * Every one re-checks the admin cookie: this page is used on a borrowed phone
 * at a door, which is the least controlled device the project has.
 */

export type CheckInResult = {
    ok: boolean;
    message: string;
    /** New arrival time on success, so the caller can update its row in place. */
    checkedInAt?: string | null;
};

/** The full approved roster. Loaded once; the gate filters it locally. */
export async function loadCheckInRoster(): Promise<CheckInPair[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return getCheckInRoster();
}

export async function checkInPair(intentId: string): Promise<CheckInResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const result = await markCheckedIn(intentId, admin.profileId);
    if (!result.ok) return { ok: false, message: result.message };

    return { ok: true, message: "Checked in — let them through.", checkedInAt: result.checkedInAt };
}

/** Undo — for the row pressed by mistake, not for sending anybody back out. */
export async function undoCheckIn(intentId: string): Promise<CheckInResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const result = await clearCheckIn(intentId);
    if (!result.ok) return { ok: false, message: result.message };

    return { ok: true, message: "Check-in undone.", checkedInAt: null };
}
