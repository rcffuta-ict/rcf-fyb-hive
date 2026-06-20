// data/voteConfig.ts
export const VOTE_CONFIG: VoteCofigType[] = [
  {
    id: "most-jovial",
    name: "Most Jovial Image",
    description: "Recognizes the most cheerful and lively personality",
    type: "individual" as const,
    candidates: []
  },
  {
    id: "clique-of-the-year",
    name: "Clique Of The Year",
    description: "Awards the most united and supportive friend group",
    type: "group" as const,
    candidates: [
      [],
      []
    ]
  },
  // Add all other categories...
];

export type Email = `${string}@${string}`;


export type VoteType = "individual" | "group";

export type VoteCofigType =
  | {
      id: string;
      name: string;
      description: string;
      type: "individual";
      candidates: Email[]; // Array of emails
    }
  | {
      id: string;
      name: string;
      description: string;
      type: "group";
      candidates: Email[][]; // Array of groups of emails
    };
