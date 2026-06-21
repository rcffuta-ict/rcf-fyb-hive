/**
 * Dinner registration domain types (formerly from `@rcffuta/ict-lib`).
 */

import type { Gender } from "./member.types";

export type DinnerProfile = {
    picture: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    gender: Gender;
    isWorker: boolean;
    isFinalist: boolean;
    unit?: string;
    unitId?: string | null;
    relationId?: string;
    relationShipWithFinalist?: string;
};

export type DinnerProfileRecord = DinnerProfile & {
    id: string;
    consentToken?: string;
    createdAt: string;
    updatedAt: string;
};

export type TableRecord = {
    id?: string;
    male: string;
    female: string;
    paid?: boolean;
    pairToken?: string;
    createdAt?: string;
    updatedAt?: string;
};
