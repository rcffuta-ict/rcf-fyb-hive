import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { enqueueTemplateEmail } from "@/services/email.service";

/**
 * Invitation tickets, sent only once an admin approves a pairing.
 *
 * Two sends, one per party, each keyed to that person's own side of the pair —
 * so each ticket reads "your date is …" about the *other* person. The worker
 * resolves the pair from `context_id` at render time; nothing about the pairing
 * is copied onto the queue row.
 */

const TEMPLATE_KEY = "fyb_invitation";
const CONTEXT_TYPE = "fyb_pair_intent";

type IntentRow = {
    id: string;
    kind: "finalist" | "associate";
    associate_name: string | null;
    associate_email: string | null;
    initiator: { first_name: string; last_name: string; email: string | null } | null;
    partner: { first_name: string; last_name: string; email: string | null } | null;
};

export type InvitationResult = { success: boolean; sent: number; message?: string };

/**
 * Queue both invitations for an approved pairing.
 *
 * `recipient_email` is set explicitly per row rather than left to the worker,
 * because the two sends differ only by who receives them — that is the one
 * thing the queue row must carry.
 */
export const sendPairInvitations = async (intentId: string): Promise<InvitationResult> => {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
        .from("fyb_pair_intents")
        .select(
            "id, kind, associate_name, associate_email, " +
                "initiator:fyb_registrations!fyb_pair_intents_initiator_registration_id_fkey(first_name, last_name, email), " +
                "partner:fyb_registrations!fyb_pair_intents_partner_registration_id_fkey(first_name, last_name, email)"
        )
        .eq("id", intentId)
        .maybeSingle<IntentRow>();

    if (error || !data) {
        console.error("sendPairInvitations lookup failed:", error?.message);
        return { success: false, sent: 0, message: "Could not load the pairing." };
    }

    const recipients: { email: string; name: string }[] = [];

    if (data.initiator?.email) {
        recipients.push({
            email: data.initiator.email,
            name: `${data.initiator.first_name} ${data.initiator.last_name}`.trim(),
        });
    }

    if (data.kind === "finalist" && data.partner?.email) {
        recipients.push({
            email: data.partner.email,
            name: `${data.partner.first_name} ${data.partner.last_name}`.trim(),
        });
    }

    if (data.kind === "associate" && data.associate_email) {
        recipients.push({
            email: data.associate_email,
            name: data.associate_name ?? "Guest",
        });
    }

    if (recipients.length === 0) {
        return { success: false, sent: 0, message: "Nobody in this pairing has an email." };
    }

    let sent = 0;
    for (const recipient of recipients) {
        const result = await enqueueTemplateEmail({
            templateKey: TEMPLATE_KEY,
            contextId: intentId,
            contextType: CONTEXT_TYPE,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
        });
        if (result.success) sent += 1;
    }

    return { success: sent > 0, sent };
};
