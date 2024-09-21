import Image from "next/image";
import TextInput from "./TextInput";
import { useEffect, useRef, useState } from "react";
import { getGuestName, parseConsent } from "@/utils/process-details";
import { GuestModel, GuestObject } from "@/lib/nobox/record-structures/Guest";

interface GuestCardProps {
    female?:boolean;
    updateGuest:(id:string, val: GuestObject | null, isAlter?: boolean) => void;
    guest: GuestObject | null;
    id: string;
    alterId: string;
    isAltered?: boolean;
}


async function findAssociate(guest: GuestObject) {
    // console.log(associateId)
    const otherAssociate = await GuestModel.search({
        searchableFields: ['associateId'],
        searchText: (guest.consentId as string)
    }) as unknown as GuestObject[];

    let associate:GuestObject | null = null;

    if (otherAssociate.length > 0) {
        // messageApi.destroy('loader-1');
        // messageApi.error('There is an issue with your info');
        associate = otherAssociate.filter((each)=>each.email !== guest.email)[0] || null;

        return associate;
    }

    return null;
}

const MAX_CHARACTER = 10;

export default function GuestCard(props: GuestCardProps) {
    const [consentToken, setConsentToken] = useState<string>('');
    // const [guest, setGuest] = useState<GuestObject | null >(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const requestRef = useRef<string | null>(null); // Tracks the latest request's input value


    const getValue = (key:string) => {
        return props.isAltered ? '<<Associate>>' : consentToken;
    }


    useEffect(() => {
        // Only proceed if inputValue is exactly MAX_CHARACTER characters
        if (consentToken.length === MAX_CHARACTER) {
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

                        if (props.female && guest.gender === 'male') {
                            setError('A consent token from a female is required here')
                        }
                        else if (!props.female && guest.gender === 'female') {
                            setError('A consent token from a male is required here')
                        } else {
                            const associate = await findAssociate(guest);

                            props.updateGuest(props.id, guest)
                            console.log("Associate", associate);
                            
                            if (associate) {
                                props.updateGuest(props.alterId, associate, true)
                            }
                        }
                    } else {
                        console.log('Ignored outdated request for input:', currentRequest);                        
                        props.updateGuest(props.id, null)
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

        // Clear the request if input becomes less than MAX_CHARACTER characters
        if (val.length < MAX_CHARACTER) {
            requestRef.current = null;
            // setGuest(()=>null)

            if (props.guest !== null) {

                props.updateGuest(props.id, null)
            }
            if (error !== null) {

                setError(null)
            }
        }
    }


    const name = props.female ? 'consent-female' : 'consent-male'
    const imagePlaceholder = props.female ? '/images/female.svg':'/images/male.svg';

    const label = props.guest ? getGuestName(props.guest, true): 'Enter consent Token';
    const picture = props.guest ? props.guest.picture : imagePlaceholder;


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
                maxLength={MAX_CHARACTER}
                onChange={handleElemChange}
                getValue={getValue}
                error={{[name]: props.isAltered ? null : error}}
                required
                toUpperCase
            />
        </div>
    )
}