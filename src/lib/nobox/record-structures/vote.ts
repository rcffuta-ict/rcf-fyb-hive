import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


type CategoryId = string;
type GuestId = string;


export type VoteItem = {
    categoryId: string;
    guestId: string;
};


export interface Vote {
    userId: string;
    votes: VoteItem[];
}

export type VoteObject = ReturnObject<Vote>;

export const VoteStructure: Space<Vote> = {
    space: "Vote",
    description: "A Record Space for FYB Award votes",
    structure: {
        userId: {
            description: "Voting user",
            type: String,
            required: true
        },
        votes: {
            description: "Voting user votes",
            type: Array,
            // required: true,
            defaultValue: []
        },
    }
}

export const VoteModel = createRowSchema<Vote>(VoteStructure);
