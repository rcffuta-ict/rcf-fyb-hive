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
        <h3>Hello {props.guest.gender === 'male' ? 'Sir' : 'Ma'},</h3>

        <p>
            Thank you for registering. This is to inform you that your registration was successful.
        </p>

        <p>
            Here is your consent token <b>FYB-{props.guest.consentId!.toUpperCase()}</b>
        </p>

        <p>
            Please be careful and intentional about your consent token. Only share with the right person as your token will be used for verification in further activities.
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


        <p style={{color: '#bebdbd'}}>
            © 2024 Army of Light Family, RCF FUTA. All rights reserved.
        </p>

    </div>
);



export const AssociateConfirmationEmailTemplate: React.FC<Readonly<AssociateEmailTemplateProps>> = (props) => (
    <div>
        <h3>Hello {getNameByGender(props.guest)} and {getNameByGender(props.associate)},</h3>

        <p>
            Thank you for registering. This is to inform you that your registration was successful.
        </p>

        <p>
            This is also to notify you that your association, i.e <b>{props.guest.lastname} {props.guest.firstname}</b> and <b>{props.associate.lastname} {props.associate.firstname}</b> {Boolean(props.associate.relationsipWithAssociate) ? `(${props.associate.relationsipWithAssociate})`: ''} is recognized and approved.
        </p>


        <p>
            <b>The associate details includes:</b>

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
            <b>The guest&apos;s details includes:</b>

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


        <p style={{color: '#bebdbd'}}>
            © 2024 Army of Light Family, RCF FUTA. All rights reserved.
        </p>


    </div>
);
