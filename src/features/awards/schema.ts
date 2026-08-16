import { z } from "zod";

/**
 * Anything that could be an email or a Nigerian phone number. The real check is
 * server-side against `profiles` — this only stops an empty or obviously
 * mistyped submit from costing a round trip.
 */
export const voterIdentifySchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(3, "Enter your email or phone number.")
        .refine(
            (value) => value.includes("@") || value.replace(/\D/g, "").length >= 10,
            "That doesn't look like an email or a phone number."
        ),
});

export type VoterIdentifyValues = z.infer<typeof voterIdentifySchema>;
