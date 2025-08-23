/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "./TextInput";
import {
    User,
    UserCheck,
    AlertCircle,
    Loader2,
    Crown,
    Heart,
    Users,
} from "lucide-react";

interface GuestCardProps {
    female?: boolean;
    updateGuest: (id: string, guest: any | null, isAlter?: boolean) => void;
    guest: any | null;
    id: string;
    alterId: string;
    isAltered?: boolean;
    didAltered?: boolean;
}

const MAX_CHARACTER = 10;

const showNotification = (
    message: string,
    type: "info" | "success" | "error" = "info"
) => {
    console.log(`${type.toUpperCase()}: ${message}`);
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(message);
    }
};

export default function GuestCard(props: GuestCardProps) {
    const [consentToken, setConsentToken] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [associateLoaded, setAssociateLoaded] = useState(false);
    const requestRef = useRef<string | null>(null);

    const getValue = () => (props.isAltered ? "<<Associate>>" : consentToken);

    // Simulated async verification (replace with your API call)
    const verifyGuest = async (token: string) => {
        return new Promise<{ name: string; gender: string } | null>(
            (resolve) => {
                setTimeout(() => {
                    if (token === "VALIDTOKEN") {
                        resolve({
                            name: "John Doe",
                            gender: props.female ? "male" : "female",
                        });
                    } else {
                        resolve(null);
                    }
                }, 1000);
            }
        );
    };

    useEffect(() => {
        if (consentToken.length === MAX_CHARACTER) {
            const currentRequest = consentToken;
            requestRef.current = currentRequest;
            setLoading(true);
            setError(null);
            setIsSuccess(false);

            const findData = async () => {
                try {
                    const guest = await verifyGuest(consentToken);

                    if (guest) {
                        if (props.female && guest.gender === "male") {
                            setError("A female consent token is required");
                        } else if (!props.female && guest.gender === "female") {
                            setError("A male consent token is required");
                        } else {
                            props.updateGuest(props.id, guest);
                            setIsSuccess(true);
                            setAssociateLoaded(true);
                        }
                    } else {
                        if (requestRef.current === currentRequest) {
                            setError("Guest not found with this consent token");
                            props.updateGuest(props.id, null);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    if (requestRef.current === currentRequest) {
                        setError("Could not load guest details");
                    }
                } finally {
                    if (requestRef.current === currentRequest) {
                        setLoading(false);
                    }
                }
            };

            findData();
        }
    }, [consentToken, props]);

    const handleElemChange = (key: string, val: any) => {
        setConsentToken(val);
        if (val.length < MAX_CHARACTER) {
            requestRef.current = null;
            setIsSuccess(false);
            setAssociateLoaded(false);
            props.updateGuest(props.id, null);
            if (props.didAltered) props.updateGuest(props.alterId, null);
            setError(null);
        }
    };

    const name = props.female ? "consent-female" : "consent-male";
    const imagePlaceholder = props.female
        ? "/images/female.svg"
        : "/images/male.svg";
    const genderLabel = props.female ? "Female Guest" : "Male Guest";
    const GenderIcon = props.female ? Heart : User;

    const label = props.guest ? props.guest.name : "Enter Consent Token";
    const picture = props.guest ? props.guest.picture : imagePlaceholder;

    let cardState = "default";
    if (error) cardState = "error";
    if (loading) cardState = "loading";
    if (props.guest && isSuccess) cardState = "success";
    if (props.isAltered) cardState = "associate";

    return (
        <div
            className={`group relative transition-all duration-600 ${
                cardState === "success" ? "animate-glow-pulse" : ""
            }`}
        >
            <div
                className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ${
                    cardState === "success" ? "bg-green-200" : ""
                }`}
            >
                {loading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse opacity-30" />
                )}
                <div className="flex items-center gap-2 mb-4">
                    <GenderIcon size={16} />
                    <span>
                        {props.isAltered ? "Associate Guest" : genderLabel}
                    </span>
                    {associateLoaded && <Users size={14} />}
                </div>

                <div className="relative mb-6 flex justify-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4">
                        <Image
                            src={picture}
                            alt="Guest avatar"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Loader2 className="animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {props.guest && (
                    <div className="mb-4 text-center space-y-2">
                        <h3>{props.guest.name}</h3>
                        {props.guest.email && <p>{props.guest.email}</p>}
                    </div>
                )}

                <TextInput
                    disable={loading || props.isAltered}
                    name={name}
                    label={loading ? "Verifying guest..." : label}
                    placeholder="FYB-XXXXXX"
                    maxLength={MAX_CHARACTER}
                    onChange={handleElemChange}
                    getValue={getValue}
                    error={{ [name]: props.isAltered ? null : error }}
                    required
                    toUpperCase
                />
            </div>
        </div>
    );
}
