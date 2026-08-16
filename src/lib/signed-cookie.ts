import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed session cookies.
 *
 * There is no end-user auth in this app, so a session is just an id the server
 * signed and will re-verify. Two of them now exist — the admin session and the
 * voter session — and they must sign identically, hence one module rather than
 * a copy of the HMAC dance in each action file.
 *
 * The signature proves only that *we* issued the value. It says nothing about
 * whether the subject is still an admin, or still allowed to vote; callers
 * re-check that against the database on every request.
 */

const getSecret = (): string => {
    const secret = process.env.ADMIN_COOKIE_SECRET;
    if (!secret) throw new Error("Missing ADMIN_COOKIE_SECRET environment variable.");
    return secret;
};

/**
 * Namespaced so a token minted for one session can never be replayed as the
 * other: an admin cookie pasted into `fyb_voter` produces a different expected
 * signature and fails.
 */
const sign = (scope: string, value: string): string =>
    createHmac("sha256", getSecret()).update(`${scope}:${value}`).digest("hex");

/** `<id>.<signature>` — what actually goes in the cookie. */
export const makeSignedToken = (scope: string, id: string): string =>
    `${id}.${sign(scope, id)}`;

/** The id back out, or null if the token is missing, malformed or forged. */
export const readSignedToken = (
    scope: string,
    token: string | undefined
): string | null => {
    if (!token) return null;

    const [id, signature] = token.split(".");
    if (!id || !signature) return null;

    const a = Buffer.from(signature);
    const b = Buffer.from(sign(scope, id));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return id;
};
