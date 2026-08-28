"use server";

import { getCurrentAdmin } from "@/actions/admin.action";
import { getCurrentCheckInManager } from "@/actions/check-in-access.action";
import {
    clearCheckIn,
    getCheckInRoster,
    getSeatedPairs,
    markCheckedIn,
    setTableNumber,
    type SeatedPair,
} from "@/services/check-in.service";
import type { CheckInPair } from "@/types/fyb.types";

/**
 * Gate actions.
 *
 * Two roles reach these, and the split is the point:
 *
 *   • the roster and the table field are ADMIN only — seating is planned, not
 *     rewritten at the door by whoever is holding the phone
 *   • admitting a couple accepts a check-in manager, i.e. the registration team
 *
 * Every call re-checks its cookie against the database, because these run on
 * borrowed phones at a door — the least controlled devices the project has.
 */

export type CheckInResult = {
    ok: boolean;
    message: string;
    /** New arrival time on success, so the caller can update its row in place. */
    checkedInAt?: string | null;
};

/**
 * The full approved roster. Loaded once; both screens filter it locally.
 *
 * Open to the check-in team as well as organizers — it is what the door
 * searches. It carries contact details, which is why it needs a session at all:
 * the public seating list (`loadSeating`) is the one with no session and no
 * contacts.
 */
export async function loadCheckInRoster(): Promise<CheckInPair[]> {
    const manager = await getCurrentCheckInManager();
    if (!manager) return [];
    return getCheckInRoster();
}

/**
 * Admit a couple. Open to the registration team, not just organizers.
 *
 * Whoever pressed the button is stamped on the row — that name is the audit
 * trail, so it is taken from the verified session and never from the client.
 */
export async function checkInPair(intentId: string): Promise<CheckInResult> {
    const manager = await getCurrentCheckInManager();
    if (!manager) return { ok: false, message: "Sign in to check couples in." };

    const result = await markCheckedIn(intentId, manager.profileId);
    if (!result.ok) return { ok: false, message: result.message };

    return { ok: true, message: "Checked in — let them through.", checkedInAt: result.checkedInAt };
}

/** Undo — for the row pressed by mistake, not for sending anybody back out. */
export async function undoCheckIn(intentId: string): Promise<CheckInResult> {
    const manager = await getCurrentCheckInManager();
    if (!manager) return { ok: false, message: "Sign in to undo a check-in." };

    const result = await clearCheckIn(intentId);
    if (!result.ok) return { ok: false, message: result.message };

    return { ok: true, message: "Check-in undone.", checkedInAt: null };
}

export type TableResult = {
    ok: boolean;
    message: string;
    /** The stored label after normalization, so the caller shows what saved. */
    tableNumber?: string | null;
};

/**
 * Assign or change a pair's table. Organizers only — a check-in manager admits
 * couples to the seats the plan gave them, and cannot move anybody.
 *
 * Editable rather than write-once on purpose: seating gets rearranged on the
 * night, and an organizer who cannot correct a table will write the real one on
 * their hand instead.
 */
export async function assignTableNumber(
    intentId: string,
    value: string
): Promise<TableResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const result = await setTableNumber(intentId, value);
    if (!result.ok) return { ok: false, message: result.message };

    return {
        ok: true,
        message: result.tableNumber
            ? `Seated at table ${result.tableNumber}.`
            : "Table cleared.",
        tableNumber: result.tableNumber,
    };
}

/**
 * The public seating list, as the QR poster's page reads it.
 *
 * No session required — it is reached by pointing a camera at a wall. The same
 * list backs the door: a signed-in manager gets buttons beside these rows, and
 * every one of those buttons calls an action that checks a session of its own.
 */
export async function loadSeating(): Promise<SeatedPair[]> {
    return getSeatedPairs();
}
