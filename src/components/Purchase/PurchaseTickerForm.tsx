'use client'

import { FormEvent, useRef, useState } from "react"
import GuestCard from "../Form/GuestCard";
import { GuestObject } from "@/lib/nobox/record-structures/Guest";
import axios from "axios";
import { useRouter } from "next/navigation";
import PaymentDetailsModal from "./PayDetailsModal";
import { TicketModel } from "@/lib/nobox/record-structures/Ticket";

type ID = 'g-1' | 'g-2';

export default function TicketForm() {

    const router = useRouter();
    const [open, setOpen] = useState(false);

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


        if (!_left || !_right) {
            return []
        }

        return [_left, _right]
    }

    const handleSubmit = async(e: FormEvent) => {
        e.preventDefault();

        const pairs = verifyPair();

        if (pairs.length !== 2) {
            // 
            return
        }

        const [_left, _right] = pairs;

        // save ticket log

        try {

            const dt = await TicketModel.insertOne({
                guestFId: _right.id,
                guestMId: _left.id,
    
                amount: 5000,
            });
    
            console.log(dt);

            // display payment procession
            setOpen(true)
        } catch(err: any) {
            console.error(err);
            // Show error feedback
        }

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
                    <button disabled={!canPay} onClick={handleSubmit}>
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

            <PaymentDetailsModal
                open={open}
                onOk={()=>{
                    // console.log("Close modal")
                    alterRef.current = null;
                    setGuests(null);
                    setOpen(false);

                    // router.replace('/buy-ticket')

                    // window.location.reload();
                }}
            />
        </>
    )
}