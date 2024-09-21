import Image from "next/image";
import TextInput from "./TextInput";
import { useEffect, useRef, useState } from "react";
import { FormError } from "./form.interface";
import { getGuestName, parseConsent } from "@/utils/process-details";
import { GuestModel, GuestObject } from "@/lib/nobox/record-structures/Guest";

interface GuestCardProps {
    female?:boolean;
}


async function fetchGuest(consentToken: string) {

    const consent = parseConsent(consentToken);

    const guest = await GuestModel.findOne({consentId: consent});

    return guest;

}

export default function GuestCard(props: GuestCardProps) {
    const [consentToken, setConsentToken] = useState<string>('');
    const [guest, setGuest] = useState<GuestObject | null >(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const requestRef = useRef<string | null>(null); // Tracks the latest request's input value


    const getValue = (key:string) => {
        return consentToken;
    }


    useEffect(() => {
        // Only proceed if inputValue is exactly 10 characters
        if (consentToken.length === 10) {
            // Track the current input value as the latest request
            const currentRequest = consentToken;
            requestRef.current = currentRequest;
            setLoading(true); // Set loading to true when request starts
            setError(null); // Reset error before making a new request

            // Simulate SDK findOne request
            const findData = async () => {

                const consent = parseConsent(consentToken);
                try {
                    const guest = await GuestModel.findOne({consentId: consent});
                    
                    // Only update if the current request is still the latest one
                    // if (requestRef.current === currentRequest) {
                    // console.log("The guest", guest)
                    if (guest) {
                        setGuest(guest)
                    } else {
                        console.log('Ignored outdated request for input:', currentRequest);
                        setGuest(()=>null)
                    }
                } catch (error) {
                    console.error('findOne error:', error);
                    if (requestRef.current === currentRequest) {
                        setError('Could not load guest details');
                    }
                }finally {
                    if (requestRef.current === currentRequest) {
                        setLoading(false); // Set loading to false when request finishes
                    }
                }
            };

            findData();
        }
    }, [consentToken]);

    const handleElemChange = (key:string, val:any)=>{
        // setError(null);
        setConsentToken(val);

        // Clear the request if input becomes less than 10 characters
        if (val.length < 10) {
            requestRef.current = null;
            setGuest(()=>null)
        }
    }


    const name = props.female ? 'consent-female' : 'consent-male'
    const imagePlaceholder = props.female ? '/images/female.svg':'/images/male.svg';

    const label = guest ? getGuestName(guest, true): 'Enter consent Token';
    const picture = guest ? guest.picture : imagePlaceholder;


    return (
        <div>
            <div className="img-wrapper">
                <Image
                    src={picture}
                    alt="Human figure"
                    width={100}
                    height={100}
                />
            </div>

            <br/>
            <TextInput
                disable={loading}
                name={name}
                label={loading ? 'Loading....':label}
                placeholder="FYB-XXXXXX"
                maxLength={10}
                onChange={handleElemChange}
                getValue={getValue}
                error={{[name]: error}}
                required
                toUpperCase
            />
        </div>
    )
}