
import { AssociateConfirmationEmailTemplate, FinalstConfirmationEmailTemplate } from '@/components/Templates/confirmation-mail';
import { send_api_key, send_mail } from '@/lib/nobox/config';
import { GuestObject } from '@/lib/nobox/record-structures/Guest';
import { Resend } from 'resend';

const resend = new Resend(send_api_key);

export async function POST(req: Request) {
    
    try {
        const body = await req.json();
        const guest: GuestObject | undefined = body.guest;
        const associate: GuestObject | undefined = body.associate;


        if (!guest) throw new Error("Guest not given");
        if (!associate) throw new Error("Associate not given");

        const { data, error } = await resend.emails.send({
            from: send_mail,
            to: [associate.email, guest.email],
            subject: 'Registration Confirmation | FYB Dinner',
            react: AssociateConfirmationEmailTemplate({ guest, associate }),
        });

        if (error) {
          return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
