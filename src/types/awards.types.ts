/** Awards & voting domain types. */

/** A category on the ballot — one award, many candidates, one vote each. */
export type AwardCategory = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    sortOrder: number;
    isArchived: boolean;
};

/**
 * A finalist standing in one category. `nickname` belongs to the candidacy, not
 * the person — the same finalist carries a different one in another category.
 *
 * Note the absence of a vote count: this type is what the ballot sends to the
 * browser, and the tally stays server-side until results are published.
 */
export type AwardCandidate = {
    id: string;
    registrationId: string;
    firstName: string;
    lastName: string;
    nickname: string;
    photoUrl: string;
    level: string;
    unit: string | null;
    /** Short code behind their campaign link, `/awards/c/<shareCode>`. */
    shareCode: string;
};

/** A category with its candidates, plus which one this voter picked. */
export type BallotCategory = AwardCategory & {
    candidates: AwardCandidate[];
    /** `fyb_award_candidates.id` this voter chose, or null if they haven't. */
    myVoteCandidateId: string | null;
};

/** Who is voting, resolved from the signed cookie. Never carries a token. */
export type VoterIdentity = {
    profileId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
};

/** Everything `/awards` needs for a signed-in voter. */
export type Ballot = {
    voter: VoterIdentity;
    categories: BallotCategory[];
    /** Voting is open — false freezes every rail into a read-only recap. */
    votingOpen: boolean;
    /** Admin published the tally; only then may counts reach the browser. */
    resultsPublic: boolean;
};

export type VoterLookupStatus = "ok" | "not_member" | "closed" | "error";

export type VoterLookupResult = {
    status: VoterLookupStatus;
    voter?: VoterIdentity;
    message?: string;
};

export type VoteStatus = "ok" | "not_identified" | "closed" | "invalid" | "error";

export type VoteResult = {
    status: VoteStatus;
    message?: string;
};

/** One candidate's standing in a tally. Admin-side (or published) only. */
export type CandidateResult = {
    candidateId: string;
    firstName: string;
    lastName: string;
    nickname: string;
    photoUrl: string;
    votes: number;
    /** Share of the votes cast *in this category*, 0–100, one decimal. */
    share: number;
    /** True for the outright leader; nobody leads a tie. */
    isLeader: boolean;
};

export type CategoryResult = {
    categoryId: string;
    title: string;
    votesCast: number;
    /**
     * Leader's votes minus the runner-up's. 0 means a tie at the top — which,
     * with 10+ categories, is the single most useful number on the page: it is
     * how you find the three races that are actually live.
     */
    margin: number;
    candidates: CandidateResult[];
};

/** Someone leading in more than one category — the night's recurring name. */
export type MultiLeader = {
    registrationId: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    /** Titles of the categories they currently lead. */
    categories: string[];
};

/** Voters grouped by academic level, for turnout that means something. */
export type LevelTurnout = {
    level: string;
    voters: number;
};

/** Votes per day, Lagos time. */
export type TimelinePoint = {
    day: string;
    votes: number;
};

/** How far down the ballot voters get — the drop-off curve. */
export type BallotCompletion = {
    /** Mean categories voted, across everyone who voted at least once. */
    averageVoted: number;
    /** Voters who voted in every live category. */
    finishedAll: number;
    /** Voters who voted in exactly one. */
    votedOnce: number;
};

/** The stats page, in one payload. */
export type AwardStats = {
    /** Distinct profiles that have cast at least one vote. */
    voters: number;
    /** Profiles that could vote — every member, since any level may. */
    eligibleVoters: number;
    totalVotes: number;
    categoryCount: number;
    candidateCount: number;
    /** Titles of live categories with nobody standing — the thing to fix. */
    emptyCategories: string[];
    /** Live categories with fewer than three candidates — a thin race. */
    thinCategories: string[];
    /** Candidates nobody has voted for yet. */
    zeroVoteCandidates: number;
    completion: BallotCompletion;
    levels: LevelTurnout[];
    timeline: TimelinePoint[];
    multiLeaders: MultiLeader[];
    results: CategoryResult[];
};

/** A candidate's public campaign page, resolved from their share code. */
export type CampaignCard = {
    candidateId: string;
    shareCode: string;
    firstName: string;
    lastName: string;
    nickname: string;
    photoUrl: string;
    categoryTitle: string;
    categoryDescription: string | null;
    categorySlug: string;
    /** False once voting closes — the page still renders, the button doesn't. */
    votingOpen: boolean;
};

/** Row shape for the admin candidate list (includes what voters don't see). */
export type AdminCandidate = AwardCandidate & {
    categoryId: string;
    email: string | null;
};

export type AwardSettings = {
    awardsEnabled: boolean;
    resultsPublic: boolean;
};
