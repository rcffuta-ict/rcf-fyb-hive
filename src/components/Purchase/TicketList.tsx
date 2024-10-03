'use client'
import React from 'react';
import { useEffect, useState } from "react"
import { GuestObject } from "@/lib/nobox/record-structures/Guest";
import { TicketObject } from "@/lib/nobox/record-structures/Ticket";
import Image from 'next/image';
import { getGuestName } from '@/utils/process-details';
import { useTicket } from '@/context/TicketContext';

interface GuestItem {
    guestM: GuestObject | null;
    guestF: GuestObject | null;
}


function TicketUnit({guest, female}: {guest: GuestObject | null | undefined; female?:boolean}) {
    return (
        <div>
            <div className="img-wrapper">
                <Image
                    src={guest ? guest.picture : (female ? '/images/female.svg' : '/images/male.svg')}
                    alt={guest ? getGuestName(guest) : ''}
                    width={200}
                    height={200}
                />
            </div>


            <p>
                {
                    guest ? getGuestName(guest, true) : <span className='loader'>loading...</span>
                }
                <br/>
                <span>
                    {guest?.consentId || guest?.associateId}
                </span>
            </p>
        </div>
    )
}

function TicketItem({data}: {data: TicketObject}) {

    const {obtainGuestRecord, handleApproval} = useTicket();
    
    const [guests, setGuests] = useState<GuestItem | null>(null);
    const [approving, setApproving] = useState(false);

    useEffect(()=>{

        (async ()=>{
            if (guests) return;

            try {

                const male = await obtainGuestRecord(data.guestMId);
                const female = await obtainGuestRecord(data.guestFId);
    
                setGuests(()=>{
                    return {
                        guestM: male,
                        guestF: female
                    }
                });

            } catch(err:any) {
                console.error(err);
            }

        })()

    },[guests])


    const approveTicket = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (approving) return;

        setApproving(true);

        handleApproval(data.id)
        .then(()=>{
            console.debug("Approved:", data.id);
        })
        .catch((e)=>{
            console.error("Approval error:", e);
        })
        .finally(()=>{
            setApproving(false);
        })
    }


    const indicator = approving ? 'Approving...' : (data.confirmed ? "Approved" : "Approve");

    return (
        <form className='ticket-item' onSubmit={approveTicket}>

            <TicketUnit
                guest={guests?.guestM}
            />

            <button disabled={data.confirmed} type='submit' data-success={Boolean(data.ticketId)}>
                {indicator}
            </button>

            <TicketUnit
                guest={guests?.guestF}
                female
            />

        </form>
    )
}

export default function TicketList() {
    const {tickets} = useTicket();

    return (
        <>
            {/* <ApproveTicket/> */}
            

            <div className="ticket-item-wrapper">

                

                {
                    tickets.map((ticket, i)=>{

                        return <TicketItem key={ticket.id} data={ticket} />
                    })
                }
            </div>
        </>
    )
}