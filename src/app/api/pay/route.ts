
import { GuestObject } from '@/lib/nobox/record-structures/Guest';
import axios from 'axios';


export async function POST(req: Request) {
    const secret_key = process.env.KORA_SK;

    if (!secret_key) throw new Error("KORA key not given");

    const options = {
        headers: {
            'Content-Type': 'application/json',  // Example of specifying content type
            'Authorization': `Bearer ${secret_key}`, // Example of including a token
            // 'Custom-Header': 'your-custom-header-value' // Any other custom headers
        }
    }
    
    try {
        const body = await req.json();
        const guest: GuestObject | undefined = body.guest;

        if (!guest) throw new Error("Paying Guest not given");

        const data = {
            "amount": 5000,
            "currency": "NGN",
            "reference": "ref-"+guest.id+(new Date().getTime()).toString(),
            redirect_url : "http://localhost:3000/buy-ticket",
            narration: "FYB Dinner ticket payment",
            "customer": {
                "email": guest.email,
                // "name": guest.firstname + guest.lastname
            }
        }

        // console.log(data)

        const response = await axios.post(
            'https://api.korapay.com/merchant/api/v1/charges/initialize',
            data,
            options
        )

        // console.log(response);

        return Response.json({...response.data});
    } catch (error) {
        console.error(error);
        return Response.json({ error }, { status: 500 });
    }
}
