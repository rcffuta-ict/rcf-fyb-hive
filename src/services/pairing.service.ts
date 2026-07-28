import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
    Gender,
    PairCard,
    PairIntentKind,
    PairIntentRecord,
    PairIntentStatus,
    PairingStatus,
} from "@/types/fyb.types";

/**
 * Pairing rules and state.
 *
 * Status is derived from `fyb_pair_intents`, never stored on a registration:
 *
 *   single      — no live intent
 *   in_between  — a pending intent exists (submitted, not yet paid/approved)
 *   taken       — an approved intent exists; payment confirmed, and final
 *
 * The important asymmetry: **pending intents are not exclusive**. Several
 * people may pair with the same person and whoever's payment is confirmed first
 * wins. Approval is the exclusive, irreversible step, and that one is guarded by
 * partial unique indexes in the database rather than by anything here.
 */

export type LiveIntent = {
    id: string;
    kind: PairIntentKind;
    status: "pending" | "approved";
    initiatorId: string;
    partnerId: string | null;
};

type IntentRow = {
    id: string;
    kind: PairIntentKind;
    status: "pending" | "approved";
    initiator_registration_id: string;
    partner_registration_id: string | null;
};

const LIVE = ["pending", "approved"];

const toLiveIntent = (row: IntentRow): LiveIntent => ({
    id: row.id,
    kind: row.kind,
    status: row.status,
    initiatorId: row.initiator_registration_id,
    partnerId: row.partner_registration_id,
});

/** Every live (pending or approved) intent touching any of these registrations. */
export const getLiveIntents = async (registrationIds: string[]): Promise<LiveIntent[]> => {
    if (registrationIds.length === 0) return [];

    const supabase = createServerSupabase();
    const idList = `(${registrationIds.join(",")})`;

    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .select("id, kind, status, initiator_registration_id, partner_registration_id")
        .in("status", LIVE)
        .or(`initiator_registration_id.in.${idList},partner_registration_id.in.${idList}`)
        .returns<IntentRow[]>();

    if (error) {
        console.error("getLiveIntents failed:", error.message);
        return [];
    }
    return (data ?? []).map(toLiveIntent);
};

/** Status per registration id. Ids with no live intent come back `single`. */
export const getPairingStatuses = async (
    registrationIds: string[]
): Promise<Map<string, PairingStatus>> => {
    const statuses = new Map<string, PairingStatus>(
        registrationIds.map((id) => [id, "single" as PairingStatus])
    );
    if (registrationIds.length === 0) return statuses;

    const intents = await getLiveIntents(registrationIds);

    for (const intent of intents) {
        const status: PairingStatus = intent.status === "approved" ? "taken" : "in_between";
        for (const id of [intent.initiatorId, intent.partnerId]) {
            if (!id || !statuses.has(id)) continue;
            // `taken` outranks `in_between` — an approved pairing is final, and a
            // stale pending intent alongside it must never downgrade the badge.
            if (status === "taken" || statuses.get(id) === "single") {
                statuses.set(id, status);
            }
        }
    }

    return statuses;
};

export type Availability = {
    available: boolean;
    status: PairingStatus;
    reason?: string;
};

/**
 * Whether one person can still be paired with at all, independent of who is
 * asking. Two things close a person off:
 *
 *  • an approved pairing — they're in a paid agreement, and it's permanent
 *  • a live associate intent — the lock lands when the associate is submitted,
 *    so nobody can hold an associate while entertaining finalist offers
 */
export const getAvailability = async (registrationId: string): Promise<Availability> => {
    const intents = await getLiveIntents([registrationId]);

    const approved = intents.find((i) => i.status === "approved");
    if (approved) {
        return {
            available: false,
            status: "taken",
            reason: "Already spoken for — this pairing is paid and final.",
        };
    }

    const associate = intents.find((i) => i.kind === "associate");
    if (associate) {
        return {
            available: false,
            status: "in_between",
            reason: "Already bringing someone from outside the fellowship.",
        };
    }

    return {
        available: true,
        status: intents.length > 0 ? "in_between" : "single",
    };
};

export type PairCheck = { ok: true } | { ok: false; message: string };

/**
 * The single source of truth for "can these two pair?". Both server actions
 * call it, and the UI copy mirrors it — so a rule can never be enforced in one
 * place and contradicted in another.
 */
export const canPair = async (a: PairCard, b: PairCard): Promise<PairCheck> => {
    if (a.registrationId === b.registrationId) {
        return { ok: false, message: "That's your own token — you'll need someone else's." };
    }

    if (!a.gender || !b.gender) {
        return {
            ok: false,
            message: "One of these profiles has no gender on record. Contact the organizers.",
        };
    }

    if (a.gender === b.gender) {
        return {
            ok: false,
            message: `The dinner pairs a brother with a sister — you'll need a ${
                a.gender === "male" ? "sister's" : "brother's"
            } token.`,
        };
    }

    for (const person of [a, b]) {
        const availability = await getAvailability(person.registrationId);
        if (!availability.available) {
            return {
                ok: false,
                message: `${person.firstName} is ${availability.reason?.toLowerCase() ?? "unavailable"}`,
            };
        }
    }

    if (await hasPendingBetween(a.registrationId, b.registrationId)) {
        return {
            ok: false,
            message: "You two already have a pairing waiting on payment. Check your code.",
        };
    }

    return { ok: true };
};

/** Whether these exact two already have a pending intent, in either direction. */
export const hasPendingBetween = async (aId: string, bId: string): Promise<boolean> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_pair_intents")
        .select("id")
        .eq("status", "pending")
        .or(
            `and(initiator_registration_id.eq.${aId},partner_registration_id.eq.${bId}),` +
                `and(initiator_registration_id.eq.${bId},partner_registration_id.eq.${aId})`
        )
        .limit(1);

    return (data ?? []).length > 0;
};

/** The gender this person's date must be. */
export const expectedPartnerGender = (gender: Gender): Gender =>
    gender === "male" ? "female" : "male";

/** Church register: how to refer to the person they're looking for. */
export const partnerTerm = (gender: Gender | null): string => {
    if (gender === "male") return "sister";
    if (gender === "female") return "brother";
    return "person";
};

// ─── Admin ──────────────────────────────────────────────────────────────────

type IntentJoinRow = {
    id: string;
    code: string;
    kind: PairIntentKind;
    status: PairIntentStatus;
    amount: number;
    created_at: string;
    approved_at: string | null;
    cancel_reason: string | null;
    associate_name: string | null;
    associate_email: string | null;
    associate_phone: string | null;
    associate_gender: string | null;
    associate_relationship: string | null;
    initiator: PairPersonRow | null;
    partner: PairPersonRow | null;
};

type PairPersonRow = {
    id: string;
    first_name: string;
    last_name: string;
    gender: string | null;
    level: string;
    unit: string | null;
    photo_url: string;
};

const personToCard = (row: PairPersonRow, status: PairingStatus): PairCard => ({
    registrationId: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: (row.gender as Gender | null) ?? null,
    level: row.level,
    unit: row.unit,
    photoUrl: row.photo_url,
    pairingStatus: status,
    available: status === "single" || status === "in_between",
});

const PERSON_COLUMNS = "id, first_name, last_name, gender, level, unit, photo_url";

const INTENT_SELECT =
    "id, code, kind, status, amount, created_at, approved_at, cancel_reason, " +
    "associate_name, associate_email, associate_phone, associate_gender, associate_relationship, " +
    `initiator:fyb_registrations!fyb_pair_intents_initiator_registration_id_fkey(${PERSON_COLUMNS}), ` +
    `partner:fyb_registrations!fyb_pair_intents_partner_registration_id_fkey(${PERSON_COLUMNS})`;

/**
 * Every pair intent, for the admin table. Cancelled intents are included on
 * purpose: someone may have transferred money before losing a conflict, and
 * that list is the only record for handling them.
 */
export const getPairIntents = async (
    statusFilter?: PairIntentStatus
): Promise<PairIntentRecord[]> => {
    const supabase = createServerSupabase();
    let query = supabase
        .from("fyb_pair_intents")
        .select(INTENT_SELECT)
        .order("created_at", { ascending: false })
        .limit(200);

    if (statusFilter) query = query.eq("status", statusFilter);

    const { data, error } = await query.returns<IntentJoinRow[]>();
    if (error) {
        console.error("getPairIntents failed:", error.message);
        return [];
    }

    const rows = data ?? [];
    const ids = rows.flatMap((row) =>
        [row.initiator?.id, row.partner?.id].filter((id): id is string => Boolean(id))
    );
    const statuses = await getPairingStatuses([...new Set(ids)]);

    return rows
        .filter((row): row is IntentJoinRow & { initiator: PairPersonRow } => Boolean(row.initiator))
        .map((row) => ({
            id: row.id,
            code: row.code,
            kind: row.kind,
            status: row.status,
            amount: row.amount,
            createdAt: row.created_at,
            approvedAt: row.approved_at,
            cancelReason: row.cancel_reason,
            initiator: personToCard(
                row.initiator,
                statuses.get(row.initiator.id) ?? "single"
            ),
            partner: row.partner
                ? personToCard(row.partner, statuses.get(row.partner.id) ?? "single")
                : null,
            associate: row.associate_name
                ? {
                      name: row.associate_name,
                      email: row.associate_email ?? "",
                      phone: row.associate_phone ?? "",
                      relationship: row.associate_relationship ?? "",
                      gender: (row.associate_gender as Gender) ?? "female",
                  }
                : null,
        }));
};
