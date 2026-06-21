/**
 * Member / fellowship domain types.
 *
 * These previously came from `@rcffuta/ict-lib`. They are defined locally
 * while the backend integration is disabled, so the app type-checks and runs
 * without the private package.
 */

export type Gender = "male" | "female";

export type UnitObject = {
    id?: string;
    name?: string;
    unit?: { name?: string };
};

export type MemberLevel = {
    label?: string;
};

export type MemberProfile = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    contacts: string;
    picture: string;
    gender: Gender;
    unitId?: string | null;
    unit?: UnitObject | null;
    level?: MemberLevel | null;
};

export type TenurePopulated = {
    id?: string;
    finalists?: string[];
};
