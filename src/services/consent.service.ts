import "server-only";

import { generateConsentToken } from "@/lib/consent-token";
import { createServerSupabase } from "@/lib/supabase/server";
import { enqueueTemplateEmail } from "@/services/email.service";
import type { ConsentEmailStatus, ConsentStatusEntry } from "@/types/fyb.types";

/**
 * Consent tokens — issuing and delivery.
 *
 * ⚠️  THIS IS THE ONLY MODULE ALLOWED TO READ `fyb_consent_tokens.token`.
 *
 * A token is the finalist's consent, and it is visible in exactly one place:
 * the recipient's inbox. It must never be returned from a Server Action, put
 * in a store, rendered in the admin dashboard, or written onto a queue row —
 * the worker resolves it from `context_id` at render time. Nothing below
 * returns a token value to its caller, and no exported type carries one.
 */

const TEMPLATE_KEY = "fyb_consent";
const CONTEXT_TYPE = "fyb_registration";
const MAX_ISSUE_ATTEMPTS = 5;
/** Guards against a double-click sending two identical mails. */
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export type ConsentResult = {
    success: boolean;
    message?: string;
};

type RegistrationContact = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
};

/**
 * Whether this finalist holds a consent token — existence only.
 *
 * Lives here rather than in the caller because this module owns the table, and
 * the boundary is worth keeping even for a read that touches no token value:
 * one query for `token` written elsewhere is how that rule stops holding.
 */
export const hasConsentToken = async (registrationId: string): Promise<boolean> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_consent_tokens")
        .select("registration_id")
        .eq("registration_id", registrationId)
        .maybeSingle<{ registration_id: string }>();

    if (error) {
        console.error("hasConsentToken failed:", error.message);
        return false;
    }
    return Boolean(data);
};

/**
 * Ensure a registration has a token. Idempotent by design: re-issuing would
 * invalidate a token the finalist has already shared with their date, so an
 * existing row is always left exactly as it is.
 */
export const issueConsentToken = async (
    registrationId: string
): Promise<ConsentResult> => {
    const supabase = createServerSupabase();

    const { data: existing, error: readError } = await supabase
        .from("fyb_consent_tokens")
        .select("registration_id")
        .eq("registration_id", registrationId)
        .maybeSingle<{ registration_id: string }>();

    if (readError) {
        console.error("issueConsentToken read failed:", readError.message);
        return { success: false, message: "Could not read consent token." };
    }
    if (existing) return { success: true };

    // Uniqueness is the database's job, not ours: generate, insert, and let the
    // unique constraint reject a duplicate. Checking-then-inserting would race
    // two concurrent registrations into the same token; this can't.
    for (let attempt = 0; attempt < MAX_ISSUE_ATTEMPTS; attempt += 1) {
        const { error } = await supabase.from("fyb_consent_tokens").insert({
            registration_id: registrationId,
            token: generateConsentToken(),
        });

        if (!error) return { success: true };

        if (error.code !== "23505") {
            console.error("issueConsentToken insert failed:", error.message);
            return { success: false, message: "Could not issue consent token." };
        }

        // 23505 on `token` means we drew one already in use — redraw. On any
        // other unique constraint (the registration_id PK) another request beat
        // us to issuing this finalist's token, which is the desired end state.
        if (!error.message.includes("token")) return { success: true };
    }

    console.error("issueConsentToken exhausted retries for", registrationId);
    return { success: false, message: "Could not issue a unique consent token." };
};

/**
 * Issue (if needed) and queue the consent email for one registration.
 * `enforceCooldown` is on for admin-triggered sends and off for the automatic
 * send at registration time.
 */
export const sendConsentEmail = async (
    registrationId: string,
    options: { enforceCooldown?: boolean } = {}
): Promise<ConsentResult> => {
    const supabase = createServerSupabase();

    const { data: registration } = await supabase
        .from("fyb_registrations")
        .select("id, first_name, last_name, email")
        .eq("id", registrationId)
        .maybeSingle<RegistrationContact>();

    if (!registration) return { success: false, message: "Registration not found." };
    if (!registration.email) {
        return { success: false, message: "No email address on file for this finalist." };
    }

    if (options.enforceCooldown) {
        const { data: token } = await supabase
            .from("fyb_consent_tokens")
            .select("last_sent_at")
            .eq("registration_id", registrationId)
            .maybeSingle<{ last_sent_at: string | null }>();

        const lastSent = token?.last_sent_at ? Date.parse(token.last_sent_at) : 0;
        if (lastSent && Date.now() - lastSent < RESEND_COOLDOWN_MS) {
            return {
                success: false,
                message: "Already sent in the last 2 minutes — give it a moment.",
            };
        }
    }

    const issued = await issueConsentToken(registrationId);
    if (!issued.success) return issued;

    const queued = await enqueueTemplateEmail({
        templateKey: TEMPLATE_KEY,
        contextId: registrationId,
        contextType: CONTEXT_TYPE,
        recipientEmail: registration.email,
        recipientName: `${registration.first_name} ${registration.last_name}`.trim(),
    });

    if (!queued.success) {
        return { success: false, message: "Could not queue the email." };
    }

    const { error: stampError } = await supabase
        .from("fyb_consent_tokens")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("registration_id", registrationId);
    if (stampError) console.error("last_sent_at stamp failed:", stampError.message);

    return { success: true };
};

const toStatus = (queueStatus: string | undefined): ConsentEmailStatus => {
    if (queueStatus === "sent") return "sent";
    if (queueStatus === "failed") return "failed";
    if (queueStatus === "pending" || queueStatus === "sending") return "queued";
    return "not_sent";
};

/**
 * Delivery state of the consent email for a page of registrations — the latest
 * queue row per registration. Selects no token column; there is nothing here
 * that could leak one.
 */
export const getConsentEmailStatuses = async (
    registrations: { id: string; email: string | null }[]
): Promise<ConsentStatusEntry[]> => {
    const withEmail = registrations.filter((r) => r.email);
    if (withEmail.length === 0) {
        return registrations.map((r) => ({
            registrationId: r.id,
            status: "no_email" as const,
            lastSentAt: null,
        }));
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_email_queue")
        .select("context_id, status, created_at")
        .eq("template_key", TEMPLATE_KEY)
        .in(
            "context_id",
            withEmail.map((r) => r.id)
        )
        .order("created_at", { ascending: false })
        .returns<{ context_id: string; status: string; created_at: string }[]>();

    if (error) console.error("getConsentEmailStatuses failed:", error.message);

    // Rows arrive newest-first, so the first hit per context_id is the latest.
    const latest = new Map<string, { status: string; created_at: string }>();
    for (const row of data ?? []) {
        if (!latest.has(row.context_id)) latest.set(row.context_id, row);
    }

    return registrations.map((r) => {
        if (!r.email) {
            return { registrationId: r.id, status: "no_email" as const, lastSentAt: null };
        }
        const row = latest.get(r.id);
        return {
            registrationId: r.id,
            status: toStatus(row?.status),
            lastSentAt: row?.created_at ?? null,
        };
    });
};

/**
 * Registrations that still need their consent email — either no token was ever
 * issued or no queue row exists. Used by the admin backfill for finalists who
 * registered before this feature shipped.
 */
export const findRegistrationsNeedingConsentEmail = async (): Promise<{
    ids: string[];
    skippedNoEmail: number;
}> => {
    const supabase = createServerSupabase();

    const [registrationsRes, queueRes] = await Promise.all([
        supabase
            .from("fyb_registrations")
            .select("id, email")
            .returns<{ id: string; email: string | null }[]>(),
        supabase
            .from("fyb_email_queue")
            .select("context_id")
            .eq("template_key", TEMPLATE_KEY)
            .neq("status", "failed")
            .returns<{ context_id: string | null }[]>(),
    ]);

    const alreadyQueued = new Set(
        (queueRes.data ?? []).map((row) => row.context_id).filter(Boolean)
    );

    const registrations = registrationsRes.data ?? [];
    const withEmail = registrations.filter((r) => r.email);

    return {
        ids: withEmail.filter((r) => !alreadyQueued.has(r.id)).map((r) => r.id),
        skippedNoEmail: registrations.length - withEmail.length,
    };
};
