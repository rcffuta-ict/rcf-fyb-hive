'use client'
import React, { useMemo } from 'react';
import { useEffect, useState } from "react"
import { GuestObject } from "@/lib/nobox/record-structures/Guest";
import { TicketObject } from "@/lib/nobox/record-structures/Ticket";
import Image from 'next/image';
import { getGuestName } from '@/utils/process-details';
import { useTicket } from '@/context/TicketContext';
import axios from 'axios';

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
                <span className=''>
                    {guest?.consentId || (guest?.associateId && '<<Associate>>')}
                </span>
            </p>
        </div>
    )
}

function TicketItem({data}: {data: TicketObject}) {

    const {obtainGuestRecord, handleApproval, messageApi} = useTicket();
    
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
        .then((_data)=>{

            if (!_data) return;

            console.debug("Approved:", data.id);
            
            messageApi.open({
                type: 'loading',
                content: 'Sending confirmation mail...',
                duration: 0,
                key: 'mail-1'
            });

            axios.post('/api/mail-ticket', { ticket: _data, guests: [guests?.guestM, guests?.guestF] })
            .then(()=>{

                messageApi.destroy('mail-1');
                messageApi.success("Sent mail!");
            })
            .catch((err)=>{
                console.error("Error sending mail:", err)
                messageApi.destroy('mail-1');
                messageApi.error("We could not send mail!");
            });

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

            <div className='ticket-cta'>

                <button disabled={data.confirmed} type='submit' data-success={Boolean(data.confirmedDate)}>
                    {indicator}
                </button>
                <br/>
                <span>
                    {data.ticketId}
                </span>
            </div>


            <TicketUnit
                guest={guests?.guestF}
                female
            />

        </form>
    )
}

export default function TicketList() {
    const {tickets} = useTicket();

    const _sorted_tickets = useMemo(()=>{
        return tickets.sort((a, b) => {
            if (a.confirmed === b.confirmed) {
                return 0; // If both are the same, maintain their order
            }
            return a.confirmed ? 1 : -1; // Move confirmed to the bottom
        });
    }, [tickets])

    return (
        <>
            {/* <ApproveTicket/> */}
            

            <div className="ticket-item-wrapper">

                {
                    _sorted_tickets.map((ticket, i)=>{

                        return <TicketItem key={ticket.id} data={ticket} />
                    })
                }
            </div>
        </>
    )
}