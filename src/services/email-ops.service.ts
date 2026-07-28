import "server-only";

import { timingSafeEqual } from "node:crypto";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Email operations — queue health, delivery analytics, and a manual drain.
 *
 * This sits behind an unguessable URL rather than the admin session, because it
 * is deliberately narrower than "admin": it exposes recipient addresses and
 * failure details, and it can push mail. Not every admin needs that.
 *
 * The URL is a real secret, not decoration. It is compared in constant time,
 * lives only in `OPS_KEY`, and a miss renders the ordinary 404 — so probing
 * cannot distinguish a wrong key from a route that was never there.
 */

/** Constant-time check of the URL segment against `OPS_KEY`. */
export const isOpsKeyValid = (candidate: string): boolean => {
    const expected = process.env.OPS_KEY;
    // Unset means the page does not exist on this deployment — fail closed.
    if (!expected || expected.length < 12) return false;

    const a = Buffer.from(candidate);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
};

export type QueueSnapshot = {
    pending: number;
    sending: number;
    sent: number;
    failed: number;
};

export type StuckRow = {
    id: string;
    templateKey: string | null;
    recipientEmail: string | null;
    status: string;
    attempts: number;
    lastError: string | null;
    createdAt: string;
};

export type DeliveryStats = {
    last24hSent: number;
    last24hFailed: number;
    oldestPendingAt: string | null;
};

export type EmailOpsData = {
    queue: QueueSnapshot;
    stuck: StuckRow[];
    stats: DeliveryStats;
};

type QueueRow = {
    id: string;
    template_key: string | null;
    recipient_email: string | null;
    status: string;
    attempts: number;
    last_error: string | null;
    created_at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const getEmailOpsData = async (): Promise<EmailOpsData> => {
    const supabase = createServerSupabase();
    const since = new Date(Date.now() - DAY_MS).toISOString();

    // Everything that isn't `sent` is small by nature, so pull it whole rather
    // than paginating — this page exists to answer "what is stuck right now".
    const [queueRes, logsRes] = await Promise.all([
        supabase
            .from("fyb_email_queue")
            .select("id, template_key, recipient_email, status, attempts, last_error, created_at")
            .order("created_at", { ascending: true })
            .returns<QueueRow[]>(),
        supabase
            .from("fyb_email_logs")
            .select("success, sent_at")
            .gte("sent_at", since)
            .returns<{ success: boolean; sent_at: string }[]>(),
    ]);

    const rows = queueRes.data ?? [];
    const queue: QueueSnapshot = { pending: 0, sending: 0, sent: 0, failed: 0 };
    for (const row of rows) {
        if (row.status in queue) queue[row.status as keyof QueueSnapshot] += 1;
    }

    const unresolved = rows.filter((r) => r.status !== "sent");
    const logs = logsRes.data ?? [];

    return {
        queue,
        stuck: unresolved.slice(0, 50).map((row) => ({
            id: row.id,
            templateKey: row.template_key,
            recipientEmail: row.recipient_email,
            status: row.status,
            attempts: row.attempts,
            lastError: row.last_error,
            createdAt: row.created_at,
        })),
        stats: {
            last24hSent: logs.filter((l) => l.success).length,
            last24hFailed: logs.filter((l) => !l.success).length,
            oldestPendingAt:
                unresolved.find((r) => r.status === "pending")?.created_at ?? null,
        },
    };
};

export type DrainResult = {
    ok: boolean;
    message: string;
};

/**
 * Poke the worker and report its tally back.
 *
 * The automatic ping after each enqueue is best-effort — `after()` fires once
 * the response is flushed and nothing retries it — so a lost ping strands rows
 * at `pending`. This is the manual fix, and the returned counts double as the
 * diagnosis.
 */
export const drainEmailQueue = async (): Promise<DrainResult> => {
    const baseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const drainSecret = process.env.EMAIL_DRAIN_SECRET;

    if (!baseUrl || !serviceKey) {
        return { ok: false, message: "Email is not configured on this deployment." };
    }

    try {
        const response = await fetch(`${baseUrl}/functions/v1/send-fyb-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceKey}`,
                ...(drainSecret ? { "x-drain-secret": drainSecret } : {}),
            },
            body: JSON.stringify({ drain: true }),
        });

        if (response.status === 401) {
            return {
                ok: false,
                message:
                    "Worker rejected the drain secret — EMAIL_DRAIN_SECRET and FYB_EMAIL_DRAIN_SECRET differ.",
            };
        }
        if (!response.ok) {
            return { ok: false, message: `Worker returned ${response.status}.` };
        }

        const result = (await response.json()) as {
            processed?: number;
            sent?: number;
            failed?: number;
            throttled?: boolean;
        };

        if (result.throttled) {
            return {
                ok: false,
                message: `Sent ${result.sent ?? 0}, then ZeptoMail throttled us — likely out of credit. The rest stay queued.`,
            };
        }
        if (!result.processed) {
            return { ok: true, message: "Nothing was waiting — the queue is empty." };
        }

        const failed = result.failed ? ` ${result.failed} failed.` : "";
        return {
            ok: true,
            message: `Sent ${result.sent ?? 0} of ${result.processed}.${failed}`,
        };
    } catch (error) {
        console.error("drainEmailQueue failed:", error);
        return { ok: false, message: "Could not reach the email worker." };
    }
};
