"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { makeSignedToken, readSignedToken } from "@/lib/signed-cookie";
import { createServerSupabase } from "@/lib/supabase/server";
import {
    findRegistrationsNeedingConsentEmail,
    getConsentEmailStatuses,
    sendConsentEmail,
} from "@/services/consent.service";
import {
    getPairIntents,
    getPairingStats,
    getPairingStatuses,
    type PairingStats,
} from "@/services/pairing.service";
import { getSettings, updateSetting } from "@/services/settings.service";
import { sendPairInvitations } from "@/services/invitation.service";
import type {
    AdminProfile,
    Gender,
    PairIntentRecord,
    PairIntentStatus,
    RegistrationRecord,
} from "@/types/fyb.types";

const COOKIE_NAME = "fyb_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

const COOKIE_SCOPE = "admin";

type AdminRow = {
    role: string;
    profiles: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
};

const fetchAdminByProfileId = async (
    profileId: string
): Promise<AdminProfile | null> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_admins")
        .select("role, profiles(id, first_name, last_name, email)")
        .eq("profile_id", profileId)
        .maybeSingle<AdminRow>();

    if (!data?.profiles) return null;
    return {
        profileId: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        email: data.profiles.email,
        role: data.role,
    };
};

export type AdminLoginResult = {
    ok: boolean;
    admin?: AdminProfile;
    message?: string;
};

/**
 * Admin gate: the email must belong to an existing profile that is listed in
 * `fyb_admins`. On success a signed, httpOnly session cookie is set.
 */
export async function adminLogin(email: string): Promise<AdminLoginResult> {
    const value = email?.trim().toLowerCase();
    if (!value) return { ok: false, message: "Enter your email." };

    try {
        const supabase = createServerSupabase();
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", value)
            .maybeSingle<{ id: string }>();

        if (!profile) {
            return {
                ok: false,
                message: "No member profile found for that email.",
            };
        }

        const admin = await fetchAdminByProfileId(profile.id);
        if (!admin) {
            return {
                ok: false,
                message: "This account is not an authorized admin.",
            };
        }

        const jar = await cookies();
        jar.set(COOKIE_NAME, makeSignedToken(COOKIE_SCOPE, profile.id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_MAX_AGE,
        });

        return { ok: true, admin };
    } catch (error) {
        console.error("adminLogin failed:", error);
        return {
            ok: false,
            message: "Something went wrong. Please try again.",
        };
    }
}

export async function adminLogout(): Promise<void> {
    const jar = await cookies();
    jar.delete(COOKIE_NAME);
}

/**
 * Returns the current admin if the signed cookie is valid AND the profile is
 * still in `fyb_admins` (re-checked every call, so a forged cookie is useless).
 */
export async function getCurrentAdmin(): Promise<AdminProfile | null> {
    try {
        const jar = await cookies();
        const profileId = readSignedToken(COOKIE_SCOPE, jar.get(COOKIE_NAME)?.value);
        if (!profileId) return null;
        return await fetchAdminByProfileId(profileId);
    } catch (error) {
        console.error("getCurrentAdmin failed:", error);
        return null;
    }
}

type RegistrationRow = {
    id: string;
    profile_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone_number: string | null;
    gender: string | null;
    level: string;
    entry_year: number | null;
    unit: string | null;
    photo_url: string;
    photo_public_id: string | null;
    created_at: string;
};

const toRegistrationRecord = (row: RegistrationRow): RegistrationRecord => ({
    id: row.id,
    profileId: row.profile_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phoneNumber: row.phone_number,
    gender: (row.gender as Gender | null) ?? null,
    level: row.level,
    entryYear: row.entry_year,
    unit: row.unit,
    photoUrl: row.photo_url,
    photoPublicId: row.photo_public_id,
    createdAt: row.created_at,
});

export type RegistrationsPage = {
    registrations: RegistrationRecord[];
    total: number;
    page: number;
    pageSize: number;
};

const PAGE_SIZE = 12;

/** Paginated, searchable registrations list (admin-only). */
export async function listRegistrations(params: {
    search?: string;
    page?: number;
}): Promise<RegistrationsPage> {
    const admin = await getCurrentAdmin();
    if (!admin) {
        return { registrations: [], total: 0, page: 1, pageSize: PAGE_SIZE };
    }

    const page = Math.max(1, params.page ?? 1);
    const search = params.search?.trim();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = createServerSupabase();
    let query = supabase
        .from("fyb_registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (search) {
        const term = `%${search}%`;
        query = query.or(
            `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone_number.ilike.${term}`
        );
    }

    const { data, count, error } = await query;
    if (error) {
        console.error("listRegistrations failed:", error);
        return { registrations: [], total: 0, page, pageSize: PAGE_SIZE };
    }

    const registrations = (data as RegistrationRow[]).map(toRegistrationRecord);

    // Delivery state only — `getConsentEmailStatuses` reads the queue, never the
    // token table, so nothing token-shaped can reach the browser from here.
    const [statuses, pairingStatuses] = await Promise.all([
        getConsentEmailStatuses(registrations.map((r) => ({ id: r.id, email: r.email }))),
        getPairingStatuses(registrations.map((r) => r.id)),
    ]);
    const statusById = new Map(statuses.map((s) => [s.registrationId, s.status]));

    return {
        registrations: registrations.map((r) => ({
            ...r,
            consentEmailStatus: statusById.get(r.id) ?? "not_sent",
            pairingStatus: pairingStatuses.get(r.id) ?? "single",
        })),
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
    };
}

export type ConsentActionResult = {
    ok: boolean;
    message: string;
};

/**
 * Resend one finalist's consent email — for the "I never got it" case.
 * Returns a message only; the admin never sees the token being resent, and the
 * finalist receives the same token as before (issuing is idempotent).
 */
export async function resendConsentEmail(
    registrationId: string
): Promise<ConsentActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const result = await sendConsentEmail(registrationId, { enforceCooldown: true });
    return {
        ok: result.success,
        message: result.success
            ? "Consent email queued — it'll arrive shortly."
            : (result.message ?? "Could not send."),
    };
}

/**
 * Backfill: queue the consent email for every registration that has never had
 * one. This is what covers finalists who registered before the feature shipped.
 * Safe to re-run — anyone already queued is skipped.
 */
export async function sendPendingConsentEmails(): Promise<ConsentActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const { ids, skippedNoEmail } = await findRegistrationsNeedingConsentEmail();
    if (ids.length === 0) {
        return { ok: true, message: "Everyone with an email address already has theirs." };
    }

    // Sequential, not Promise.all: each send is a few round-trips, and a burst
    // of hundreds would trip Supabase connection limits before it helped.
    let queued = 0;
    for (const id of ids) {
        const result = await sendConsentEmail(id);
        if (result.success) queued += 1;
    }

    const skipped = skippedNoEmail > 0 ? ` ${skippedNoEmail} skipped (no email on file).` : "";
    return { ok: true, message: `Queued ${queued} consent email${queued === 1 ? "" : "s"}.${skipped}` };
}

// ─── Pairing ────────────────────────────────────────────────────────────────

export type PairActionResult = { ok: boolean; message: string };

/** Every pair intent, newest first. Cancelled ones included deliberately. */
export async function listPairIntents(
    statusFilter?: PairIntentStatus
): Promise<PairIntentRecord[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return getPairIntents(statusFilter);
}

/**
 * Confirm a payment and make the pairing official.
 *
 * This is the moment everything else defers to: it is exclusive (enforced by
 * partial unique indexes, not by this code), irreversible, and it decides who
 * loses a conflict. Every other pending intent involving either person is
 * cancelled here — that is what makes "only the one paid for is recognized"
 * actually true.
 */
export async function approvePairIntent(id: string): Promise<PairActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const supabase = createServerSupabase();

    const { data: intent } = await supabase
        .from("fyb_pair_intents")
        .select("id, status, initiator_registration_id, partner_registration_id")
        .eq("id", id)
        .maybeSingle<{
            id: string;
            status: string;
            initiator_registration_id: string;
            partner_registration_id: string | null;
        }>();

    if (!intent) return { ok: false, message: "That pairing no longer exists." };
    if (intent.status === "approved") return { ok: true, message: "Already approved." };
    if (intent.status === "cancelled") {
        return { ok: false, message: "That pairing was cancelled — it can't be approved." };
    }

    const { error } = await supabase
        .from("fyb_pair_intents")
        .update({
            status: "approved",
            approved_at: new Date().toISOString(),
            approved_by: admin.profileId,
        })
        .eq("id", id)
        .eq("status", "pending");

    if (error) {
        // The partial unique index rejected it: one of these two already has an
        // approved pairing. A clean message beats a stack trace.
        if (error.code === "23505") {
            return {
                ok: false,
                message: "One of them is already in an approved pairing.",
            };
        }
        console.error("approvePairIntent failed:", error.message);
        return { ok: false, message: "Could not approve. Please try again." };
    }

    const people = [intent.initiator_registration_id, intent.partner_registration_id].filter(
        (value): value is string => Boolean(value)
    );

    // Everyone else who paired with either of these two loses now.
    const { error: cancelError } = await supabase
        .from("fyb_pair_intents")
        .update({ status: "cancelled", cancel_reason: "partner paired elsewhere" })
        .neq("id", id)
        .eq("status", "pending")
        .or(
            people
                .map(
                    (p) =>
                        `initiator_registration_id.eq.${p},partner_registration_id.eq.${p}`
                )
                .join(",")
        );
    if (cancelError) console.error("cascade cancel failed:", cancelError.message);

    const invited = await sendPairInvitations(id);
    if (!invited.success) console.error("invitation enqueue failed:", invited.message);

    revalidatePath("/admin");
    revalidatePath("/pairing");
    return { ok: true, message: "Approved — invitations are on their way." };
}

/** Cancel a pending intent. Ordinary housekeeping; carries no money meaning. */
export async function cancelPairIntent(
    id: string,
    reason: string
): Promise<PairActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_pair_intents")
        .update({ status: "cancelled", cancel_reason: reason || "cancelled by organizer" })
        .eq("id", id)
        .eq("status", "pending");

    if (error) {
        console.error("cancelPairIntent failed:", error.message);
        return { ok: false, message: "Could not cancel. Please try again." };
    }

    revalidatePath("/admin");
    revalidatePath("/pairing");
    return { ok: true, message: "Cancelled." };
}

/**
 * Undo an approval. Admin-error escape hatch only — an approved pairing is
 * meant to be final, and this is never a refund route.
 */
export async function revokePairApproval(
    id: string,
    reason: string
): Promise<PairActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_pair_intents")
        .update({
            status: "cancelled",
            cancel_reason: `approval revoked by organizer: ${reason || "admin error"}`,
        })
        .eq("id", id)
        .eq("status", "approved");

    if (error) {
        console.error("revokePairApproval failed:", error.message);
        return { ok: false, message: "Could not revoke. Please try again." };
    }

    revalidatePath("/admin");
    revalidatePath("/pairing");
    return { ok: true, message: "Approval revoked." };
}

/**
 * Pairing at a glance. Admin-only: it carries revenue and how many finalists
 * are still unpaired, neither of which is anyone else's business.
 */
export async function getPairingStatsForAdmin(): Promise<PairingStats | null> {
    const admin = await getCurrentAdmin();
    if (!admin) return null;
    return getPairingStats();
}

export type AdminSettings = {
    pairingEnabled: boolean;
    pairAmount: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
};

export async function getAdminSettings(): Promise<AdminSettings> {
    const admin = await getCurrentAdmin();
    if (!admin) {
        return {
            pairingEnabled: false,
            pairAmount: 0,
            bankName: "",
            accountName: "",
            accountNumber: "",
        };
    }
    return getSettings();
}

export async function savePairingSettings(
    input: AdminSettings
): Promise<PairActionResult> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    if (!Number.isFinite(input.pairAmount) || input.pairAmount < 0) {
        return { ok: false, message: "Enter a valid amount." };
    }

    // This is where people's money goes — refuse to save it half-blank rather
    // than let the payment screen show an incomplete account.
    const accountNumber = input.accountNumber.trim();
    if (!input.bankName.trim() || !input.accountName.trim() || !accountNumber) {
        return { ok: false, message: "Bank, account name and account number are all required." };
    }
    if (!/^\d{10}$/.test(accountNumber)) {
        return { ok: false, message: "A Nigerian account number is 10 digits." };
    }

    const by = admin.email ?? admin.profileId;
    const results = await Promise.all([
        updateSetting("pairing_enabled", input.pairingEnabled, by),
        // Stamped once, never cleared: after pairing closes the link has to
        // survive, or the page that would tell somebody they've missed the
        // deadline is the one page they can no longer reach.
        ...(input.pairingEnabled ? [updateSetting("pairing_ran", true, by)] : []),
        updateSetting("pair_amount", Math.round(input.pairAmount), by),
        updateSetting("pay_bank_name", input.bankName.trim(), by),
        updateSetting("pay_account_name", input.accountName.trim(), by),
        updateSetting("pay_account_number", accountNumber, by),
    ]);

    if (results.some((r) => !r.success)) {
        return { ok: false, message: "Could not save settings." };
    }

    // The flag is read per request, so every route picks this up immediately.
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved." };
}
