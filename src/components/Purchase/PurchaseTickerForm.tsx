'use client'

import { FormEvent } from "react"
import GuestCard from "../Form/GuestCard";

export default function TicketForm() {

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="ticket-form">
                <GuestCard />
                <div>
                    <button>
                        Buy Ticket
                    </button>
                </div>
                <GuestCard female/>
            </form>
        </>
    )
}