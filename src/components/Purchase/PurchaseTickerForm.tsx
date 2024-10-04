'use client'
import React from 'react';
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import GuestCard from "../Form/GuestCard";
import { GuestObject } from "@/lib/nobox/record-structures/Guest";
import { useRouter } from "next/navigation";
import PaymentDetailsModal from "./PayDetailsModal";
import { TicketModel, TicketObject } from "@/lib/nobox/record-structures/Ticket";
import { message } from "antd";
import { findTicket } from "@/utils/guest-utils";
import { assignTicketId } from '@/utils/submit';

type ID = 'g-1' | 'g-2';


const verifyGuest = async (guest: GuestObject) => {
    const val = await findTicket(guest.id);
    if (val) {
        console.log(`Taken:`, val);
        // show feedback
        return null;
    }
    return guest;
};


export default function TicketForm() {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [canPay, setCanPay] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [guests, setGuests] = useState<{
        [id: string]: GuestObject | null;
    } | null>(null);

    const alterRef = useRef<string | null>(null);
    
    
    const verifyPair = async (showFeedback = true) => {

        if (!guests) {
            // show something
            return []
        }

        const left = guests['g-1'];
        const right = guests['g-2'];

        

        const pairs = [
            left ? await verifyGuest(left) : null,
            right ? await verifyGuest(right) : null
        ].filter(Boolean); // Filter out null values

        return pairs as GuestObject[];
    }

    const handleSubmit = async(e: FormEvent) => {
        e.preventDefault();


        const pairs = await verifyPair(true);

        const [_left, _right] = pairs;

        // save ticket log

        setLoading(true);


        messageApi.open({
            type: 'loading',
            content: 'Pairing in motion...',
            duration: 0,
            key: 'loader-1'
        });

        const _ticket = await assignTicketId();

        try {
            const dt = await TicketModel.insertOne({
                guestFId: _right.id,
                guestMId: _left.id,
    
                amount: 5000,

                ticketId: _ticket.ticketId,
            });
    
            // console.log(dt);

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

    // const canPay = verifyPair().length === 2;

    useEffect(() => {
        const checkCanPay = async () => {
            const pairs = await verifyPair();
            setCanPay(pairs.length === 2);
        };
        checkCanPay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guests]); // Dependency on guests


    let state;

    if (loading) state = 'error';
    // if (loading) state = 'loading'
    if (canPay) state='active'

    return (
        <>
            {contextHolder}
            <form onSubmit={handleSubmit} className="ticket-form">
                <GuestCard
                    id="g-1"
                    alterId={'g-2'}
                    guest={guests ? guests['g-1'] : null}
                    updateGuest={updateGuest}
                    isAltered={alterRef.current === 'g-1'}
                    didAltered={alterRef.current === 'g-2'}
                />
                {/* <div> */}
                    <button
                        disabled={!canPay}
                        onClick={handleSubmit}
                        data-state={state}
                    >
                        {loading ? "Paring..." : "Pair"}
                    </button>
                {/* </div> */}
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
                    // alterRef.current = null;
                    // setGuests(null);
                    // setOpen(false);

                    // router.replace('/buy-ticket')

                    window.location.reload();
                }}
            />
        </>
    )
}