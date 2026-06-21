/** Shared FYB Dinner domain types. */

export type Gender = "male" | "female";

/** A member resolved from the RCFFUTA `profiles` table, with computed level. */
export type MemberLookup = {
    profileId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    gender: Gender | null;
    department: string | null;
    avatarUrl: string | null;
    entryYear: number | null;
    level: string | null;
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
