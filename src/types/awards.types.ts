/** Awards & voting domain types. */

/**
 * A category's id in the standard. Free-form by necessity — the set of awards
 * lives in `award-standard.jsonrc`, not in this union, so that adding one is a
 * data edit. Validity is checked on load (`award-standard.service.ts`) and
 * again wherever a category is bound to it.
 */
export type StandardKey = string;

/**
 * What stands on the ballot in a category.
 *
 * - `individual` — one registered finalist, shown as a portrait.
 * - `clique` — a named group of 3+ members, shown as the name over their faces.
 * - `brand` — a business, shown as its logo and name. Its founders are recorded
 *   and visible in admin stats, but the ballot frame carries the brand.
 */
export type EntryKind = "individual" | "clique" | "brand";

/** Who a category is open to. Drives the admin nominee check, not the ballot. */
export type StandardGender = "any" | "male" | "female";

/** One category's entry in the published standard. Lives in code, never in DB. */
export type AwardStandard = {
    key: StandardKey;
    title: string;
    entryKind: EntryKind;
    gender: StandardGender;
    /** One line, shown under the title on the ballot. */
    blurb: string;
    /** What the award actually recognises. */
    definition: string;
    /** Common false signals — "does NOT qualify on its own". */
    disqualifiers: string[];
    /** Every box must be checked, with a named example, before the ballot. */
    checklist: string[];
    /** An extra test worth spelling out, e.g. the clique "No Camera" test. */
    note?: { title: string; body: string };
};

/** The whole standard, as parsed from `award-standard.jsonrc`. */
export type AwardStandardDoc = {
    /** The sentence that settles every close call. */
    principle: string;
    generalRules: string[];
    screeningStages: { title: string; body: string }[];
    definitions: { term: string; meaning: string }[];
    categories: AwardStandard[];
};

/** One person inside a clique or behind a brand. */
export type CandidateMember = {
    registrationId: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    /** "founder", "co-founder", or null for a plain clique member. */
    role: string | null;
};

/**
 * A category on the ballot — one award, many candidates, one vote each.
 *
 * **`slug` is the binding to the criteria.** It matches a `key` in
 * `award-standard.jsonrc`, and that match is what lets the category exist on a
 * ballot at all. No extra column and no migration: the slug column was already
 * there, and reusing it means there is exactly one identifier to keep straight.
 *
 * The slug is set at creation and never edited — re-pointing a live category at
 * different criteria would retroactively change what its nominees were screened
 * against, which is the same as having no criteria.
 */
export type AwardCategory = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    sortOrder: number;
    isArchived: boolean;
};

/** A category with its criteria resolved. `standard` is null when undocumented. */
export type DocumentedCategory = AwardCategory & {
    standard: AwardStandard | null;
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
    entryKind: EntryKind;
    /**
     * What the ballot frame carries: a person's full name, a clique's name, or
     * a brand's name. The frame renders this and never reassembles a name from
     * parts, so a brand can never accidentally read as its founder.
     */
    displayName: string;
    /** The short form for running copy — a first name, or the group's name. */
    shortName: string;
    nickname: string;
    /** Portrait for a person, logo for a brand. Empty string for a clique. */
    imageUrl: string;
    /** Non-null only for `individual` — a clique or brand is nobody's row. */
    registrationId: string | null;
    level: string | null;
    unit: string | null;
    /** Clique roster or brand founders. Always empty for `individual`. */
    members: CandidateMember[];
    /** Short code behind their campaign link, `/awards/c/<shareCode>`. */
    shareCode: string;
};

/**
 * A category with its candidates, plus which one this voter picked.
 *
 * Extends `DocumentedCategory`, so `standard` is non-null by the time a rail
 * renders: `getBallotCategories` drops anything undocumented before it gets
 * here. The nullability lives one layer up, where it can still be acted on.
 */
export type BallotCategory = DocumentedCategory & {
    /** Narrowed: nothing undocumented survives `getBallotCategories`. */
    standard: AwardStandard;
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
    entryKind: EntryKind;
    displayName: string;
    nickname: string;
    imageUrl: string;
    /** Founders behind a brand, members of a clique — stats only, never ballot. */
    members: CandidateMember[];
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

/**
 * One category's outcome, as the reveal screen states it.
 *
 * An award has exactly one winner. When the members' vote finishes level,
 * `tallyCategory` still refuses to crown anybody — but the awards committee
 * then votes among the tied candidates and that decides it, which is what
 * `decidedByCommittee` records.
 *
 * `contenders` is the rest of the dead heat: the people the room put level with
 * the winner. They are on the screen deliberately. One name goes on the award,
 * but "this one came down to a coin's edge" is true, and saying it is fairer to
 * everyone involved than a silent single name.
 *
 * `winner` is null in exactly two cases: nobody voted in the category at all,
 * or a dead heat the committee has not settled yet — which publishing the
 * results refuses to let happen.
 */
export type AwardWinner = {
    categoryId: string;
    slug: string;
    title: string;
    /** The award's line from the standard — what it was actually given for. */
    blurb: string;
    votesCast: number;
    winner: CandidateResult | null;
    /** Others level with the winner on the members' vote. Empty in the usual case. */
    contenders: CandidateResult[];
    /** The members' vote was a dead heat and the committee's ballot settled it. */
    decidedByCommittee: boolean;
    /**
     * Nothing has been unveiled yet. The slide shows the award and a blurred
     * fan of its nominees; `winner`, `contenders` and `votesCast` are all empty
     * because the answer is not in the payload at all — see `nominees`.
     */
    sealed: boolean;
    /**
     * The faces behind the blur, while sealed. Deliberately just faces: no
     * names, no counts, no ordering that means anything.
     */
    nominees: SealedNominee[];
};

/**
 * One nominee as the sealed slide shows them — a face and nothing else.
 *
 * This is the whole trick behind the blurred screen. A CSS blur is a picture
 * filter, not a secret: anybody can open devtools and turn it off. So the blur
 * is laid over information that is *already public* — the nominees, who have
 * been on the ballot for weeks — and the winner is simply not sent until the
 * organizers publish. Unblurring the sealed screen reveals the nominees, which
 * is what it looks like it is revealing.
 *
 * It carries no name for a second reason: a single blurred face with a name
 * under it, screenshotted by somebody who removed the filter, is a rumour about
 * who won. A fan of every nominee's face cannot be mistaken for an answer.
 */
export type SealedNominee = {
    candidateId: string;
    entryKind: EntryKind;
    imageUrl: string;
    members: CandidateMember[];
};

/** One candidate in a dead heat, as the committee's ballot shows them. */
export type TieBreakContender = CandidateResult & {
    /** Votes from the committee, not the members. */
    committeeVotes: number;
};

/**
 * A category the members left tied, waiting on the committee.
 *
 * `myVoteCandidateId` is the signed-in admin's own pick — the screen shows it
 * back the way the ballot shows a member theirs, so nobody has to remember
 * whether they already voted.
 */
export type TieBreakCategory = {
    categoryId: string;
    title: string;
    /** Votes each tied candidate drew from the members — identical, by definition. */
    tiedAt: number;
    votesCast: number;
    contenders: TieBreakContender[];
    myVoteCandidateId: string | null;
    /** Admins who have voted, out of how many there are. */
    votesIn: number;
    committeeSize: number;
    /** True once one contender is strictly ahead on the committee's ballot. */
    settled: boolean;
};

/**
 * Everything the winners screen renders, published or not.
 *
 * The screen is always reachable — that is the point of it. Before the
 * organizers publish it is a hall of sealed envelopes, which is a better
 * "coming soon" than a coming-soon page; after, it is the results. `published`
 * is the difference, and it is the server that decides it, not the page.
 */
export type AwardsReveal = {
    /** In the admin's category order, so the reveal runs in the arranged sequence. */
    categories: AwardWinner[];
    /** False while sealed — and then `voters` and `totalVotes` are both 0. */
    published: boolean;
    voters: number;
    totalVotes: number;
};


/**
 * Someone leading in more than one category — the night's recurring name.
 *
 * Attribution reaches through group entries: a founder whose brand is leading
 * counts as leading, because "one win per person" is a rule about people, and
 * a brand award is still a person collecting it.
 */
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
    /**
     * Live categories whose slug matches no entry in `award-standard.jsonrc`.
     * These are off the ballot and block voting from opening — the one number
     * on this page that is a hard stop rather than a nudge.
     */
    undocumentedCategories: string[];
    /**
     * Live categories finishing level at the top with the committee's own
     * ballot not yet decisive. The other hard stop: results cannot be published
     * while this is non-empty, because an award has one winner and a dead heat
     * has none.
     */
    tiedCategories: string[];
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
    entryKind: EntryKind;
    displayName: string;
    shortName: string;
    nickname: string;
    imageUrl: string;
    members: CandidateMember[];
    categoryTitle: string;
    categoryDescription: string | null;
    categorySlug: string;
    /** False once voting closes — the page still renders, the button doesn't. */
    votingOpen: boolean;
};

/**
 * The dinner registration an email resolved to, checked against one category.
 *
 * `standing` and `otherCategories` are what turn a bare "valid" into something
 * an admin can act on — the mistake worth catching is standing the same person
 * twice, and the useful context is where else they're already up.
 */
export type FinalistOption = {
    registrationId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    level: string;
    unit: string | null;
    photoUrl: string;
    standing: boolean;
    /** How many other categories they're already standing in. */
    otherCategories: number;
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
