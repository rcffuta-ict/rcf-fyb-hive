/** Shared FYB Dinner domain types. */

export type Gender = "male" | "female";

/** A unit/team the member belongs to in the active tenure. */
export type MemberUnit = {
    name: string;
    type: string;
    role: string | null;
};

/** A leadership position the member holds in the active tenure. */
export type MemberLeadership = {
    title: string;
    category: string;
    unit: string | null;
};

/**
 * A member resolved from the RCFFUTA `profiles` table, with computed level and
 * (for eligible members) read-only affiliations shown on the preview screen.
 */
export type MemberLookup = {
    profileId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    gender: Gender | null;
    department: string | null;
    faculty: string | null;
    matricNumber: string | null;
    avatarUrl: string | null;
    entryYear: number | null;
    level: string | null;
    units: MemberUnit[];
    leadership: MemberLeadership[];
};

export type LookupStatus =
    | "eligible"
    | "already_registered"
    | "not_member"
    | "not_finalist"
    | "config_error"
    | "error";

/** Result of looking a member up by email/phone for registration. */
export type LookupResult = {
    status: LookupStatus;
    member?: MemberLookup;
    message?: string;
};

/** A persisted FYB finalist registration (snapshot of member at sign-up). */
export type RegistrationRecord = {
    id: string;
    profileId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    gender: Gender | null;
    level: string;
    entryYear: number | null;
    department: string | null;
    photoUrl: string;
    photoPublicId: string | null;
    createdAt: string;
};

export type RegisterStatus = "success" | "already_registered" | "not_eligible" | "error";

export type RegisterResult = {
    status: RegisterStatus;
    registration?: RegistrationRecord;
    message?: string;
};

/** A verified admin (must have an existing profile + a `fyb_admins` row). */
export type AdminProfile = {
    profileId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    role: string;
};
