"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getCurrentAdmin } from "@/actions/admin.action";
import { makeSignedToken, readSignedToken } from "@/lib/signed-cookie";
import {
    addCheckInManagerRow,
    findCheckInManager,
    findProfileByEmail,
    listCheckInManagerRows,
    removeCheckInManagerRow,
    type ManagerWrite,
} from "@/services/check-in-access.service";
import type { CheckInManager } from "@/types/fyb.types";

/**
 * The door session.
 *
 * Separate from the admin cookie and separately scoped, so a check-in manager's
 * session can never be replayed as an organizer's — they are on the seating page
 * to admit couples, not to rewrite the seating plan. Membership is re-checked
 * against the database on every call, so removing somebody takes effect at
 * their next tap.
 */

const COOKIE_NAME = "fyb_checkin";
const COOKIE_SCOPE = "checkin";
const COOKIE_MAX_AGE = 60 * 60 * 12; // a long evening, and then gone

export type CheckInLoginResult = {
    ok: boolean;
    manager?: CheckInManager;
    message?: string;
};

export async function checkInLogin(email: string): Promise<CheckInLoginResult> {
    const value = email?.trim().toLowerCase();
    if (!value) return { ok: false, message: "Enter your email." };

    try {
        const profile = await findProfileByEmail(value);
        if (!profile) {
            return { ok: false, message: "No member profile found for that email." };
        }

        const manager = await findCheckInManager(profile.id);
        if (!manager) {
            return {
                ok: false,
                message: "You're not on the check-in team. Ask an organizer to add you.",
            };
        }

        const jar = await cookies();
        jar.set(COOKIE_NAME, makeSignedToken(COOKIE_SCOPE, profile.id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_MAX_AGE,
        });

        return { ok: true, manager };
    } catch (error) {
        console.error("checkInLogin failed:", error);
        return { ok: false, message: "Something went wrong. Please try again." };
    }
}

export async function checkInLogout(): Promise<void> {
    const jar = await cookies();
    jar.delete(COOKIE_NAME);
}

/**
 * Whoever is working the door on this device, or null.
 *
 * An admin signed in on the organizer cookie counts: they are on both lists by
 * definition, and asking them to sign in twice on one phone is how a second
 * password ends up written on a wristband.
 */
export async function getCurrentCheckInManager(): Promise<CheckInManager | null> {
    try {
        const jar = await cookies();
        const profileId = readSignedToken(COOKIE_SCOPE, jar.get(COOKIE_NAME)?.value);
        if (profileId) {
            const manager = await findCheckInManager(profileId);
            if (manager) return manager;
        }

        const admin = await getCurrentAdmin();
        if (!admin) return null;
        return {
            profileId: admin.profileId,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            isAdmin: true,
        };
    } catch (error) {
        console.error("getCurrentCheckInManager failed:", error);
        return null;
    }
}

// ─── Maintaining the roster (organizers only) ───────────────────────────────

export async function listCheckInManagers(): Promise<CheckInManager[]> {
    const admin = await getCurrentAdmin();
    if (!admin) return [];
    return listCheckInManagerRows();
}

export async function addCheckInManager(email: string): Promise<ManagerWrite> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const result = await addCheckInManagerRow(email, admin.profileId);
    if (result.ok) revalidatePath("/tables");
    return result;
}

export async function removeCheckInManager(profileId: string): Promise<ManagerWrite> {
    const admin = await getCurrentAdmin();
    if (!admin) return { ok: false, message: "Not authorized." };

    const result = await removeCheckInManagerRow(profileId);
    if (result.ok) revalidatePath("/tables");
    return result;
}
