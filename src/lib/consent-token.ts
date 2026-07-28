import "server-only";

import { randomInt } from "node:crypto";

/**
 * Consent token format — `FYB-XXXX`.
 *
 * The token represents a finalist's consent to be paired: they receive it by
 * email and share it with the person they want to bring, who enters it when
 * pairing. Because it gets read aloud over the phone and typed on a cracked
 * screen at 11pm, the alphabet drops every character that has a lookalike:
 * no 0/O, no 1/I/L. 31^4 ≈ 923k combinations, which is ample against a few
 * hundred finalists — and the unique index on the column is the real guarantee.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const TOKEN_LENGTH = 4;
const PREFIX = "FYB-";

/** A fresh, cryptographically random token. Uniqueness is enforced by the DB. */
export const generateConsentToken = (): string => {
    let suffix = "";
    for (let i = 0; i < TOKEN_LENGTH; i += 1) {
        suffix += ALPHABET[randomInt(ALPHABET.length)];
    }
    return `${PREFIX}${suffix}`;
};

/**
 * Canonical form of a token the user typed. Tolerates lowercase, a missing
 * prefix, and separators, so `fyb 7k2m`, `7k2m` and `FYB-7K2M` all match the
 * stored value. Returns null if it can't possibly be a token.
 */
export const normalizeConsentToken = (raw: string): string | null => {
    const cleaned = raw?.toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
    const suffix = cleaned.startsWith("FYB") ? cleaned.slice(3) : cleaned;

    if (suffix.length !== TOKEN_LENGTH) return null;
    if (![...suffix].every((char) => ALPHABET.includes(char))) return null;

    return `${PREFIX}${suffix}`;
};
