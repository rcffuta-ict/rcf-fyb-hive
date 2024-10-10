'use client'
import React, { useMemo } from 'react';
import { useEffect, useState } from "react"
import { GuestObject } from "@/lib/nobox/record-structures/Guest";
import { TicketObject } from "@/lib/nobox/record-structures/Ticket";
import Image from 'next/image';
import { getGuestName } from '@/utils/process-details';
import { useCheck, useTicket } from '@/context/TicketContext';

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

function TicketCheckInItem({data, checker}: {data: TicketObject, checker: any}) {

    const {obtainGuestRecord, messageApi} = useTicket();
    
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


    const indicator = "Checked In";

    const checked = checker.isChecked(data.ticketId);

    if (!checked) return null;

    return (
        <form className='ticket-item' onSubmit={(e)=>e.preventDefault()}>

            <TicketUnit
                guest={guests?.guestM}
            />

            <div className='ticket-cta'>

                <button disabled={checked} type='submit' data-success={Boolean(checked)}>
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

export default function TicketProtocolList() {
    const {tickets} = useTicket();
    const checkProps = useCheck();

    const _approved_tickets = useMemo(()=>{
        return tickets.filter((e)=>e.confirmed)
    }, [tickets])

    return (
        <>
            {/* <ApproveTicket/> */}

            <div className="ticket-item-wrapper">
                {_approved_tickets.map((ticket, i) => {
                    return (
                        <TicketCheckInItem
                            key={ticket.id}
                            data={ticket}
                            checker={checkProps}
                        />
                    );
                })}
            </div>
        </>
    );
}