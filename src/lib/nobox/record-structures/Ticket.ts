import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


export interface Ticket {
    guestMId: string;
    guestFId: string;

    amount: number;

    confirmed?: boolean;
    confirmedDate?: Date;

    ticketId?: String;
}

export type TicketObject = ReturnObject<Ticket>;

export const TicketStructure: Space<Ticket> = {
    space: "Ticket",
    description: "A Record Space for FYB ticket purchase",
    structure: {
        guestFId: {
            description: "First Guest's ID",
            type: String,
            required: true
        },
        guestMId: {
            description: "Other Guest's ID",
            type: String,
            required: true
        },

        amount: {
            description: "Amount to be paid",
            type: Number,
            required: true
        },
        
        confirmed: {
            description: "Confirmed?",
            type: Boolean,
            defaultValue: false,
        },
        confirmedDate: {
            description: "Confirmation Date",
            type: String,
        },
        ticketId: {
            description: 'Ticket ID',
            // required: true,
            type: String,
            unique: true,
        }
    }
}

export const TicketModel = createRowSchema<Ticket>(TicketStructure);
