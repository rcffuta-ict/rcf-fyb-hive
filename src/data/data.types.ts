import { VoteCategoryObject } from "@/lib/nobox/record-structures/voteCategory";

export interface NomineeBase {
    categoryId: string;
    contestants: string[];
}

export interface NomineeList extends NomineeBase {
    category: VoteCategoryObject,
}