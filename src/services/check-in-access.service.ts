import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { CheckInManager } from "@/types/fyb.types";

/**
 * Who may work the door.
 *
 * Two lists answer it: `fyb_checkin_managers` (the registration team) and
 * `fyb_admins` (the organizers, who are not going to carry a second login on
 * the night). Membership is re-read on every request, so removing somebody
 * takes effect on their next tap rather than whenever their cookie expires.
 */

type ProfileRow = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
};

const toManager = (row: ProfileRow, isAdmin: boolean): CheckInManager => ({
    profileId: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isAdmin,
});

const PROFILE_COLUMNS = "id, first_name, last_name, email";

/** Resolve a profile to a door role, or null if they have none. */
export const findCheckInManager = async (
    profileId: string
): Promise<CheckInManager | null> => {
    const supabase = createServerSupabase();

    const [profile, admin, manager] = await Promise.all([
        supabase
            .from("profiles")
            .select(PROFILE_COLUMNS)
            .eq("id", profileId)
            .maybeSingle<ProfileRow>(),
        supabase
            .from("fyb_admins")
            .select("id")
            .eq("profile_id", profileId)
            .maybeSingle<{ id: string }>(),
        supabase
            .from("fyb_checkin_managers")
            .select("id")
            .eq("profile_id", profileId)
            .maybeSingle<{ id: string }>(),
    ]);

    if (!profile.data) return null;
    if (!admin.data && !manager.data) return null;

    return toManager(profile.data, Boolean(admin.data));
};

/** Look a profile up by email — the only way somebody is added to the list. */
export const findProfileByEmail = async (
    email: string
): Promise<ProfileRow | null> => {
    const supabase = createServerSupabase();
    const { data } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("email", email.trim().toLowerCase())
        .maybeSingle<ProfileRow>();
    return data ?? null;
};

/** The door roster, for the admin tab that maintains it. */
export const listCheckInManagerRows = async (): Promise<CheckInManager[]> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
        .from("fyb_checkin_managers")
        .select(`created_at, profiles!fyb_checkin_managers_profile_id_fkey(${PROFILE_COLUMNS})`)
        .order("created_at", { ascending: true })
        .returns<{ created_at: string; profiles: ProfileRow | null }[]>();

    if (error) {
        console.error("listCheckInManagerRows failed:", error.message);
        return [];
    }

    return (data ?? [])
        .filter((row): row is { created_at: string; profiles: ProfileRow } =>
            Boolean(row.profiles)
        )
        .map((row) => toManager(row.profiles, false));
};

export type ManagerWrite = { ok: boolean; message: string };

/** Add someone to the door roster. They must already be in the directory. */
export const addCheckInManagerRow = async (
    email: string,
    addedBy: string
): Promise<ManagerWrite> => {
    const profile = await findProfileByEmail(email);
    if (!profile) {
        return {
            ok: false,
            message: "No member profile with that email — they need one first.",
        };
    }

    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_checkin_managers")
        .insert({ profile_id: profile.id, added_by: addedBy });

    if (error) {
        // Two admins adding the same person at once is a non-event, not a clash.
        if (error.code === "23505") {
            return { ok: true, message: `${profile.first_name} is already on the door.` };
        }
        console.error("addCheckInManagerRow failed:", error.message);
        return { ok: false, message: "Could not add them. Try again." };
    }

    return { ok: true, message: `${profile.first_name} can now check couples in.` };
};

export const removeCheckInManagerRow = async (
    profileId: string
): Promise<ManagerWrite> => {
    const supabase = createServerSupabase();
    const { error } = await supabase
        .from("fyb_checkin_managers")
        .delete()
        .eq("profile_id", profileId);

    if (error) {
        console.error("removeCheckInManagerRow failed:", error.message);
        return { ok: false, message: "Could not remove them. Try again." };
    }
    return { ok: true, message: "Removed from the door." };
};
