"use server";

import { revalidatePath } from "next/cache";

import { normalizeConsentToken } from "@/lib/consent-token";
import { createServerSupabase } from "@/lib/supabase/server";
import { checkTokenThrottle, recordTokenAttempt } from "@/lib/throttle";
import {
    canPair,
    expectedPartnerGender,
    findLiveIntentBetween,
    getAvailability,
    partnerTerm,
    type ExistingIntent,
} from "@/services/pairing.service";
import { getSettings } from "@/services/settings.service";
import type {
    AssociateDetails,
    Gender,
    PairCard,
    PairingStatus,
} from "@/types/fyb.types";

/**
 * Public pairing actions.
 *
 * Nothing here ever returns a consent token — tokens are input only. What comes
 * back is a `PairCard`: the same profile summary the person's own date would
 * see, which is exactly what sharing a token consents to.
 */

type RegistrationRow = {
    id: string;
    first_name: string;
    last_name: string;
    gender: string | null;
    level: string;
    unit: string | null;
    photo_url: string;
};

const CARD_COLUMNS = "id, first_name, last_name, gender, level, unit, photo_url";

const toCard = (
    row: RegistrationRow,
    status: PairingStatus,
    available: boolean,
    reason?: string
): PairCard => ({
    registrationId: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: (row.gender as Gender | null) ?? null,
    level: row.level,
    unit: row.unit,
    photoUrl: row.photo_url,
    pairingStatus: status,
    available,
    unavailableReason: reason,
});

export type ResolveResult =
    | { status: "ok"; card: PairCard; expects: Gender | null; expectsTerm: string }
    | { status: "not_found" | "throttled" | "error"; message: string };

/**
 * Resolve a consent token to the person it belongs to.
 *
 * Throttled per IP — see `src/lib/throttle.ts` for why that matters here.
 */
export async function resolveConsentToken(raw: string): Promise<ResolveResult> {
    const token = normalizeConsentToken(raw ?? "");
    if (!token) {
        return { status: "not_found", message: "That doesn't look like a valid token." };
    }

    const throttle = await checkTokenThrottle();
    if (!throttle.allowed) {
        return { status: "throttled", message: throttle.message ?? "Slow down a moment." };
    }

    try {
        const supabase = createServerSupabase();
        const { data } = await supabase
            .from("fyb_consent_tokens")
            .select(`registration_id, fyb_registrations(${CARD_COLUMNS})`)
            .eq("token", token)
            .maybeSingle<{ registration_id: string; fyb_registrations: RegistrationRow | null }>();

        const registration = data?.fyb_registrations;
        await recordTokenAttempt(Boolean(registration));

        if (!registration) {
            return {
                status: "not_found",
                message: "No one matches that token. Check it and try again.",
            };
        }

        const availability = await getAvailability(registration.id);
        const gender = (registration.gender as Gender | null) ?? null;

        return {
            status: "ok",
            card: toCard(
                registration,
                availability.status,
                availability.available,
                availability.reason
            ),
            expects: gender ? expectedPartnerGender(gender) : null,
            expectsTerm: partnerTerm(gender),
        };
    } catch (error) {
        console.error("resolveConsentToken failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}

export type IntentResult =
    | { status: "ok"; code: string; amount: number }
    /**
     * These two already have a live pairing. Not an error — the same two people
     * entering their tokens again should see where that pairing stands, not be
     * told off or handed a second code.
     */
    | { status: "existing"; code: string; amount: number; intentStatus: "pending" | "approved" }
    | { status: "blocked" | "error"; message: string };

/** Narration code for the transfer — short, unambiguous, easy to read aloud. */
const generateCode = (): string => {
    const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    let code = "PR";
    for (let i = 0; i < 4; i += 1) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
};

const loadCard = async (registrationId: string): Promise<PairCard | null> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_registrations")
        .select(CARD_COLUMNS)
        .eq("id", registrationId)
        .maybeSingle<RegistrationRow>();
    if (!data) return null;

    const availability = await getAvailability(data.id);
    return toCard(data, availability.status, availability.available, availability.reason);
};

const insertIntent = async (
    row: Record<string, unknown>,
    onConflict?: () => Promise<ExistingIntent | null>
): Promise<IntentResult> => {
    const supabase = createServerSupabase();
    const { pairAmount } = await getSettings();

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = generateCode();
        const { error } = await supabase
            .from("fyb_pair_intents")
            .insert({ ...row, code, amount: pairAmount });

        if (!error) return { status: "ok", code, amount: pairAmount };

        if (error.code === "23505") {
            // A duplicate `code` is just bad luck — redraw. A duplicate on any
            // other unique index means the associate lock, an approved pairing,
            // or this exact pair beat us here: a real answer, not a retry.
            if (error.message.includes("code")) continue;

            const existing = await onConflict?.();
            if (existing) {
                return {
                    status: "existing",
                    code: existing.code,
                    amount: existing.amount,
                    intentStatus: existing.status,
                };
            }

            return {
                status: "blocked",
                message: "That pairing is no longer possible — someone got there first.",
            };
        }

        console.error("insertIntent failed:", error.message);
        return { status: "error", message: "Could not create the pairing. Please try again." };
    }

    return { status: "error", message: "Could not create the pairing. Please try again." };
};

/** Pair two finalists, each of whom supplied their own consent token. */
export async function createFinalistIntent(
    initiatorToken: string,
    partnerToken: string
): Promise<IntentResult> {
    try {
        const [a, b] = await Promise.all([
            resolveConsentToken(initiatorToken),
            resolveConsentToken(partnerToken),
        ]);

        if (a.status !== "ok") return { status: "blocked", message: a.message };
        if (b.status !== "ok") return { status: "blocked", message: b.message };

        // Look before creating: a pairing is the same pairing whichever token
        // was entered first, so show the existing one rather than duplicating.
        const existing = await findLiveIntentBetween(
            a.card.registrationId,
            b.card.registrationId
        );
        if (existing) {
            return {
                status: "existing",
                code: existing.code,
                amount: existing.amount,
                intentStatus: existing.status,
            };
        }

        const check = await canPair(a.card, b.card);
        if (!check.ok) return { status: "blocked", message: check.message };

        const result = await insertIntent(
            {
                kind: "finalist",
                initiator_registration_id: a.card.registrationId,
                partner_registration_id: b.card.registrationId,
            },
            // If two devices submit the same pair at once, the unique index
            // rejects the loser — resolve that into the winner's intent rather
            // than an error, since both users wanted the same outcome.
            () => findLiveIntentBetween(a.card.registrationId, b.card.registrationId)
        );

        if (result.status === "ok") revalidatePath("/pairing");
        return result;
    } catch (error) {
        console.error("createFinalistIntent failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}

/**
 * Pair a finalist with an associate — someone outside the fellowship. This
 * takes the finalist off the market the moment it's submitted.
 */
export async function createAssociateIntent(
    initiatorToken: string,
    associate: Omit<AssociateDetails, "gender">
): Promise<IntentResult> {
    try {
        const resolved = await resolveConsentToken(initiatorToken);
        if (resolved.status !== "ok") {
            return { status: "blocked", message: resolved.message };
        }

        const card = resolved.card;
        if (!card.available) {
            return {
                status: "blocked",
                message: card.unavailableReason ?? "You can't pair right now.",
            };
        }
        if (!card.gender) {
            return {
                status: "blocked",
                message: "Your profile has no gender on record. Contact the organizers.",
            };
        }

        const result = await insertIntent({
            kind: "associate",
            initiator_registration_id: card.registrationId,
            associate_name: associate.name.trim(),
            associate_email: associate.email.trim().toLowerCase(),
            associate_phone: associate.phone.trim(),
            associate_relationship: associate.relationship.trim(),
            // Derived, never entered: the dinner pairs brother with sister.
            associate_gender: expectedPartnerGender(card.gender),
        });

        if (result.status === "ok") revalidatePath("/pairing");
        return result;
    } catch (error) {
        console.error("createAssociateIntent failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}

export type ExistingPairing = {
    code: string;
    amount: number;
    intentStatus: "pending" | "approved";
};

/**
 * Whether these two tokens already describe a pairing.
 *
 * Called before the eligibility checks on purpose: if two people are already
 * paired *with each other*, they read as "taken" and would otherwise be told
 * they're unavailable — when what they actually want is to see their own
 * pairing's status. Order doesn't matter, here or in the database.
 */
export async function findPairingBetween(
    tokenA: string,
    tokenB: string
): Promise<ExistingPairing | null> {
    try {
        const [a, b] = await Promise.all([
            resolveConsentToken(tokenA),
            resolveConsentToken(tokenB),
        ]);
        if (a.status !== "ok" || b.status !== "ok") return null;

        const existing = await findLiveIntentBetween(
            a.card.registrationId,
            b.card.registrationId
        );
        if (!existing) return null;

        return {
            code: existing.code,
            amount: existing.amount,
            intentStatus: existing.status,
        };
    } catch (error) {
        console.error("findPairingBetween failed:", error);
        return null;
    }
}

/** Re-read a card by id — used to refresh the other side before submitting. */
export async function refreshCard(registrationId: string): Promise<PairCard | null> {
    return loadCard(registrationId);
}

export type FeedItem = { id: string; text: string; at: string };

/**
 * The vibes feed.
 *
 * Strings are built here, server-side, and only first names ever cross the
 * wire — no surname, no unit. Shared first names are common in the fellowship,
 * which is the point: enough to spark "wait, which Precious?" without
 * publishing who is with whom before the night.
 */
export async function getPairFeed(limit = 8): Promise<FeedItem[]> {
    try {
        const supabase = createServerSupabase();
        const { data, error } = await supabase
            .from("fyb_pair_intents")
            .select(
                "id, kind, status, created_at, " +
                    "initiator:fyb_registrations!fyb_pair_intents_initiator_registration_id_fkey(first_name, gender), " +
                    "partner:fyb_registrations!fyb_pair_intents_partner_registration_id_fkey(first_name, gender)"
            )
            .in("status", ["pending", "approved"])
            .order("created_at", { ascending: false })
            .limit(limit)
            .returns<
                {
                    id: string;
                    kind: "finalist" | "associate";
                    status: "pending" | "approved";
                    created_at: string;
                    initiator: { first_name: string; gender: string | null } | null;
                    partner: { first_name: string; gender: string | null } | null;
                }[]
            >();

        if (error) {
            console.error("getPairFeed failed:", error.message);
            return [];
        }

        return (data ?? []).map((row) => {
            const name = row.initiator?.first_name ?? "Someone";
            const term = partnerTerm(row.initiator?.gender as Gender | null);

            if (row.status === "approved") {
                return { id: row.id, text: `${name} is locked in 🔒`, at: row.created_at };
            }
            if (row.kind === "associate") {
                return {
                    id: row.id,
                    text: `${name} is bringing someone special 💫`,
                    at: row.created_at,
                };
            }
            return {
                id: row.id,
                text: `${name} just paired with a ${term} ✨`,
                at: row.created_at,
            };
        });
    } catch (error) {
        console.error("getPairFeed threw:", error);
        return [];
    }
}

export type PairStats = { locked: number; pending: number; single: number };

/** Counters for the feed strip — aggregate only, no identities. */
export async function getPairStats(): Promise<PairStats> {
    try {
        const supabase = createServerSupabase();
        const [registrations, intents] = await Promise.all([
            supabase.from("fyb_registrations").select("id", { count: "exact", head: true }),
            supabase
                .from("fyb_pair_intents")
                .select("status, initiator_registration_id, partner_registration_id")
                .in("status", ["pending", "approved"])
                .returns<
                    {
                        status: string;
                        initiator_registration_id: string;
                        partner_registration_id: string | null;
                    }[]
                >(),
        ]);

        const rows = intents.data ?? [];

        // Count people, not intents: one finalist may hold several pending
        // intents, and an associate intent occupies only its initiator.
        const spokenFor = new Set<string>();
        for (const row of rows) {
            spokenFor.add(row.initiator_registration_id);
            if (row.partner_registration_id) spokenFor.add(row.partner_registration_id);
        }

        return {
            locked: rows.filter((r) => r.status === "approved").length,
            pending: rows.filter((r) => r.status === "pending").length,
            single: Math.max(0, (registrations.count ?? 0) - spokenFor.size),
        };
    } catch (error) {
        console.error("getPairStats threw:", error);
        return { locked: 0, pending: 0, single: 0 };
    }
}
