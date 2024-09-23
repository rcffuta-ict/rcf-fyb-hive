import TicketForm from "@/components/Purchase/PurchaseTickerForm";

export default function TicketPurchasePage() {
    return (
        <>
            <h1 className="text-center clr-primary ff-riffic fw-700 fs-24 lh-30">
                Purchase your ticket
            </h1>

            <br/><br/>
            <TicketForm />
        </>
    )
}