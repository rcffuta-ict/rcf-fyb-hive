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
    
    
    const verifyPair = () => {
        if (!guests) {
            // show something
            return []
        }

        const _left = guests['g-1']
        const _right = guests['g-2']

        return [_left, _right]
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        

        const [_left, _right] = verifyPair();

        console.log("Male", _left)
        console.log("Femle", _right)
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
                [id]: val,
            }
        })
    }


    const canPay = verifyPair().length === 2;

    return (
        <>
            <form onSubmit={handleSubmit} className="ticket-form">
                <GuestCard
                    id="g-1"
                    alterId={'g-2'}
                    guest={guests ? guests['g-1'] : null}
                    updateGuest={updateGuest}
                    isAltered={alterRef.current === 'g-1'}
                    didAltered={alterRef.current === 'g-2'}
                />
                <div>
                    <button disabled={!canPay}>
                        Buy Ticket
                    </button>
                </div>
                <GuestCard
                    id="g-2"
                    alterId={'g-1'}
                    guest={guests ? guests['g-2'] : null}
                    updateGuest={updateGuest}
                    isAltered={alterRef.current === 'g-2'}
                    didAltered={alterRef.current === 'g-1'}
                    female
                />
            </form>
        </>
    )
}