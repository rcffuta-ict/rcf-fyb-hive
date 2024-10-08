import { VoteCategoryObject } from "@/lib/nobox/record-structures/voteCategory";


export type Contestant = {
    ref: string;
    alias?: string;
}


export interface NomineeBase {
    categoryId: string;
    contestants: Contestant[];
}

export interface NomineeList extends NomineeBase {
    category: VoteCategoryObject,
}