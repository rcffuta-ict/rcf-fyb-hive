"use server";

import { revalidatePath } from "next/cache";

import { drainEmailQueue, isOpsKeyValid, type DrainResult } from "@/services/email-ops.service";

/**
 * Actions for the hidden ops page.
 *
 * The URL segment is the credential, so it is re-verified here rather than
 * trusted from the page render — a Server Action is a public endpoint, and
 * anyone who learns the action id could otherwise call it without the key.
 */
export async function drainQueueAction(opsKey: string): Promise<DrainResult> {
    if (!isOpsKeyValid(opsKey)) {
        return { ok: false, message: "Not authorized." };
    }

    const result = await drainEmailQueue();
    revalidatePath(`/ops/${opsKey}`);
    return result;
}
