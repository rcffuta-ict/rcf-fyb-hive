import { GuestAccount, GuestObject } from "@/lib/nobox/record-structures/Guest";
import { TicketObject } from "@/lib/nobox/record-structures/Ticket";
import { getGuestName, getNameByGender } from "@/utils/process-details";



interface TicketEmailTemplateProps{
  guests: GuestObject[],
  ticket: TicketObject;
}


export const TicketEmailConfirmationTemplate: React.FC<Readonly<TicketEmailTemplateProps>> = (props) => {
    const [male, female] = props.guests;

    // console.log(props);

    return (
        <div>
            <h3>Hello our esteemed guest,</h3>

            <p>
                This is to inform you that the pairing of:
                <br/><br/>

                <b style={{fontSize: '18px'}}>{getGuestName(male, true)}</b> 
                &nbsp;&&nbsp;
                <b style={{fontSize: '18px'}}>{getGuestName(female, true)}</b>

                <br/><br/>

                has been approved!
            </p>

            <p>
                Here is your Entry ticket ID: <b style={{fontSize: '20px'}}>{props.ticket.ticketId}</b>
            </p>

            <p>
                Please ensure to come together.
            </p>


            <p>
                <b>Event details include:</b>

                <ul>
                    <li>
                        Event Theme: Splendor Of His Love.
                    </li>
                    <li>
                        Event Venue: Redeemed Christian Fellowship, FUTA Chapter auditorium.
                    </li>
                    <li>
                        Event Time: 4pm (WAT). Red carpet starts 4pm, ends 4:30pm.
                    </li>
                </ul>
            </p>

            <p>
                For any enquiries, contact: (Menorah) +234 706 9089 065, (Mercy) +234 814 8014 961.
            </p>


            <p style={{color: '#bebdbd', fontSize: "14px"}}>
                © 2024 Army of Light Family, RCF FUTA. All rights reserved.
            </p>

        </div>
    )
};

