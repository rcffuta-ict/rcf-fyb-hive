import { z } from "zod";

const hasEnoughDigits = (value: string): boolean =>
    value.replace(/\D/g, "").length >= 7;

/** Identify a member by email OR phone number. */
export const identifySchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(3, "Enter your email or phone number")
        .refine(
            (value) => value.includes("@") || hasEnoughDigits(value),
            "Enter a valid email or phone number"
        ),
});

export type IdentifyValues = z.infer<typeof identifySchema>;
