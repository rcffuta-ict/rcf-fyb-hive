import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


export interface Voter {
    name: string;
    email: string;
    level: string;
    password: string;
}

export type VoterObject = ReturnObject<Voter>;

export const VoterStructure: Space<Voter> = {
    space: "Voter",
    description: "A Record Space for FYB guests",
    structure: {
        name: {
            description: "Voter's name",
            type: String,
            required: true
        },
        email: {
            description: "Voter's email",
            type: String,
            required: true,
            unique: true,
        },
        level: {
            description: "Voter's level",
            type: String,
            required: true
        },
        password: {
            description: "Voter's password",
            type: String,
            required: true,
            hashed: true,
        },
    }
}

export const VoterModel = createRowSchema<Voter>(VoterStructure);
