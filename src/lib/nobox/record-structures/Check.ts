import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


export interface Check {
    ticketId: String;
}

export type CheckObject = ReturnObject<Check>;

export const CheckStructure: Space<Check> = {
    space: "Check",
    description: "A Record Space for FYB ticket check in",
    structure: {
        ticketId: {
            description: 'Ticket ID',
            // required: true,
            type: String,
            unique: true,
        }
    }
}

export const CheckModel = createRowSchema<Check>(CheckStructure);
