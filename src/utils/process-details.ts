import { GuestObject } from "@/lib/nobox/record-structures/Guest";


export function getPronoun(guest: GuestObject, short=false) {
    if (guest.gender === 'male') return short ? 'Bro' : 'Brother';
    if (guest.gender === 'female') return short? 'Sis': 'Sister';
}
export function getNameByGender(guest?: GuestObject) {

    if (!guest) return 'your guest'
    // if (guest.gender === 'male') return 'Brother' + ' ' + guest.firstname;
    return getPronoun(guest) + ' ' + guest.firstname;
}

export function getGuestName(guest: GuestObject, pronoun=false) {

    return `${pronoun ? getPronoun(guest, true) : ''} ${guest.lastname} ${guest.firstname}`.trim()

}

export const parseConsent = (associateId:string)=>associateId.toLocaleLowerCase().replaceAll(' ','').replaceAll('fyb-', '')