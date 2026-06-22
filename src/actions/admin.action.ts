"use server";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
    AdminProfile,
    Gender,
    RegistrationRecord,
} from "@/types/fyb.types";

const COOKIE_NAME = "fyb_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

const getSecret = (): string => {
    const secret = process.env.ADMIN_COOKIE_SECRET;
    if (!secret)
        throw new Error("Missing ADMIN_COOKIE_SECRET environment variable.");
    return secret;
};

const sign = (value: string): string =>
    createHmac("sha256", getSecret()).update(value).digest("hex");

const makeToken = (profileId: string): string =>
    `${profileId}.${sign(profileId)}`;

const verifyToken = (token: string | undefined): string | null => {
    if (!token) return null;
    const [profileId, signature] = token.split(".");
    if (!profileId || !signature) return null;
    const expected = sign(profileId);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return profileId;
};

type AdminRow = {
    role: string;
    profiles: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
};

const fetchAdminByProfileId = async (
    profileId: string
): Promise<AdminProfile | null> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("fyb_admins")
        .select("role, profiles(id, first_name, last_name, email)")
        .eq("profile_id", profileId)
        .maybeSingle<AdminRow>();

    if (!data?.profiles) return null;
    return {
        profileId: data.profiles.id,
        firstName: data.profiles.first_name,
        lastName: data.profiles.last_name,
        email: data.profiles.email,
        role: data.role,
    };
};

export type AdminLoginResult = {
    ok: boolean;
    admin?: AdminProfile;
    message?: string;
};

/**
 * Admin gate: the email must belong to an existing profile that is listed in
 * `fyb_admins`. On success a signed, httpOnly session cookie is set.
 */
export async function adminLogin(email: string): Promise<AdminLoginResult> {
    const value = email?.trim().toLowerCase();
    if (!value) return { ok: false, message: "Enter your email." };

    try {
        const supabase = createServerSupabase();
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", value)
            .maybeSingle<{ id: string }>();

        if (!profile) {
            return {
                ok: false,
                message: "No member profile found for that email.",
            };
        }

        const admin = await fetchAdminByProfileId(profile.id);
        if (!admin) {
            return {
                ok: false,
                message: "This account is not an authorized admin.",
            };
        }

        const jar = await cookies();
        jar.set(COOKIE_NAME, makeToken(profile.id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_MAX_AGE,
        });

        return { ok: true, admin };
    } catch (error) {
        console.error("adminLogin failed:", error);
        return {
            ok: false,
            message: "Something went wrong. Please try again.",
        };
    }
}

export async function adminLogout(): Promise<void> {
    const jar = await cookies();
    jar.delete(COOKIE_NAME);
}

/**
 * Returns the current admin if the signed cookie is valid AND the profile is
 * still in `fyb_admins` (re-checked every call, so a forged cookie is useless).
 */
export async function getCurrentAdmin(): Promise<AdminProfile | null> {
    try {
        const jar = await cookies();
        const profileId = verifyToken(jar.get(COOKIE_NAME)?.value);
        if (!profileId) return null;
        return await fetchAdminByProfileId(profileId);
    } catch (error) {
        console.error("getCurrentAdmin failed:", error);
        return null;
    }
}

type RegistrationRow = {
    id: string;
    profile_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone_number: string | null;
    gender: string | null;
    level: string;
    entry_year: number | null;
    department: string | null;
    photo_url: string;
    photo_public_id: string | null;
    created_at: string;
};

const toRegistrationRecord = (row: RegistrationRow): RegistrationRecord => ({
    id: row.id,
    profileId: row.profile_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phoneNumber: row.phone_number,
    gender: (row.gender as Gender | null) ?? null,
    level: row.level,
    entryYear: row.entry_year,
    department: row.department,
    photoUrl: row.photo_url,
    photoPublicId: row.photo_public_id,
    createdAt: row.created_at,
});

export type RegistrationsPage = {
    registrations: RegistrationRecord[];
    total: number;
    page: number;
    pageSize: number;
};

const PAGE_SIZE = 12;

/** Paginated, searchable registrations list (admin-only). */
export async function listRegistrations(params: {
    search?: string;
    page?: number;
}): Promise<RegistrationsPage> {
    const admin = await getCurrentAdmin();
    if (!admin) {
        return { registrations: [], total: 0, page: 1, pageSize: PAGE_SIZE };
    }

    const page = Math.max(1, params.page ?? 1);
    const search = params.search?.trim();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = createServerSupabase();
    let query = supabase
        .from("fyb_registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (search) {
        const term = `%${search}%`;
        query = query.or(
            `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone_number.ilike.${term}`
        );
    }

    const { data, count, error } = await query;
    if (error) {
        console.error("listRegistrations failed:", error);
        return { registrations: [], total: 0, page, pageSize: PAGE_SIZE };
    }

    return {
        registrations: (data as RegistrationRow[]).map(toRegistrationRecord),
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
    };
}
