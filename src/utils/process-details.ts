import { GuestObject } from "@/lib/nobox/record-structures/Guest";

export function getNameByGender(guest?: GuestObject) {

    if (!guest) return 'your guest'
    if (guest.gender === 'male') return 'Brother' + ' ' + guest.firstname;
    if (guest.gender === 'female') return 'Sister' + ' ' + guest.firstname;

}