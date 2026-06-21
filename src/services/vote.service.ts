/**
 * Voting services.
 *
 * Stubbed while `@rcffuta/ict-lib` is disabled.
 */

import type { VoteContestant, VoteRecord } from "@/types";
import { fail, type ServiceResult } from "./result";

export const loadContestants = async (
    _emails: string[]
): Promise<ServiceResult<VoteContestant[]>> => ({
    success: false,
    message: "Contestants are currently unavailable.",
    data: [],
});

export const loadVotes = async (
    _voterId: string
): Promise<ServiceResult<VoteRecord>> => fail();

export const saveVote = async (_payload: {
    voteData: Record<string, string>;
    voterMail: string;
}): Promise<ServiceResult<VoteRecord>> => fail();
