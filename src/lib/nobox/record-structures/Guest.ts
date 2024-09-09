import { ReturnObject, Space } from "nobox-client";
import { createRowSchema } from "../config";


type Gender = 'male' | 'female';

interface GuestProp {
    consentId?: string;
    associateId?: string;
    relationsipWithAssociate?: string;
}

export interface GuestAccount extends GuestProp{
    firstname: string;
    lastname: string;
    picture: string;
    gender: Gender;
    contact: string;
    email: string;
    partV?: boolean;
    worker?: boolean;
    unit?: string;
    exco?: boolean;
    portfolio?: string;
}

export type GuestObject = ReturnObject<GuestAccount>;

export const GuestStructure: Space<GuestAccount> = {
    space: "Guest",
    description: "A Record Space for FYB guests",
    structure: {
        firstname: {
            description: "Guest's first name",
            type: String,
            required: true
        },
        lastname: {
            description: "Guest's last name",
            type: String,
            required: true
        },
        picture: {
            description: "Guest's picture",
            type: String,
            required: true
        },
        gender: {
            description: "Guest's gender",
            type: String,
            required: true
        },
        contact: {
            description: "Guest's contact",
            type: String,
            required: true
        },
        email: {
            description: "Guest's Email",
            type: String,
            required: true,
            unique: true,
        },
        partV: {
            description: "Guest's level (partIV or Part V)",
            // required: true,
            type: Boolean,
        },
        worker: {
            description: "Is Guest a worker",
            // required: true,
            type: Boolean,
        },
        unit: {
            description: "Guest's unit (if a worker)",
            type: String,
        },
        exco: {
            description: "Is Guest an executive",
            // required: true,
            type: Boolean,
        },
        portfolio: {
            description: "Guest's portfolio (if an executive)",
            type: String,
        },


        consentId: {
            description: 'Guest personal consent token',
            // required: true,
            type: String,
            unique: true,
        },
        associateId: {
            description: 'Guest-finalist associate consent token',
            // required: true,
            type: String,
        },
        relationsipWithAssociate: {
            description: 'Associate relationship with finalist',
            // required: true,
            type: String,
        }
    }
}

export const GuestModel = createRowSchema<GuestAccount>(GuestStructure);
