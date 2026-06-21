/**
 * Dinner-profile / pairing services.
 *
 * Stubbed while `@rcffuta/ict-lib` is disabled.
 */

import type {
    DinnerProfile,
    DinnerProfileRecord,
    TableRecord,
} from "@/types";
import { fail, type ServiceResult } from "./result";

export type DinnerProfileLookupField = "relationId" | "id" | "consentToken";

export type DinnerProfileLookup = {
    by: DinnerProfileLookupField;
    field: string;
};

export type MemberDinnerProfile = {
    attendee: DinnerProfileRecord;
    tables: TableRecord[];
};

export const createDinnerProfile = async (
    _data: DinnerProfile
): Promise<ServiceResult<DinnerProfileRecord>> => fail();

export const getDinnerProfile = async (
    _query: DinnerProfileLookup
): Promise<ServiceResult<DinnerProfileRecord>> => fail();

export const getMemberDinnerProfile = async (
    _email: string
): Promise<ServiceResult<MemberDinnerProfile>> => fail();

export const searchDinnerProfile = async (): Promise<
    ServiceResult<DinnerProfileRecord[]>
> => ({ success: false, message: "Search is currently disabled.", data: [] });

export const createTable = async (
    _maleId: string,
    _femaleId: string
): Promise<ServiceResult<TableRecord>> => fail();
