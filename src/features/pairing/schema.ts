import { z } from "zod";

/**
 * Associate details — the person a finalist is bringing from outside the
 * fellowship. Gender is deliberately absent: it's derived as the opposite of
 * the finalist's, so it can't be entered wrongly or used to sidestep the
 * brother-and-sister rule.
 */
export const associateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Enter their full name.")
        .max(80, "That's a bit long — first and last name is enough."),
    email: z
        .string()
        .trim()
        .min(1, "We need an email — their invitation goes there.")
        .email("That email doesn't look right."),
    phone: z
        .string()
        .trim()
        .min(7, "Enter a reachable phone number.")
        .max(20, "That doesn't look like a phone number.")
        .regex(/^[0-9+()\s-]+$/, "Digits, spaces and + only."),
    relationship: z
        .string()
        .trim()
        .min(2, "How do you know them?")
        .max(60, "Keep it short — a word or two."),
});

export type AssociateFormValues = z.infer<typeof associateSchema>;
