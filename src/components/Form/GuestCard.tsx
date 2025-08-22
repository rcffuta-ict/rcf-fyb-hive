import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getGuestName, parseConsent } from "@/utils/process-details";
import { GuestModel, GuestObject } from "@/lib/nobox/record-structures/Guest";
import { findAssociate, findTicket } from "@/utils/guest-utils";
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
    updateGuest: (
        id: string,
        val: GuestObject | null,
        isAlter?: boolean
    ) => void;
    guest: GuestObject | null;
    id: string;
    alterId: string;
    isAltered?: boolean;
    didAltered?: boolean;
}

const MAX_CHARACTER = 10;

// Custom toast notification system (since we're replacing antd)
const showNotification = (
    message: string,
    type: "info" | "success" | "error" = "info"
) => {
    // You can implement your preferred notification system here
    console.log(`${type.toUpperCase()}: ${message}`);
    // For now, using browser notification - replace with your preferred toast library
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

    const getValue = (key: string) => {
        return props.isAltered ? "<<Associate>>" : consentToken;
    };

    const verifyGuest = async (guest: GuestObject, fn?: () => void) => {
        const val = await findTicket(guest.id);
        if (val) {
            console.log(`Taken:`, val);
            showNotification(`${getGuestName(guest)} is taken!`, "info");
            return null;
        }
        return guest;
    };

    useEffect(() => {
        if (consentToken.length === MAX_CHARACTER) {
            const currentRequest = consentToken;
            requestRef.current = currentRequest;
            setLoading(true);
            setError(null);
            setIsSuccess(false);

            const findData = async () => {
                const consent = parseConsent(consentToken);
                try {
                    const guest = await GuestModel.findOne({
                        consentId: consent,
                    });

                    if (guest) {
                        if (props.female && guest.gender === "male") {
                            setError(
                                "A consent token from a female is required here"
                            );
                        } else if (!props.female && guest.gender === "female") {
                            setError(
                                "A consent token from a male is required here"
                            );
                        } else {
                            const associate = await findAssociate(guest);

                            props.updateGuest(props.id, guest);
                            setIsSuccess(true);

                            if (associate) {
                                props.updateGuest(
                                    props.alterId,
                                    associate,
                                    true
                                );
                                setAssociateLoaded(true);
                            } else {
                                await verifyGuest(guest);
                            }
                        }
                    } else {
                        console.log(
                            "Ignored outdated request for input:",
                            currentRequest
                        );
                        props.updateGuest(props.id, null);
                        setError("Guest not found with this consent token");
                    }
                } catch (error) {
                    console.error("findOne error:", error);
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

            if (props.guest !== null) {
                props.updateGuest(props.id, null);

                if (props.didAltered) {
                    props.updateGuest(props.alterId, null);
                }
            }
            if (error !== null) {
                setError(null);
            }
        }
    };

    const name = props.female ? "consent-female" : "consent-male";
    const imagePlaceholder = props.female
        ? "/images/female.svg"
        : "/images/male.svg";
    const genderLabel = props.female ? "Female Guest" : "Male Guest";
    const genderIcon = props.female ? Heart : User;
    const GenderIcon = genderIcon;

    const label = props.guest
        ? getGuestName(props.guest, true)
        : "Enter Consent Token";
    const picture = props.guest ? props.guest.picture : imagePlaceholder;

    // Determine card state
    let cardState = "default";
    if (error) cardState = "error";
    if (loading) cardState = "loading";
    if (props.guest && isSuccess) cardState = "success";
    if (props.isAltered) cardState = "associate";

    return (
        <div
            className={`
            group relative animate-fade-in transition-all duration-600 ease-romantic
            ${cardState === "success" ? "animate-glow-pulse" : ""}
        `}
        >
            {/* Background Card */}
            <div
                className={`
                relative overflow-hidden rounded-3xl transition-all duration-500 ease-romantic p-6
                ${
                    cardState === "default"
                        ? "bg-glass-warm backdrop-blur-xl border-2 border-white/20 shadow-glass hover:shadow-elevated hover:scale-[1.02]"
                        : cardState === "loading"
                        ? "bg-glass-warm backdrop-blur-xl border-2 border-champagne-gold/50 shadow-golden-glow"
                        : cardState === "success"
                        ? "bg-gradient-to-br from-success-light/20 to-champagne-gold/10 border-2 border-success shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                        : cardState === "error"
                        ? "bg-gradient-to-br from-error-light/20 to-rose-gold/10 border-2 border-error shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                        : cardState === "associate"
                        ? "bg-gradient-to-br from-luxury-100/20 to-luxury-400/10 border-2 border-luxury-400 shadow-magic"
                        : ""
                }
            `}
            >
                {/* Shimmer Effect for Loading */}
                {loading && (
                    <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] opacity-20 animate-shimmer" />
                )}

                {/* Success Sparkles */}
                {cardState === "success" && (
                    <>
                        <div className="absolute top-4 right-4 text-success animate-twinkle">
                            <UserCheck size={20} />
                        </div>
                        <div className="absolute top-2 left-6 text-champagne-gold animate-sparkle text-xs">
                            ✨
                        </div>
                        <div className="absolute bottom-4 right-8 text-golden-400 animate-twinkle text-xs">
                            ⭐
                        </div>
                    </>
                )}

                {/* Associate Crown Icon */}
                {props.isAltered && (
                    <div className="absolute top-4 right-4 text-luxury-400 animate-trophy-shine">
                        <Crown size={20} />
                    </div>
                )}

                {/* Gender Label */}
                <div
                    className={`
                    flex items-center gap-2 mb-4 font-elegant text-sm font-medium
                    ${
                        cardState === "success"
                            ? "text-success"
                            : cardState === "error"
                            ? "text-error"
                            : "text-pearl-600 dark:text-pearl-300"
                    }
                `}
                >
                    <GenderIcon size={16} />
                    <span>
                        {props.isAltered ? "Associate Guest" : genderLabel}
                    </span>
                    {associateLoaded && (
                        <Users size={14} className="text-luxury-400" />
                    )}
                </div>

                {/* Avatar Section */}
                <div className="relative mb-6 flex justify-center">
                    <div
                        className={`
                        relative transition-all duration-400 ease-romantic
                        ${
                            cardState === "success"
                                ? "scale-110"
                                : cardState === "loading"
                                ? "animate-pulse-romantic"
                                : "group-hover:scale-105"
                        }
                    `}
                    >
                        {/* Avatar Glow Ring */}
                        <div
                            className={`
                            absolute inset-0 rounded-full transition-all duration-400
                            ${
                                cardState === "success"
                                    ? "bg-success/30 blur-xl animate-glow-pulse"
                                    : cardState === "error"
                                    ? "bg-error/30 blur-xl"
                                    : cardState === "loading"
                                    ? "bg-champagne-gold/30 blur-xl animate-pulse-romantic"
                                    : "bg-champagne-gold/20 blur-lg opacity-0 group-hover:opacity-100"
                            }
                        `}
                            style={{ margin: "-20px" }}
                        />

                        {/* Avatar Container */}
                        <div
                            className={`
                            relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-400
                            ${
                                cardState === "success"
                                    ? "border-success shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                    : cardState === "error"
                                    ? "border-error shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                                    : cardState === "loading"
                                    ? "border-champagne-gold shadow-golden-glow"
                                    : "border-pearl-300 dark:border-pearl-600 group-hover:border-champagne-gold"
                            }
                        `}
                        >
                            <Image
                                src={picture}
                                alt={
                                    props.guest
                                        ? `${getGuestName(props.guest)} profile`
                                        : "Guest placeholder"
                                }
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                                priority={!!props.guest}
                            />

                            {/* Loading Overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-luxury-900/60 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2
                                        className="text-champagne-gold animate-spin"
                                        size={24}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        {cardState === "success" && (
                            <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1.5 shadow-elevated animate-bounce-gentle">
                                <UserCheck size={14} />
                            </div>
                        )}

                        {cardState === "error" && (
                            <div className="absolute -bottom-1 -right-1 bg-error text-white rounded-full p-1.5 shadow-elevated">
                                <AlertCircle size={14} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Guest Information */}
                {props.guest && (
                    <div className="mb-4 text-center space-y-2">
                        <h3
                            className={`
                            font-elegant text-lg font-semibold transition-colors duration-300
                            ${
                                cardState === "success"
                                    ? "text-success"
                                    : "text-pearl-800 dark:text-pearl-100"
                            }
                        `}
                        >
                            {getGuestName(props.guest, true)}
                        </h3>

                        {props.guest.email && (
                            <p className="text-sm text-pearl-500 dark:text-pearl-400 font-modern">
                                {props.guest.email}
                            </p>
                        )}

                        {/* Guest Metadata */}
                        <div className="flex justify-center gap-4 text-xs text-pearl-400 font-medium">
                            <span className="capitalize">
                                {props.guest.gender}
                            </span>
                            {associateLoaded && (
                                <span className="text-luxury-400 flex items-center gap-1">
                                    <Users size={12} />
                                    +1
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Input Section */}
                <div className="space-y-1">
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

                    {/* Progress Indicator */}
                    {consentToken.length > 0 &&
                        consentToken.length < MAX_CHARACTER && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-pearl-200 dark:bg-pearl-700 rounded-full h-1 overflow-hidden">
                                    <div
                                        className="h-full bg-champagne-gold transition-all duration-300 ease-out"
                                        style={{
                                            width: `${
                                                (consentToken.length /
                                                    MAX_CHARACTER) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-pearl-400 font-medium">
                                    {consentToken.length}/{MAX_CHARACTER}
                                </span>
                            </div>
                        )}
                </div>

                {/* Status Message */}
                {cardState === "success" && !error && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-success text-sm font-medium animate-fade-in">
                        <UserCheck size={16} />
                        <span>Guest verified successfully!</span>
                    </div>
                )}

                {props.isAltered && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-luxury-400 text-sm font-medium">
                        <Crown size={16} />
                        <span>Associate Guest</span>
                    </div>
                )}
            </div>

            {/* Floating Particles for Success State */}
            {cardState === "success" && (
                <>
                    <div className="absolute top-0 left-4 text-champagne-gold animate-float opacity-60">
                        ✨
                    </div>
                    <div className="absolute top-8 right-2 text-success animate-drift opacity-60">
                        ⭐
                    </div>
                    <div className="absolute bottom-8 left-2 text-golden-400 animate-twinkle opacity-60">
                        💫
                    </div>
                </>
            )}
        </div>
    );
}
