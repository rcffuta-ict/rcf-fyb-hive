// data/voteConfig.ts
export const VOTE_CONFIG: VoteCofigType[] = [
  {
    id: "most-jovial",
    name: "Most Jovial Image",
    description: "Recognizes the most cheerful and lively personality",
    type: "individual" as const,
    candidates: ["user1@example.com", "user2@example.com"]
  },
  {
    id: "clique-of-the-year",
    name: "Clique Of The Year",
    description: "Awards the most united and supportive friend group",
    type: "group" as const,
    candidates: [
      ["user1@example.com", "user2@example.com", "user3@example.com"],
      ["user4@example.com", "user5@example.com", "user6@example.com"]
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
