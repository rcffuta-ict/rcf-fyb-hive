import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


export interface VoteCategory {
    label: string;
}

export type VoteCategoryObject = ReturnObject<VoteCategory>;

export const VoteCategoryStructure: Space<VoteCategory> = {
    space: "VoteCategory",
    description: "A Record Space for FYB Award vote category",
    structure: {
        label: {
            description: "Vote category label",
            type: String,
            required: true
        },
    }
}

export const VoteCategoryModel = createRowSchema<VoteCategory>(VoteCategoryStructure);
