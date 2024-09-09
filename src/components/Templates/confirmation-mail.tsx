import { GuestAccount, GuestObject } from "@/lib/nobox/record-structures/Guest";
import { getNameByGender } from "@/utils/process-details";


interface FinalstEmailTemplateProps {
  guest: GuestObject,
}


interface AssociateEmailTemplateProps extends FinalstEmailTemplateProps{
  associate: GuestObject,
}


export const FinalstConfirmationEmailTemplate: React.FC<Readonly<FinalstEmailTemplateProps>> = (props) => (
    <div>
        <h1>Hello {props.guest.gender === 'male' ? 'Sir' : 'Ma'},</h1>

        <p>
            Thank you for registering. This is to inform you that your registration was successful.
        </p>

        <p>
            Here is your consent token

            <b>FYB-{props.guest.consentId!.toUpperCase()}</b>
        </p>

        <p>
            Please becareful and intentional about your consent token. Only share with the right person/people as your token will be used for varification in further activities.
        </p>


        <p>
            <b>Your details includes:</b>

            <ul>
                <li>
                    Full name: {props.guest.lastname} {props.guest.firstname}
                </li>
                <li>
                    Email address: {props.guest.email}
                </li>
                <li>
                    Phone number: +234 {props.guest.contact}
                </li>
            </ul>
        </p>

    </div>
);



export const AssociateConfirmationEmailTemplate: React.FC<Readonly<AssociateEmailTemplateProps>> = (props) => (
    <div>
        <h1>Hello {getNameByGender(props.guest)} and {getNameByGender(props.associate)},</h1>

        <p>
            Thank you for registering. This is to inform you that your registration was successful.
        </p>

        <p>
            This is also to notify you that your association, i.e <b>{props.guest.lastname} {props.guest.firstname}</b> and <b>{props.associate.lastname} {props.associate.firstname}</b> {Boolean(props.associate.relationsipWithAssociate) ? `(${props.associate.relationsipWithAssociate})`: ''} is recognized and approved.
        </p>


        <p>
            <b>Your details includes:</b>

            <ul>
                <li>
                    Full name: {props.associate.lastname} {props.associate.firstname}
                </li>
                <li>
                    Email address: {props.associate.email}
                </li>
                <li>
                    Phone number: +234 {props.associate.contact}
                </li>
            </ul>
        </p>

        <p>
            <b>Your guest&apos;s details includes:</b>

            <ul>
                <li>
                    Full name: {props.guest.lastname} {props.guest.firstname}
                </li>
                <li>
                    Email address: {props.guest.email}
                </li>
                <li>
                    Phone number: +234 {props.guest.contact}
                </li>
            </ul>
        </p>

    </div>
);
