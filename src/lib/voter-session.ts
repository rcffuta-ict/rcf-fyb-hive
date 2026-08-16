import "server-only";

import { cookies } from "next/headers";

import { makeSignedToken, readSignedToken } from "@/lib/signed-cookie";

/**
 * The voter session.
 *
 * A voter identifies once by email or phone and stays identified — this is a
 * poll among people who already know each other, not a bank. The cookie holds a
 * signed profile id and nothing else; who that profile is, and whether they may
 * still vote, is re-read from the database on every request.
 *
 * httpOnly so no script can read it, and scoped separately from the admin
 * cookie so neither token can be replayed as the other.
 */

const COOKIE_NAME = "fyb_voter";
const COOKIE_SCOPE = "voter";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — voting runs for weeks

export const setVoterCookie = async (profileId: string): Promise<void> => {
    const jar = await cookies();
    jar.set(COOKIE_NAME, makeSignedToken(COOKIE_SCOPE, profileId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
    });
};

/** The voting profile id, or null when nobody is identified. */
export const readVoterProfileId = async (): Promise<string | null> => {
    const jar = await cookies();
    return readSignedToken(COOKIE_SCOPE, jar.get(COOKIE_NAME)?.value);
};

export const clearVoterCookie = async (): Promise<void> => {
    const jar = await cookies();
    jar.delete(COOKIE_NAME);
};
