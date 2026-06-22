"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import { computeLevel, isFinalistLevel, parseSessionYear } from "@/lib/eligibility";
import type {
    Gender,
    LookupResult,
    MemberLeadership,
    MemberLookup,
    MemberUnit,
    RegisterResult,
    RegistrationRecord,
} from "@/types/fyb.types";

type ProfileRow = {
    id: string;
    first_name: string;
    last_name: string;
    gender: string | null;
    email: string | null;
    phone_number: string | null;
    department: string | null;
    faculty: string | null;
    matric_number: string | null;
    avatar_url: string | null;
    entry_year: number | null;
    class_sets: { entry_year: number | null } | null;
};

type ActiveTenure = { id: string; sessionYear: number | null };

type MembershipUnitRow = {
    role: string | null;
    units: { name: string; type: string } | null;
};

type LeadershipRow = {
    leadership_positions: { title: string; category: string } | null;
    units: { name: string } | null;
};

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

const PROFILE_COLUMNS =
    "id, first_name, last_name, gender, email, phone_number, department, faculty, matric_number, avatar_url, entry_year, class_sets(entry_year)";

const isEmail = (value: string): boolean => value.includes("@");

/** Generate plausible stored variants of a Nigerian phone number. */
const phoneCandidates = (raw: string): string[] => {
    const digits = raw.replace(/\D/g, "");
    const variants = new Set<string>([raw.trim(), digits]);
    let local = digits;
    if (digits.startsWith("234")) local = digits.slice(3);
    else if (digits.startsWith("0")) local = digits.slice(1);
    if (local) {
        variants.add(local); // 8012345678
        variants.add(`0${local}`); // 08012345678
        variants.add(`234${local}`); // 2348012345678
        variants.add(`+234${local}`); // +2348012345678
    }
    return [...variants].filter(Boolean);
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

const getActiveTenure = async (): Promise<ActiveTenure | null> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("tenures")
        .select("id, session")
        .eq("is_active", true)
        .maybeSingle<{ id: string; session: string | null }>();
    if (!data) return null;
    return { id: data.id, sessionYear: parseSessionYear(data.session) };
};

/**
 * Read-only affiliations (units + leadership) for the active tenure. Used purely
 * to enrich the preview screen — never persisted. Failures degrade gracefully to
 * empty lists so they can't block a registration.
 */
const getMemberAffiliations = async (
    profileId: string,
    tenureId: string | null
): Promise<{ units: MemberUnit[]; leadership: MemberLeadership[] }> => {
    if (!tenureId) return { units: [], leadership: [] };

    const supabase = createServerSupabase();
    const [unitsRes, leadershipRes] = await Promise.all([
        supabase
            .from("membership_units")
            .select("role, units(name, type)")
            .eq("profile_id", profileId)
            .eq("tenure_id", tenureId)
            .returns<MembershipUnitRow[]>(),
        supabase
            .from("leadership")
            .select("leadership_positions(title, category), units(name)")
            .eq("profile_id", profileId)
            .eq("tenure_id", tenureId)
            .returns<LeadershipRow[]>(),
    ]);

    const units: MemberUnit[] = (unitsRes.data ?? [])
        .filter((row): row is MembershipUnitRow & { units: NonNullable<MembershipUnitRow["units"]> } =>
            Boolean(row.units)
        )
        .map((row) => ({ name: row.units.name, type: row.units.type, role: row.role }));

    const leadership: MemberLeadership[] = (leadershipRes.data ?? [])
        .filter(
            (row): row is LeadershipRow & {
                leadership_positions: NonNullable<LeadershipRow["leadership_positions"]>;
            } => Boolean(row.leadership_positions)
        )
        .map((row) => ({
            title: row.leadership_positions.title,
            category: row.leadership_positions.category,
            unit: row.units?.name ?? null,
        }));

    return { units, leadership };
};

const resolveProfile = async (identifier: string): Promise<ProfileRow | null> => {
    const supabase = createServerSupabase();
    const value = identifier.trim();

    const orFilter = isEmail(value)
        ? `email.eq.${value.toLowerCase()}`
        : phoneCandidates(value)
              .map((candidate) => `phone_number.eq.${candidate}`)
              .join(",");

    const { data } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .or(orFilter)
        .limit(1)
        .maybeSingle<ProfileRow>();

    return data ?? null;
};

const toMemberLookup = (
    row: ProfileRow,
    level: string | null,
    affiliations?: { units: MemberUnit[]; leadership: MemberLeadership[] }
): MemberLookup => ({
    profileId: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phoneNumber: row.phone_number,
    gender: (row.gender as Gender | null) ?? null,
    department: row.department,
    faculty: row.faculty,
    matricNumber: row.matric_number,
    avatarUrl: row.avatar_url,
    entryYear: row.class_sets?.entry_year ?? row.entry_year,
    level,
    units: affiliations?.units ?? [],
    leadership: affiliations?.leadership ?? [],
});

/**
 * Look a member up by email or phone and decide whether they may register.
 * No auth — this is the gate for the whole registration flow.
 */
export async function lookupMember(identifier: string): Promise<LookupResult> {
    const value = identifier?.trim();
    if (!value) return { status: "error", message: "Enter your email or phone number." };

    try {
        const profile = await resolveProfile(value);
        if (!profile) return { status: "not_member" };

        const tenure = await getActiveTenure();
        if (!tenure?.sessionYear) {
            return {
                status: "config_error",
                message: "No active session is configured. Please contact the organizers.",
            };
        }

        const entryYear = profile.class_sets?.entry_year ?? profile.entry_year;
        const level = computeLevel(entryYear, tenure.sessionYear);

        if (!isFinalistLevel(level)) {
            return { status: "not_finalist", member: toMemberLookup(profile, level) };
        }

        const supabase = createServerSupabase();
        const { data: existing } = await supabase
            .from("fyb_registrations")
            .select("id")
            .eq("profile_id", profile.id)
            .maybeSingle();

        if (existing) {
            return { status: "already_registered", member: toMemberLookup(profile, level) };
        }

        // Only the eligible path pays for affiliations — they enrich the preview.
        const affiliations = await getMemberAffiliations(profile.id, tenure.id);
        return { status: "eligible", member: toMemberLookup(profile, level, affiliations) };
    } catch (error) {
        console.error("lookupMember failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}

export type RegisterInput = {
    profileId: string;
    photoUrl: string;
    photoPublicId?: string;
};

/**
 * Persist a finalist registration. Re-validates eligibility server-side so the
 * client can't bypass the level/photo gates.
 */
export async function registerFinalist(input: RegisterInput): Promise<RegisterResult> {
    if (!input?.profileId) return { status: "error", message: "Missing member." };
    if (!input?.photoUrl) return { status: "error", message: "A clear face photo is required." };

    try {
        const supabase = createServerSupabase();

        const { data: profile } = await supabase
            .from("profiles")
            .select(PROFILE_COLUMNS)
            .eq("id", input.profileId)
            .maybeSingle<ProfileRow>();

        if (!profile) return { status: "not_eligible", message: "Member not found." };

        const tenure = await getActiveTenure();
        const entryYear = profile.class_sets?.entry_year ?? profile.entry_year;
        const level = computeLevel(entryYear, tenure?.sessionYear);

        if (!isFinalistLevel(level)) {
            return {
                status: "not_eligible",
                message: "This profile is not in 400 or 500 level.",
            };
        }

        const { data, error } = await supabase
            .from("fyb_registrations")
            .insert({
                profile_id: profile.id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
                phone_number: profile.phone_number,
                gender: profile.gender,
                level,
                entry_year: entryYear,
                department: profile.department,
                photo_url: input.photoUrl,
                photo_public_id: input.photoPublicId ?? null,
            })
            .select()
            .single<RegistrationRow>();

        if (error) {
            // Unique violation on profile_id → already registered
            if (error.code === "23505") {
                return { status: "already_registered", message: "You're already registered." };
            }
            console.error("registerFinalist insert failed:", error);
            return { status: "error", message: "Could not complete registration." };
        }

        revalidatePath("/admin");
        return { status: "success", registration: toRegistrationRecord(data) };
    } catch (error) {
        console.error("registerFinalist failed:", error);
        return { status: "error", message: "Something went wrong. Please try again." };
    }
}
