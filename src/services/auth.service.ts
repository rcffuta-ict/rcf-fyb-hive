/**
 * Authentication / member services.
 *
 * Stubbed while `@rcffuta/ict-lib` is disabled: every call resolves to a
 * failed `ServiceResult` so callers fall back to their unauthenticated states
 * instead of crashing.
 */

import type { MemberProfile, TenurePopulated } from "@/types";
import { fail, type ServiceResult } from "./result";

export const findLiveTenure = async (): Promise<
    ServiceResult<TenurePopulated>
> => fail();

export const getMemberFromStoredToken = async (): Promise<
    ServiceResult<MemberProfile>
> => fail();

export const resolveMemberFromPath = async (
    _path?: string,
    _persist?: boolean
): Promise<ServiceResult<MemberProfile>> => fail();

export const loginMember = async (_args: {
    email: string;
    verifyPath: string;
}): Promise<ServiceResult<string | null>> => fail();
