/**
 * Voting domain types (formerly from `@rcffuta/ict-lib`).
 */

export type VoteContestant = {
    email: string;
    id?: string;
    firstname?: string;
    lastname?: string;
    picture?: string;
    isWorker?: boolean;
    unit?: string;
};

export type VoteRecord = {
    id?: string;
    voterMail?: string;
    voteData: Record<string, string>;
    createdAt?: string;
    updatedAt?: string;
};
