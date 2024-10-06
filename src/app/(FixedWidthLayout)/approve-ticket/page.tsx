import React from 'react';
import TicketList from '@/components/Purchase/TicketList';
import { useTicket } from '@/context/TicketContext';

export default function TicketPurchasePage() {
    
    return (
        <>
            <TicketList />
        </>
    )
}