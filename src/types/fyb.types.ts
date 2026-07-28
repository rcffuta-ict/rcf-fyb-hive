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
    /** RCF unit (e.g. "Bible Study") — the fellowship unit, not a FUTA department. */
    unit: string | null;
    photoUrl: string;
    photoPublicId: string | null;
    createdAt: string;
    /** Attached for admin listings only; absent on the registration flow. */
    consentEmailStatus?: ConsentEmailStatus;
    pairingStatus?: PairingStatus;
};

/**
 * Delivery state of a finalist's consent-token email, as shown to admins.
 *
 * Note what is absent: there is no token field here, or anywhere else in this
 * file. The token is visible only in the recipient's inbox — see
 * `src/services/consent.service.ts`.
 */
export type ConsentEmailStatus = "sent" | "queued" | "failed" | "not_sent" | "no_email";

/**
 * Relationship status for the dinner. `single` = unpaired, `in_between` =
 * paired but not yet paid and approved, `taken` = paired, paid and confirmed.
 * Derived from `fyb_pairings` — see `src/services/pairing.service.ts`.
 */
export type PairingStatus = "single" | "in_between" | "taken";

export type ConsentStatusEntry = {
    registrationId: string;
    status: ConsentEmailStatus;
    lastSentAt: string | null;
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
