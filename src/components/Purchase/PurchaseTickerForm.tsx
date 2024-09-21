'use client'

import { FormEvent, useRef, useState } from "react"
import GuestCard from "../Form/GuestCard";
import { GuestObject } from "@/lib/nobox/record-structures/Guest";

type ID = 'g-1' | 'g-2';

export default function TicketForm() {

    const [guests, setGuests] = useState<{
        [id: string]: GuestObject | null;
    } | null>(null);

    const alterRef = useRef<string | null>(null);
    // const [guest2, setGuest2] = useState<GuestObject | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    }


    const updateGuest = (id: string, val: GuestObject | null, isAlter=false)=>{

        setGuests((p)=>{

            if (isAlter) {
                alterRef.current = id;
            } else {
                alterRef.current = null;
            }


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
                    alterId={'g-2'}
                    guest={guests ? guests['g-1'] : null}
                    updateGuest={updateGuest}
                    isAltered={alterRef.current === 'g-1'}
                />
                <div>
                    <button>
                        Buy Ticket
                    </button>
                </div>
                <GuestCard
                    id="g-2"
                    alterId={'g-1'}
                    guest={guests ? guests['g-2'] : null}
                    updateGuest={updateGuest}
                    isAltered={alterRef.current === 'g-2'}
                    female
                />
            </form>
        </>
    )
}