import "server-only";

import { after } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Transactional email, outbox-style.
 *
 * Nothing in this app sends mail inline. Callers write a row to
 * `fyb_email_queue` and ping the `send-fyb-email` Edge Function, which drains the
 * queue and talks to ZeptoMail. That buys durability (a lost ping leaves the
 * row `pending` for the next drain or the 5-minute cron sweep), retries, an
 * audit trail in `fyb_email_logs`, and mutations that never block on SMTP.
 */

export type EnqueueResult = {
    success: boolean;
    error?: string;
};

/**
 * Nudge the worker without blocking the response. `after()` runs once the
 * response is flushed, so the user never waits on a drain.
 */
export const triggerEmailDrain = (): void => {
    const run = async (): Promise<void> => {
        const baseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const drainSecret = process.env.EMAIL_DRAIN_SECRET;
        if (!baseUrl || !serviceKey) return;

        try {
            await fetch(`${baseUrl}/functions/v1/send-fyb-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${serviceKey}`,
                    ...(drainSecret ? { "x-drain-secret": drainSecret } : {}),
                },
                body: JSON.stringify({ drain: true }),
            });
        } catch (error) {
            // Never surface a drain failure: the row is safely queued and the
            // next drain (or the cron sweep) picks it up.
            console.error("Email drain trigger failed:", error);
        }
    };

    try {
        after(run);
    } catch {
        // Outside a request scope (scripts, cron handlers) `after()` throws.
        void run();
    }
};

const enqueue = async (row: Record<string, unknown>): Promise<EnqueueResult> => {
    try {
        const supabase = createServerSupabase();
        const { error } = await supabase.from("fyb_email_queue").insert(row);

        if (error) {
            console.error("Email enqueue failed:", error.message);
            return { success: false, error: error.message };
        }

        triggerEmailDrain();
        return { success: true };
    } catch (error) {
        console.error("Email enqueue threw:", error);
        return { success: false, error: (error as Error).message };
    }
};

/**
 * Queue a templated email. Copy lives in `fyb_email_templates`; variables are
 * resolved by the worker at send time from `contextId`, so sensitive values
 * (like a consent token) never touch the queue row.
 */
export const enqueueTemplateEmail = async (input: {
    templateKey: string;
    contextId?: string;
    contextType?: string;
    recipientEmail?: string;
    recipientName?: string;
}): Promise<EnqueueResult> =>
    enqueue({
        mode: "template",
        template_key: input.templateKey,
        context_id: input.contextId ?? null,
        context_type: input.contextType ?? null,
        recipient_email: input.recipientEmail ?? null,
        recipient_name: input.recipientName ?? null,
    });

/** Queue a one-off message composed by an admin. */
export const enqueueCustomEmail = async (input: {
    subject: string;
    bodyHtml: string;
    contextId?: string;
    recipientEmail: string;
    recipientName?: string;
}): Promise<EnqueueResult> =>
    enqueue({
        mode: "custom",
        subject: input.subject,
        body_html: input.bodyHtml,
        context_id: input.contextId ?? null,
        recipient_email: input.recipientEmail,
        recipient_name: input.recipientName ?? null,
    });
