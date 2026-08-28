import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
    CheckInPair,
    CheckInPerson,
    Gender,
    PairIntentKind,
} from "@/types/fyb.types";

/**
 * The door.
 *
 * An approved pairing has already been paid for and has already had its
 * invitation email — `sendPairInvitations` in `invitation.service.ts`. This is
 * the last step of that ticket: marking the couple as admitted when they turn
 * up, so the same invitation can't walk in twice and the organizers know who is
 * actually inside.
 *
 * Only approved intents are ever on this roster. Pending means unpaid, and
 * cancelled means they lost the pairing — neither has a seat.
 */

type PersonRow = {
    first_name: string;
    last_name: string;
    email: string | null;
    phone_number: string | null;
    gender: string | null;
    level: string;
    unit: string | null;
    photo_url: string;
};

type RosterRow = {
    id: string;
    code: string;
    kind: PairIntentKind;
    checked_in_at: string | null;
    table_number: string | null;
    associate_name: string | null;
    associate_email: string | null;
    associate_phone: string | null;
    associate_gender: string | null;
    associate_relationship: string | null;
    initiator: PersonRow | null;
    partner: PersonRow | null;
    checked_in_admin: { first_name: string; last_name: string } | null;
};

const PERSON_COLUMNS =
    "first_name, last_name, email, phone_number, gender, level, unit, photo_url";

const ROSTER_SELECT =
    "id, code, kind, checked_in_at, table_number, " +
    "associate_name, associate_email, associate_phone, associate_gender, associate_relationship, " +
    `initiator:fyb_registrations!fyb_pair_intents_initiator_registration_id_fkey(${PERSON_COLUMNS}), ` +
    `partner:fyb_registrations!fyb_pair_intents_partner_registration_id_fkey(${PERSON_COLUMNS}), ` +
    "checked_in_admin:profiles!fyb_pair_intents_checked_in_by_fkey(first_name, last_name)";

const fullName = (first: string, last: string): string =>
    `${first} ${last}`.trim();

const toPerson = (row: PersonRow): CheckInPerson => ({
    name: fullName(row.first_name, row.last_name),
    detail: [row.level, row.unit].filter(Boolean).join(" · "),
    email: row.email,
    phone: row.phone_number,
    gender: (row.gender as Gender | null) ?? null,
    photoUrl: row.photo_url,
    isAssociate: false,
});

const toAssociate = (row: RosterRow): CheckInPerson => ({
    name: row.associate_name ?? "Guest",
    detail: row.associate_relationship ?? "Associate",
    email: row.associate_email,
    phone: row.associate_phone,
    gender: (row.associate_gender as Gender | null) ?? null,
    // Associates never have a photo on file — the UI shows a gender placeholder.
    photoUrl: null,
    isAssociate: true,
});

const toPair = (row: RosterRow): CheckInPair | null => {
    if (!row.initiator) return null;

    const other = row.partner ? toPerson(row.partner) : row.associate_name ? toAssociate(row) : null;
    if (!other) return null;

    return {
        intentId: row.id,
        code: row.code,
        kind: row.kind,
        checkedInAt: row.checked_in_at,
        checkedInBy: row.checked_in_admin
            ? fullName(row.checked_in_admin.first_name, row.checked_in_admin.last_name)
            : null,
        tableNumber: row.table_number,
        people: [toPerson(row.initiator), other],
    };
};

/**
 * Every approved pairing, in one read.
 *
 * The whole roster goes to the gate at once rather than a query per search:
 * one dinner is a few hundred pairs, and the alternative is a network
 * round-trip for every keystroke at a door where the network is the least
 * reliable thing in the building.
 */
export const getCheckInRoster = async (): Promise<CheckInPair[]> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .select(ROSTER_SELECT)
        .eq("status", "approved")
        .order("code", { ascending: true })
        .limit(2000)
        .returns<RosterRow[]>();

    if (error) {
        console.error("getCheckInRoster failed:", error.message);
        return [];
    }

    return (data ?? [])
        .map(toPair)
        .filter((pair): pair is CheckInPair => pair !== null);
};

export type CheckInWrite =
    | { ok: true; checkedInAt: string | null }
    | { ok: false; message: string };

/**
 * Why a guarded write matched no row.
 *
 * Every mutation here is written as an UPDATE with its preconditions in the
 * WHERE clause, so the database decides races rather than this code. That makes
 * "no rows updated" the normal way a race is lost — and the operator at the door
 * needs a sentence, not silence, so the row is read back to find out which
 * precondition failed.
 */
type IntentState = {
    status: string;
    checked_in_at: string | null;
    table_number: string | null;
};

const readState = async (intentId: string): Promise<IntentState | null> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_pair_intents")
        .select("status, checked_in_at, table_number")
        .eq("id", intentId)
        .maybeSingle<IntentState>();
    return data ?? null;
};

const NOT_APPROVED =
    "That pairing isn't approved — check the Pairings tab before letting anyone in.";

/**
 * Admit a pair.
 *
 * Two preconditions ride in the WHERE clause: not already inside, and seated.
 * Both are also constraints in the database (migration 011), so a second gate
 * pressing the same button, or one clearing the table as another admits the
 * couple, ends as a refusal rather than as a double entry or a seatless guest.
 */
export const markCheckedIn = async (
    intentId: string,
    adminProfileId: string
): Promise<CheckInWrite> => {
    const supabase = createServerSupabase();
    const checkedInAt = new Date().toISOString();

    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .update({ checked_in_at: checkedInAt, checked_in_by: adminProfileId })
        .eq("id", intentId)
        .eq("status", "approved")
        .is("checked_in_at", null)
        .not("table_number", "is", null)
        .select("id")
        .maybeSingle<{ id: string }>();

    if (error) {
        // The constraint got there first: their table was cleared between the
        // WHERE clause and the write.
        if (error.message.includes("fyb_pair_checkin_needs_table_chk")) {
            return { ok: false, message: "Give them a table first — this pair has none." };
        }
        console.error("markCheckedIn failed:", error.message);
        return { ok: false, message: "Could not check them in. Try again." };
    }

    if (!data) {
        const state = await readState(intentId);
        if (!state || state.status !== "approved") {
            return { ok: false, message: NOT_APPROVED };
        }
        if (state.checked_in_at) {
            return { ok: false, message: "They're already inside — nothing to do." };
        }
        return { ok: false, message: "Give them a table first — this pair has none." };
    }

    return { ok: true, checkedInAt };
};

/** Undo an arrival — the wrong couple was admitted on the wrong row. */
export const clearCheckIn = async (intentId: string): Promise<CheckInWrite> => {
    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_pair_intents")
        .update({ checked_in_at: null, checked_in_by: null })
        .eq("id", intentId);

    if (error) {
        console.error("clearCheckIn failed:", error.message);
        return { ok: false, message: "Could not undo. Try again." };
    }
    return { ok: true, checkedInAt: null };
};

// ─── Seating ────────────────────────────────────────────────────────────────

/** Matches `fyb_pair_table_format_chk` in migration 011 — keep the two in step. */
const TABLE_PATTERN = /^[A-Z0-9]{1,12}$/;

export type TableInput =
    | { ok: true; value: string | null }
    | { ok: false; message: string };

/**
 * A typed label, as it will be stored.
 *
 * Case and spacing are fixed silently — "a 4", "A4" and "a4 " are one table,
 * and three spellings of one table is how two couples end up at one chair.
 * Anything else is refused with the rule spelled out, because at the door a
 * rejected label needs to say what to type instead.
 */
export const parseTableNumber = (raw: string): TableInput => {
    const value = raw.replace(/\s+/g, "").toUpperCase();
    if (!value) return { ok: true, value: null };

    if (value.length > 12) {
        return { ok: false, message: "A table label can be up to 12 characters." };
    }
    if (!TABLE_PATTERN.test(value)) {
        return {
            ok: false,
            message: "Letters and numbers only — like A4, VIP2 or 12.",
        };
    }
    return { ok: true, value };
};

export type TableWrite =
    | { ok: true; tableNumber: string | null }
    | { ok: false; message: string };

/** Who is sitting at this table already — for the "A4 is taken" message. */
const describeTableHolder = async (tableNumber: string): Promise<string> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_pair_intents")
        .select(
            "code, associate_name, " +
                "initiator:fyb_registrations!fyb_pair_intents_initiator_registration_id_fkey(first_name, last_name), " +
                "partner:fyb_registrations!fyb_pair_intents_partner_registration_id_fkey(first_name, last_name)"
        )
        .eq("table_number", tableNumber)
        .maybeSingle<{
            code: string;
            associate_name: string | null;
            initiator: { first_name: string; last_name: string } | null;
            partner: { first_name: string; last_name: string } | null;
        }>();

    if (!data) return "another pair";

    const first = data.initiator
        ? fullName(data.initiator.first_name, data.initiator.last_name)
        : null;
    const second = data.partner
        ? fullName(data.partner.first_name, data.partner.last_name)
        : data.associate_name;

    const names = [first, second].filter(Boolean).join(" & ");
    return names || data.code;
};

/**
 * Assign, move or clear a pair's table.
 *
 * The unique index does the deciding. Two gates typing A4 at the same instant
 * is not something this code can win by checking first — one write lands, the
 * other comes back 23505, and that one is turned into the name of whoever is
 * already sitting there.
 */
export const setTableNumber = async (
    intentId: string,
    value: string
): Promise<TableWrite> => {
    const parsed = parseTableNumber(value);
    if (!parsed.ok) return { ok: false, message: parsed.message };

    const tableNumber = parsed.value;
    const supabase = createServerSupabase();

    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .update({ table_number: tableNumber })
        .eq("id", intentId)
        .eq("status", "approved")
        .select("id")
        .maybeSingle<{ id: string }>();

    if (error) {
        // 23505 — somebody else holds this table.
        if (error.code === "23505" && tableNumber) {
            const holder = await describeTableHolder(tableNumber);
            return {
                ok: false,
                message: `Table ${tableNumber} is already ${holder}'s. Move them first, or pick another table.`,
            };
        }
        // 23514 — the seat was pulled out from under a couple already inside.
        if (error.message.includes("fyb_pair_checkin_needs_table_chk")) {
            return {
                ok: false,
                message: "They're already inside — undo their check-in before clearing the table.",
            };
        }
        if (error.message.includes("fyb_pair_table_format_chk")) {
            return { ok: false, message: "Letters and numbers only — like A4, VIP2 or 12." };
        }
        console.error("setTableNumber failed:", error.message);
        return { ok: false, message: "Could not save the table. Try again." };
    }

    if (!data) return { ok: false, message: NOT_APPROVED };

    return { ok: true, tableNumber };
};
