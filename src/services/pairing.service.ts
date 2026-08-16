import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
    Gender,
    PairCard,
    PairIntentKind,
    PairIntentRecord,
    PairIntentStatus,
    PairingStatus,
    PairingVibe,
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
export const getLiveIntents = async (
    registrationIds: string[]
): Promise<LiveIntent[]> => {
    if (registrationIds.length === 0) return [];

    const supabase = createServerSupabase();
    const idList = `(${registrationIds.join(",")})`;

    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .select(
            "id, kind, status, initiator_registration_id, partner_registration_id"
        )
        .in("status", LIVE)
        .or(
            `initiator_registration_id.in.${idList},partner_registration_id.in.${idList}`
        )
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
        const status: PairingStatus =
            intent.status === "approved" ? "taken" : "in_between";
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

/**
 * The numbers behind the nudge shown to someone who is already registered.
 *
 * `availableOpposite` counts only people of the *opposite* gender with no live
 * intent at all — the pool they could actually still pair with, not a headline
 * "still single" number that includes their own gender and would be a lie.
 * `inBetween` counts everybody sitting on an unpaid pending intent, which is
 * the field they're racing against once they've submitted one.
 */
export const getPairingVibe = async (
    registrationId: string,
    gender: Gender | null
): Promise<PairingVibe | null> => {
    const supabase = createServerSupabase();

    // Both tables are small (a cohort, not a population), so two unfiltered
    // reads beat building a giant `.or()` over every registration id.
    const [people, intents] = await Promise.all([
        supabase
            .from("fyb_registrations")
            .select("id, gender")
            .returns<{ id: string; gender: string | null }[]>(),
        supabase
            .from("fyb_pair_intents")
            .select(
                "status, initiator_registration_id, partner_registration_id"
            )
            .in("status", LIVE)
            .returns<
                {
                    status: "pending" | "approved";
                    initiator_registration_id: string;
                    partner_registration_id: string | null;
                }[]
            >(),
    ]);

    if (people.error || intents.error) {
        console.error(
            "getPairingVibe failed:",
            people.error?.message ?? intents.error?.message
        );
        return null;
    }

    const rows = people.data ?? [];
    if (!rows.some((row) => row.id === registrationId)) return null;

    const spoken = new Map<string, PairingStatus>();
    for (const intent of intents.data ?? []) {
        const status: PairingStatus =
            intent.status === "approved" ? "taken" : "in_between";
        for (const id of [
            intent.initiator_registration_id,
            intent.partner_registration_id,
        ]) {
            // `taken` outranks `in_between`, same rule as getPairingStatuses.
            if (!id) continue;
            if (status === "taken" || !spoken.has(id)) spoken.set(id, status);
        }
    }

    const opposite = gender ? expectedPartnerGender(gender) : null;

    return {
        status: spoken.get(registrationId) ?? "single",
        availableOpposite: opposite
            ? rows.filter(
                  (row) => row.gender === opposite && !spoken.has(row.id)
              ).length
            : 0,
        // Everyone *else* in-between — the copy says "others", so counting
        // them among the people they're racing would be wrong.
        inBetween: [...spoken.entries()].filter(
            ([id, s]) => s === "in_between" && id !== registrationId
        ).length,
    };
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
export const getAvailability = async (
    registrationId: string
): Promise<Availability> => {
    const intents = await getLiveIntents([registrationId]);

    const approved = intents.find((i) => i.status === "approved");
    if (approved) {
        return {
            available: false,
            status: "taken",
            reason: "Already spoken for — this person is taken.",
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
        return {
            ok: false,
            message: "That's your own token — you'll need someone else's.",
        };
    }

    if (!a.gender || !b.gender) {
        return {
            ok: false,
            message:
                "One of these profiles has no gender on record. Contact the organizers.",
        };
    }

    if (a.gender === b.gender) {
        const both = a.gender === "male" ? "brothers" : "sisters";
        const needed = a.gender === "male" ? "sister" : "brother";
        return {
            ok: false,
            message: `Ah ah! You're both ${both}. 😅 Be serious — the dinner pairs a brother with a sister, so go and get a ${needed}'s token.`,
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

    // A pre-existing intent between these two is deliberately NOT an error
    // here: the caller looks it up first and shows its status instead. See
    // `createFinalistIntent`.
    return { ok: true };
};

export type ExistingIntent = {
    id: string;
    code: string;
    status: "pending" | "approved";
    amount: number;
};

/**
 * A live intent between exactly these two, in either direction.
 *
 * A pairing is the same pairing whichever token was entered first, so this
 * looks both ways round. The database enforces the same idea with a unique
 * index over normalised (low, high) ids — this function is what lets the app
 * *show* the existing intent instead of bouncing off that index with an error.
 */
export const findLiveIntentBetween = async (
    aId: string,
    bId: string
): Promise<ExistingIntent | null> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .select("id, code, status, amount")
        .eq("kind", "finalist")
        .in("status", LIVE)
        .or(
            `and(initiator_registration_id.eq.${aId},partner_registration_id.eq.${bId}),` +
                `and(initiator_registration_id.eq.${bId},partner_registration_id.eq.${aId})`
        )
        .limit(1)
        .returns<ExistingIntent[]>();

    if (error) {
        console.error("findLiveIntentBetween failed:", error.message);
        return null;
    }
    return data?.[0] ?? null;
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

const PERSON_COLUMNS =
    "id, first_name, last_name, gender, level, unit, photo_url";

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
        [row.initiator?.id, row.partner?.id].filter((id): id is string =>
            Boolean(id)
        )
    );
    const statuses = await getPairingStatuses([...new Set(ids)]);

    return rows
        .filter((row): row is IntentJoinRow & { initiator: PairPersonRow } =>
            Boolean(row.initiator)
        )
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
                ? personToCard(
                      row.partner,
                      statuses.get(row.partner.id) ?? "single"
                  )
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

export type PairingStats = {
    finalists: number;
    /** Registrations in an approved pairing — people, not intents. */
    pairedFinalists: number;
    single: number;
    approved: number;
    pending: number;
    cancelled: number;
    finalistPairs: number;
    associatePairs: number;
    /** Naira actually collected, i.e. the sum over approved intents. */
    confirmedRevenue: number;
    /** Still owed: the sum over pending intents, most of which never lands. */
    pendingRevenue: number;
    timeline: { day: string; intents: number }[];
};

const emptyPairingStats: PairingStats = {
    finalists: 0,
    pairedFinalists: 0,
    single: 0,
    approved: 0,
    pending: 0,
    cancelled: 0,
    finalistPairs: 0,
    associatePairs: 0,
    confirmedRevenue: 0,
    pendingRevenue: 0,
    timeline: [],
};

type StatRow = {
    status: PairIntentStatus;
    kind: PairIntentKind;
    amount: number;
    created_at: string;
    initiator_registration_id: string;
    partner_registration_id: string | null;
};

/** Local calendar day, so an 11pm pairing lands on the night it happened. */
const lagosDay = (iso: string): string =>
    new Date(iso).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

/**
 * The whole pairing picture in one read.
 *
 * Unlike votes — which multiply out to voters × categories and had to be
 * aggregated in Postgres — intents are bounded by the number of finalists, so a
 * few hundred rows is the ceiling for one dinner and counting them here is
 * honest. The `limit` is a guard, not a paging window: if it ever binds, this
 * needs a view, and the assumption above was wrong.
 */
export const getPairingStats = async (): Promise<PairingStats> => {
    try {
        const supabase = createServerSupabase();
        const [registrations, intents] = await Promise.all([
            supabase.from("fyb_registrations").select("id", { count: "exact", head: true }),
            supabase
                .from("fyb_pair_intents")
                .select(
                    "status, kind, amount, created_at, initiator_registration_id, partner_registration_id"
                )
                .order("created_at", { ascending: true })
                .limit(5000)
                .returns<StatRow[]>(),
        ]);

        if (intents.error) {
            console.error("getPairingStats failed:", intents.error.message);
            return emptyPairingStats;
        }

        const rows = intents.data ?? [];
        const finalists = registrations.count ?? 0;

        // Count people, not intents: one finalist may hold several pending
        // intents, and an associate intent occupies only its initiator.
        const spokenFor = new Set<string>();
        const paired = new Set<string>();
        const byDay = new Map<string, number>();
        const stats = { ...emptyPairingStats, finalists };

        for (const row of rows) {
            if (row.status === "cancelled") {
                stats.cancelled += 1;
                continue;
            }

            spokenFor.add(row.initiator_registration_id);
            if (row.partner_registration_id) spokenFor.add(row.partner_registration_id);
            byDay.set(lagosDay(row.created_at), (byDay.get(lagosDay(row.created_at)) ?? 0) + 1);

            if (row.status === "approved") {
                stats.approved += 1;
                stats.confirmedRevenue += row.amount;
                if (row.kind === "associate") stats.associatePairs += 1;
                else stats.finalistPairs += 1;
                paired.add(row.initiator_registration_id);
                if (row.partner_registration_id) paired.add(row.partner_registration_id);
            } else {
                stats.pending += 1;
                stats.pendingRevenue += row.amount;
            }
        }

        return {
            ...stats,
            pairedFinalists: paired.size,
            single: Math.max(0, finalists - spokenFor.size),
            timeline: [...byDay.entries()].map(([day, count]) => ({ day, intents: count })),
        };
    } catch (error) {
        console.error("getPairingStats threw:", error);
        return emptyPairingStats;
    }
};
