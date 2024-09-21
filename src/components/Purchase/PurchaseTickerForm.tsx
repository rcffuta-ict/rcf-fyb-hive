'use client'

import { FormEvent, useState } from "react"
import GuestCard from "../Form/GuestCard";
import { GuestObject } from "@/lib/nobox/record-structures/Guest";

export default function TicketForm() {

    const [guests, setGuests] = useState<{
        [id: string]: GuestObject | null;
    } | null>(null);
    // const [guest2, setGuest2] = useState<GuestObject | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    }


    const updateGuest = (id: string, val: GuestObject | null)=>{
        setGuests((p)=>{
            return {
                ...p,
                [id]: val
            }
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="ticket-form">
                <GuestCard
                    id="g-1"
                    guest={guests ? guests['g-1'] : null}
                    updateGuest={updateGuest}
                />
                <div>
                    <button>
                        Buy Ticket
                    </button>
                </div>
                <GuestCard
                    id="g-2"
                    guest={guests ? guests['g-2'] : null}
                    updateGuest={updateGuest}
                    female
                />
            </form>
        </>
    )
}