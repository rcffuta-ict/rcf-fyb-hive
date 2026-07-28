import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { fybEnv, sharedEnv } from "./env.ts";
import {
    renderButton,
    renderCallout,
    renderEventBlock,
    renderSteps,
    renderTokenBlock,
    wrapInEmailShell,
} from "./shell.ts";

/**
 * Email queue worker.
 *
 * Drains `fyb_email_queue`: claims a row, renders the template against its
 * context, sends via ZeptoMail, then marks the row sent/retry/failed and writes
 * an audit row to `fyb_email_logs`.
 *
 * Consent tokens are resolved HERE, from `context_id`, at render time — they
 * are never written onto a queue row, so no admin-facing view of the queue can
 * ever expose one.
 */

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BATCH_SIZE = 25;
const STUCK_AFTER_MINUTES = 5;
const DRAIN_SECRET = fybEnv("EMAIL_DRAIN_SECRET");

serve(async (req: Request): Promise<Response> => {
    // verify_jwt is off so the app can ping with a plain fetch — the endpoint
    // is gated on a shared secret instead of being left open.
    if (DRAIN_SECRET && req.headers.get("x-drain-secret") !== DRAIN_SECRET) {
        return json({ error: "unauthorized" }, 401);
    }

    try {
        const body = await req.json().catch(() => ({}));

        await reapStuck();

        const ids: string[] = body.queue_id ? [body.queue_id] : await pendingIds();

        let sent = 0;
        let failed = 0;
        for (const id of ids) {
            const row = await claim(id);
            if (!row) continue; // another run won this row
            (await processRow(row)) ? sent++ : failed++;
        }

        return json({ processed: ids.length, sent, failed }, 200);
    } catch (error) {
        console.error("queue worker error:", error);
        return json({ error: String(error) }, 500);
    }
});

// ─── Queue plumbing ─────────────────────────────────────────────────────────

async function pendingIds(): Promise<string[]> {
    const { data } = await supabase
        .from("fyb_email_queue")
        .select("id")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(BATCH_SIZE);
    return (data ?? []).map((r: { id: string }) => r.id);
}

/**
 * Atomically move a row pending → sending; returns it only if we won it.
 * The `.eq("status", "pending")` guard is load-bearing: without it two
 * overlapping drains both claim the row and the finalist gets two emails.
 */
async function claim(id: string) {
    const { data } = await supabase
        .from("fyb_email_queue")
        .update({ status: "sending" })
        .eq("id", id)
        .eq("status", "pending")
        .select("*")
        .single();
    return data;
}

/** Release rows abandoned mid-send by a crashed or timed-out invocation. */
async function reapStuck(): Promise<void> {
    const cutoff = new Date(Date.now() - STUCK_AFTER_MINUTES * 60_000).toISOString();
    await supabase
        .from("fyb_email_queue")
        .update({ status: "pending", last_error: "reclaimed after stuck send" })
        .eq("status", "sending")
        .lt("updated_at", cutoff);
}

// deno-lint-ignore no-explicit-any
async function processRow(row: any): Promise<boolean> {
    try {
        const { subject, html, recipient, recipientName } = await render(row);
        await sendEmail({ to: recipient, toName: recipientName, subject, html });

        await supabase
            .from("fyb_email_queue")
            .update({ status: "sent", sent_at: new Date().toISOString(), last_error: null })
            .eq("id", row.id);

        await supabase.from("fyb_email_logs").insert({
            queue_id: row.id,
            context_id: row.context_id,
            template_key: row.template_key ?? "custom",
            recipient_email: recipient,
            subject,
            success: true,
        });
        return true;
    } catch (error) {
        const attempts = (row.attempts ?? 0) + 1;
        const exhausted = attempts >= (row.max_attempts ?? 5);

        // Back to `pending` until attempts run out — the next drain retries it.
        await supabase
            .from("fyb_email_queue")
            .update({
                status: exhausted ? "failed" : "pending",
                attempts,
                last_error: String(error),
            })
            .eq("id", row.id);

        await supabase.from("fyb_email_logs").insert({
            queue_id: row.id,
            context_id: row.context_id,
            template_key: row.template_key ?? "custom",
            recipient_email: row.recipient_email ?? "unknown",
            success: false,
            error_message: String(error),
        });
        console.error(`queue row ${row.id} failed (attempt ${attempts}):`, error);
        return false;
    }
}

// ─── Rendering ──────────────────────────────────────────────────────────────

/**
 * Header heading and inbox preview line, per template. Both go through the same
 * {{variable}} injection as the body, so they can be personalised.
 */
const HEADINGS: Record<string, { heading: string; preheader: string }> = {
    fyb_consent: {
        heading: "You're on the list, {{first_name}}.",
        preheader: "Your consent token is inside — share it with the one you're bringing.",
    },
};

// deno-lint-ignore no-explicit-any
async function render(row: any) {
    const context = row.context_id ? await loadContext(row.context_id) : null;
    const vars = buildVariables(context);
    const recipient = row.recipient_email || context?.email || "";
    const recipientName =
        row.recipient_name || [context?.first_name, context?.last_name].filter(Boolean).join(" ");

    if (!recipient) throw new Error("No recipient email");

    const copy = HEADINGS[row.template_key];
    const heading = injectVars(copy?.heading ?? "FYB Dinner", vars);
    const preheader = injectVars(copy?.preheader ?? "", vars);

    if (row.mode === "custom") {
        if (!row.subject || !row.body_html) {
            throw new Error("Custom email missing subject/body");
        }
        return {
            subject: injectVars(row.subject, vars),
            html: wrapInEmailShell({
                bodyHtml: injectVars(row.body_html, vars),
                heading,
                preheader,
                photoUrl: context?.photo_url,
            }),
            recipient,
            recipientName,
        };
    }

    const { data: template } = await supabase
        .from("fyb_email_templates")
        .select("subject, body_html, is_active")
        .eq("template_key", row.template_key)
        .single();

    if (!template) throw new Error(`No template for key: ${row.template_key}`);
    if (!template.is_active) throw new Error(`Template ${row.template_key} is inactive`);

    return {
        subject: injectVars(template.subject, vars),
        html: wrapInEmailShell({
            bodyHtml: injectVars(template.body_html, vars),
            heading,
            preheader,
            photoUrl: context?.photo_url,
        }),
        recipient,
        recipientName,
    };
}

/**
 * PROJECT-SPECIFIC: the registration this email is about, joined to its consent
 * token. This join is the only place a token is read during a send.
 */
async function loadContext(id: string) {
    const { data } = await supabase
        .from("fyb_registrations")
        .select(
            "id, first_name, last_name, email, gender, photo_url, fyb_consent_tokens(token)"
        )
        .eq("id", id)
        .single();
    return data;
}

/** PROJECT-SPECIFIC: the {{variables}} template authors may use. */
// deno-lint-ignore no-explicit-any
function buildVariables(context: any): Record<string, string> {
    const event = {
        date: fybEnv("EVENT_DATE") ?? "",
        venue: fybEnv("EVENT_VENUE") ?? "",
        dressCode: fybEnv("DRESS_CODE") ?? "",
    };
    const supportEmail = fybEnv("SUPPORT_EMAIL") ?? "ict@rcffuta.com";

    const siteUrl = fybEnv("PUBLIC_SITE_URL") ?? "https://fyb.rcffuta.com";
    const eventName = fybEnv("EVENT_NAME") ?? "FYB Dinner";

    const base: Record<string, string> = {
        event_name: eventName,
        event_date: event.date,
        event_venue: event.venue,
        event_dress_code: event.dressCode,
        event_block: renderEventBlock(event),
        support_email: supportEmail,
        guide_button: renderButton("Read the FYB guide", `${siteUrl}/guide`),
        // Every FYB email signs off the same way. Templates end with
        // {{signature}} rather than typing it, so changing who sends the mail
        // is one env var, not an edit to every template in the table.
        signature: fybEnv("EMAIL_SIGNATURE") ?? "— 300 Level Family",
    };

    if (!context) return base;

    // `fyb_consent_tokens` comes back as an object or a single-element array
    // depending on how PostgREST infers the relationship — handle both.
    const tokenRel = context.fyb_consent_tokens;
    const token: string = Array.isArray(tokenRel) ? tokenRel[0]?.token : tokenRel?.token;

    const { partner_term, recipient_title } = genderedTerms(context.gender);

    return {
        ...base,
        first_name: context.first_name ?? "",
        last_name: context.last_name ?? "",
        consent_token: token ?? "",
        token_block: token ? renderTokenBlock(token) : "",
        partner_term,
        recipient_title,
        next_steps_block: renderSteps([
            {
                title: "Keep this email",
                body: "It's the only place your token lives. Star it, screenshot it, whatever works.",
            },
            {
                title: `Decide who you're asking`,
                body: `The ${partner_term} you'd want beside you on the night. No rush — take your time.`,
            },
            {
                title: "Pair up when pairing opens",
                body: `We'll let you know. You share the token, they enter it on ${siteUrl.replace(/^https?:\/\//, "")}, and you're locked in as a pair.`,
            },
        ]),
        safety_block: renderCallout(
            `<strong>Keep it to one person.</strong> Anyone holding your token can pair with you — so it's not a group-chat thing. Organizers can't see your token and will never ask you for it. If someone claiming to be one does, that's your cue to tell us at <a href="mailto:${supportEmail}">${supportEmail}</a>.`
        ),
    };
}

/**
 * Church register: members address each other as brother and sister. A finalist
 * shares their token with someone of the other gender, so a brother is told to
 * share it with a sister and vice versa.
 *
 * Gender is nullable on `fyb_registrations`. Rather than guess — and risk
 * addressing someone wrongly in a church context — a missing gender gets
 * neutral copy that still reads naturally in the same sentence.
 */
function genderedTerms(gender: string | null): Record<string, string> {
    if (gender === "male") return { partner_term: "sister", recipient_title: "Bro" };
    if (gender === "female") return { partner_term: "brother", recipient_title: "Sis" };
    return { partner_term: "person", recipient_title: "" };
}

function injectVars(template: string, vars: Record<string, string>): string {
    // Unknown tokens are left intact rather than blanked — a visible {{typo}}
    // in a test send is far easier to debug than a silent empty string.
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
        vars[key] === undefined ? match : vars[key]
    );
}

// ─── Provider: ZeptoMail HTTP API ───────────────────────────────────────────

async function sendEmail(input: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
}): Promise<void> {
    const token = sharedEnv("ZEPTO_TOKEN");
    const fromAddress = fybEnv("ZEPTO_FROM");
    const fromName = fybEnv("ZEPTO_FROM_NAME") ?? "";
    const apiUrl = sharedEnv("ZEPTO_API_URL") ?? "https://api.zeptomail.com/v1.1/email";

    if (!token) throw new Error("ZEPTO_TOKEN not configured");
    if (!fromAddress) throw new Error("ZEPTO_FROM not configured");
    if (!input.to) throw new Error("No recipient email address");

    // Tolerate the secret being stored with or without the scheme prefix.
    const authorization = token.startsWith("Zoho-enczapikey")
        ? token
        : `Zoho-enczapikey ${token}`;

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            from: { address: fromAddress, name: fromName },
            to: [{ email_address: { address: input.to, name: input.toName || input.to } }],
            subject: input.subject,
            htmlbody: input.html,
        }),
    });

    // Must throw on failure: the retry and logging machinery keys off the
    // exception propagating out of here.
    if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`ZeptoMail ${res.status}: ${detail}`);
    }
}

function json(body: unknown, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
