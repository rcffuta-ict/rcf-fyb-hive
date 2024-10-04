
import { FinalstConfirmationEmailTemplate } from '@/components/Templates/confirmation-mail';
import { TicketEmailConfirmationTemplate } from '@/components/Templates/ticket-mail';
import { send_api_key, send_mail } from '@/lib/nobox/config';
import { GuestObject } from '@/lib/nobox/record-structures/Guest';
import { TicketObject } from '@/lib/nobox/record-structures/Ticket';
import { Resend } from 'resend';

const resend = new Resend(send_api_key);

export async function POST(req: Request) {
    
    try {
        const body = await req.json();
        const guests: GuestObject[] | undefined = body.guests;
        const ticket: TicketObject | undefined = body.ticket;


        if (!guests || guests.length < 2) throw new Error("Guests not given, or incomplete");
        if (!ticket) throw new Error("Ticket not given!");

        const { data, error } = await resend.emails.send({
            from: send_mail,
            to: guests.map(e=>e.email),
            subject: 'Ticket Confirmation | FYB Dinner',
            react: TicketEmailConfirmationTemplate({ guests, ticket }),
        });

        if (error) {
          return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
