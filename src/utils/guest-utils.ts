import { GuestModel, GuestObject } from "@/lib/nobox/record-structures/Guest";
import { TicketModel, TicketObject } from "@/lib/nobox/record-structures/Ticket";
import { getGuestName } from "./process-details";

export async function findAssociate(guest: GuestObject) {
    // console.log(associateId)
    const otherAssociate = await GuestModel.search({
        searchableFields: ['associateId'],
        searchText: (guest.consentId as string)
    }) as unknown as GuestObject[];

    let associate:GuestObject | null = null;

    if (otherAssociate.length > 0) {
        // messageApi.destroy('loader-1');
        // messageApi.error('There is an issue with your info');
        associate = otherAssociate.filter((each)=>each.email !== guest.email)[0] || null;

        return associate;
    }

    return null;
}


export async function findTicket(id: string) {
    const ticket = await TicketModel.search({
        searchableFields: ['guestFId', 'guestMId'],
        searchText: id,
    }) as unknown as TicketObject[];

    return ticket[0];
}
