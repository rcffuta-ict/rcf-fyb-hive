import { GuestAccount, GuestModel } from "@/lib/nobox/record-structures/Guest";
import { generateShortToken } from "./generate-token";

export default async function submitData (formData: any, genToken: boolean = false) {

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
