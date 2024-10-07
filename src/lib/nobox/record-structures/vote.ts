import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


export interface Vote {
    categoryId: string;
    guestId: string;
    userId: string;
}

export type VoteObject = ReturnObject<Vote>;

export const VoteStructure: Space<Vote> = {
    space: "Vote",
    description: "A Record Space for FYB Award votes",
    structure: {
        categoryId: {
            description: "Vote category",
            type: String,
            required: true
        },
        guestId: {
            description: "Voted guest",
            type: String,
            required: true,
        },
        userId: {
            description: "Voting user",
            type: String,
            required: true
        },
    }
}

export const VoteModel = createRowSchema<Vote>(VoteStructure);
