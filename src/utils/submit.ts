import { GuestAccount, GuestModel } from "@/lib/nobox/record-structures/Guest";
import { generateShortToken, generateTicketId } from "./generate-token";
import { TicketModel } from "@/lib/nobox/record-structures/Ticket";

export async function submitData (formData: any, genToken: boolean = false) {

    const obj = await GuestModel.insertOne(formData as GuestAccount)


    if (!obj) {
        
        throw new Error("Did not create account!");
    }

    if (genToken) {

        const token = generateShortToken(obj.id)
    
        // Update consent token
        const guest = await GuestModel.updateOneById(obj.id, {
            consentId: token
        });
        return guest;
    }


    return obj;
}


export async function assignTicketId () {
    let found_it = false;
    let _ticket;

    do {
        const ticket = generateTicketId();

        const existing_ticket = await TicketModel.find({
            ticketId: ticket.ticketId,
        });

        if (existing_ticket.length === 0) {  // Ensure no conflicting ticket is found
            _ticket = ticket;
            found_it = true;
        }

    } while (!found_it);

    if (!_ticket) throw new Error("Could not generate ticket");

    return _ticket;
}

export async function approveTicket (id: string) {

    // let found_it = false;
    // let _ticket;

    // do {
    //     const ticket = generateTicketId();

    

    

    // } while (!found_it);

    // // We should never reach this, but added for extra safety
    // if (!_ticket) throw new Error("Could not generate ticket");

    const existing_ticket = await TicketModel.findOne({id});

    if (!existing_ticket) throw new Error("Could not approve ticket");
    if (!existing_ticket.ticketId) throw new Error("Could not approve ticket. Not assigned!");

    const ticketUpdateResult = await TicketModel.updateOneById(id, {
        confirmed: true,
        confirmedDate: new Date(),
        // ticketId: existing_ticket.ticketId
    });

    return ticketUpdateResult;
}
