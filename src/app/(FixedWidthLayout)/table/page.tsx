"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { date, z } from "zod";
import { User, Crown, AlertCircle, CheckCircle, Loader2, DollarSign, AlertTriangle } from "lucide-react";
import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import { appToast } from "@/providers/ToastProvider";
import NotEligible, { NoDinnerProfile } from "@/app/components/ui/NotEligible";
import { profileStore } from "@/stores/profileStore";
import { DinnerProfileRecord, getDinnerProfile } from "@rcffuta/ict-lib";

// Zod schema for consent token
const consentSchema = z.object({
    consentToken: z
        .string()
        .min(1, "Consent token is required")
        .regex(
            /^FYB-[A-Z0-9]{5}$/,
            "Token must follow pattern: FYB-XXXXX (e.g., FYB-OODNE)"
        ),
});

type ConsentFormData = z.infer<typeof consentSchema>;

// Helper components
const ProfileCard = observer(
    ({
        user,
        isPlaceholder = false,
        gender,
        isUser = false,
        status = "pending",
        error
    }: {
        user: DinnerProfileRecord;
        isPlaceholder?: boolean;
        gender: "male" | "female";
        isUser?: boolean;
        status?: "confirmed" | "pending";
        error?: boolean;
    }) => {
        const placeholderImage =
            gender === "male"
                ? "/api/placeholder/300/300?text=Male+Guest"
                : "/api/placeholder/300/300?text=Female+Guest";

        return (
            <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-6 text-center">
                <div className="relative mx-auto mb-4 w-40 h-40 rounded-lg overflow-hidden border-4 border-champagne-gold-300 shadow-golden-glow">
                    <img
                        src={
                            isPlaceholder
                                ? placeholderImage
                                : user?.picture || placeholderImage
                        }
                        alt={
                            isPlaceholder
                                ? "Guest"
                                : `${user?.firstname} ${user?.lastname}`
                        }
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="text-sm mb-3 px-3 py-1 rounded-full inline-flex items-center bg-rose-gold-100 text-rose-gold-700 ">
                    {isUser ? (
                        <>
                            <User className="w-4 h-4 mr-2" />
                            You
                        </>
                    ) : (
                        <>
                            <Crown className="w-4 h-4 mr-1" />
                            Your Date
                        </>
                    )}
                </div>

                <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-2">
                    {isPlaceholder
                        ? "Unknown"
                        : `${user?.firstname} ${user?.lastname}`}
                </h3>

                
                {error && (
                    <div className="text-sm mb-3 px-3 py-1 rounded-full inline-flex items-center bg-red-300 text-red-700">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Cannot Pair!!!
                    </div>
                )}
                {/* <p className="text-pearl-600 dark:text-pearl-300">
                {isPlaceholder
                    ? ""
                    : `${user?.level?.label || "Not Specified"} Level`}
            </p> */}

                {isUser && status === "pending" && (
                    <p className="text-red-600 font-semibold">
                        You&apos;re Single!!!
                    </p>
                )}
            </div>
        );
    }
);

const ConsentTokenForm = ({
    onSubmit,
    loading,
    token,
    status: stt,
}: {
    onSubmit: (data: ConsentFormData) => void;
    loading: boolean;
    token: string | undefined;
    status: string;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ConsentFormData>({
        resolver: zodResolver(consentSchema),
        defaultValues: {
            consentToken: token,
        },
    });


    const status = stt ?? "Verifying...";

    // const submitToken = (data: ConsentFormData) => {
    //     const {consentToken} = data;
    //     // Validate that the token match the pattern
    //     onSubmit(consentToken);
    // }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="mb-4">
                <label className="block text-sm font-medium text-pearl-700 dark:text-pearl-200 mb-2">
                    Consent Token <span className="text-rose-gold-500">*</span>
                </label>
                <input
                    {...register("consentToken")}
                    type="text"
                    placeholder="FYB-XXXXX"
                    className="input text-center uppercase bg-midnight-romance text-white font-semibold"
                    style={{ letterSpacing: "0.1em" }}
                />
                {errors.consentToken && (
                    <div className="flex items-center text-error text-sm mt-2">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        {errors.consentToken.message}
                    </div>
                )}
            </div>

            <button
                className="btn btn-intimate-glow w-full"
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{status}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirm Invitation</span>
                    </div>
                )}
            </button>
        </form>
    );
};

function DinnerInvitationPage() {
    const user = authStore.member;

    const dinnerProfile = profileStore.profile;
    const dateProfile = profileStore.dateProfile;

    const oppositeGender = dinnerProfile?.gender === "male" ? "female" : "male";
    const pairToken = profileStore.table?.pairToken;
    const status = profileStore.status;
    const paid = profileStore.table?.paid;


    const [loading, setLoading] = useState(false);
    const [showPaymentSection, setShowPaymentSection] = useState(false);
    const [error, setError] = useState(false);

    useEffect(()=>{
        function runThings() {
            if (!paid) {
                setShowPaymentSection(true);
                setTimeout(() => {
                    document.getElementById("payment-section")?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }, 100);
            }
        }


        runThings()
    }, [paid])
    

    const handleConsentSubmit = async (data: ConsentFormData) => {
        setLoading(true);
        try {
            // Simulate API call to validate consent token and create pair
            // await new Promise((resolve) => setTimeout(resolve, 1500));
            await profileStore.pairProfile(data.consentToken);

            // Generate a pair token (in real app, this would come from backend)
            // const generatedToken = `PR-${Math.random()
            //     .toString(36)
            //     .substr(2, 5)
            //     .toUpperCase()}`;
            // setPairToken(generatedToken);
            
            setShowPaymentSection(true);
            setError(false)

            // Scroll to payment section
            setTimeout(() => {
                document.getElementById("payment-section")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);

            appToast.romantic("Pair confirmed! Please complete payment.");
        } catch (error: any) {
            appToast.error(error.message || "Failed to validate token");
            setError(true)
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentConfirmation = async () => {
        setLoading(true);
        try {
            // Simulate payment confirmation
            // await new Promise((resolve) => setTimeout(resolve, 2000));
            appToast.romantic(
                "Okay. You'll here from us, till then just prepare for the event"
            );
            // setPairToken(null);
        } catch (error: any) {
            appToast.error(error.message || "Payment confirmation failed");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {

        if (authStore.isLoading) {

            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-champagne-gold mx-auto mb-4"></div>
                        <p className="text-pearl-600">
                            Loading user information...
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-20">
                <NotEligible />
            </div>
        );
    }


    if (!dinnerProfile) {
        return (
            <div className="mt-20">
                <NoDinnerProfile/>
            </div>
        )
    }

    console.debug({ dinnerProfile, dateProfile, paid, showPaymentSection });




    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="relative mb-8">
                        <div className="absolute left-1/4 top-0 w-12 h-12 bg-champagne-gold-300 rounded-full opacity-20 blur-lg animate-float"></div>
                        <div className="absolute right-1/4 bottom-0 w-12 h-12 bg-rose-gold-300 rounded-full opacity-20 blur-lg animate-float-slow"></div>

                        <h1 className="text-4xl md:text-5xl font-luxury font-bold text-gradient-gold mb-6 relative z-10">
                            <span className="block">Dinner Companion</span>
                            <span className="block">Registration</span>
                        </h1>
                    </div>

                    <div className="bg-glass-warm backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-3xl mx-auto">
                        <p className="text-xl font-elegant text-pearl-800 dark:text-pearl-100 mb-4 leading-relaxed">
                            Complete your dinner registration by pairing with a
                            companion and completing payment.
                        </p>

                        <div className="bg-rose-gold-100/30 border border-rose-gold-200/50 rounded-xl p-4">
                            <p className="text-pearl-700 dark:text-pearl-200 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 inline-block mr-2 text-rose-gold-500" />
                                <span className="font-semibold">
                                    Important:
                                </span>{" "}
                                Both pairing and payment are required for
                                attendance.
                            </p>
                            {!pairToken && (
                                <>
                                    <br />
                                    <p className="text-sm font-semibold text-red-900">
                                        <AlertTriangle className="w-5 h-5 inline-block mr-2" />
                                        <span className="font-semibold">
                                            Currently:
                                        </span>{" "}
                                        You&apos;re single!!
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-8 flex items-center justify-center space-x-8">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    user
                                        ? "bg-success text-white"
                                        : "bg-pearl-200 text-pearl-400"
                                }`}
                            >
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span className="text-sm mt-2 text-pearl-600">
                                You
                            </span>
                        </div>

                        <div className="flex-1 h-1 bg-pearl-200 relative">
                            <div
                                className={`absolute top-0 left-0 h-full bg-champagne-gold transition-all duration-1000 ${
                                    pairToken ? "w-full" : "w-0"
                                }`}
                            ></div>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            title={!pairToken ? "You're single" : undefined}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    pairToken
                                        ? "bg-success text-white"
                                        : "bg-warning text-white"
                                }`}
                            >
                                {pairToken ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <User className="w-6 h-6" />
                                )}
                            </div>
                            <span className="text-sm mt-2 text-pearl-600">
                                Pair
                            </span>
                        </div>

                        <div className="flex-1 h-1 bg-pearl-200 relative">
                            <div
                                className={`absolute top-0 left-0 h-full bg-champagne-gold transition-all duration-1000 ${
                                    showPaymentSection ? "w-full" : "w-0"
                                }`}
                            ></div>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            title={!pairToken ? "You're single" : undefined}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    showPaymentSection
                                        ? "bg-warning text-white"
                                        : "bg-pearl-200 text-pearl-400"
                                }`}
                            >
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="text-sm mt-2 text-pearl-600">
                                Payment
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    <div className="flex flex-col">
                        <ProfileCard
                            user={dinnerProfile}
                            gender={dinnerProfile.gender}
                            isUser
                            status={pairToken ? "confirmed" : "pending"}
                        />
                    </div>

                    <div className="flex flex-col">
                        <ProfileCard
                            user={dateProfile || ({} as any)}
                            isPlaceholder={!dateProfile} // This should be true when no dateProfile
                            gender={oppositeGender}
                            key={dateProfile?.id || "placeholder"} // Use dateProfile id or fallback
                            error={error}
                        />
                        {!pairToken && (
                            <ConsentTokenForm
                                onSubmit={handleConsentSubmit}
                                loading={loading}
                                token={profileStore.dateProfile?.consentToken}
                                status={status}
                            />
                        )}
                        {pairToken && (
                            <div className="mt-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200">
                                <div className="flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-success mr-2" />
                                    <span className="text-success-700 dark:text-success-300">
                                        Pair confirmed! Proceed to payment.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Section */}
                {showPaymentSection && pairToken && (
                    <div id="payment-section" className="scroll-mt-20">
                        <div className="card p-8 max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-luxury font-bold text-gradient-gold mb-4">
                                    Complete Your Registration
                                </h2>
                                <p className="text-pearl-600 dark:text-pearl-300">
                                    Final step: Make payment to secure your
                                    spots
                                </p>
                            </div>

                            {/* Pair Token */}
                            <div className="bg-champagne-gold-50 dark:bg-champagne-gold-900/20 rounded-xl p-6 mb-8 text-center">
                                <p className="text-sm text-pearl-500 mb-2">
                                    Your Pair Reference
                                </p>
                                <div className="bg-white dark:bg-pearl-800 px-6 py-3 rounded-lg border-2 border-dashed border-champagne-gold-300">
                                    <code className="text-2xl font-mono font-bold text-champagne-gold-600">
                                        {pairToken}
                                    </code>
                                </div>
                                <p className="text-xs text-pearl-400 mt-3">
                                    Include this token in your payment
                                    description
                                </p>
                            </div>

                            {/* Payment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-pearl-50 dark:bg-pearl-800/30 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-pearl-800 dark:text-pearl-100 mb-4">
                                        Payment Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-pearl-500">
                                                Amount
                                            </p>
                                            <p className="text-3xl font-bold text-champagne-gold-300">
                                                ₦6,000
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-pearl-500">
                                                Bank
                                            </p>
                                            <p className="font-semibold">
                                                Kuda MFB
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-pearl-500">
                                                Account Number
                                            </p>
                                            <p className="text-lg font-mono font-semibold">
                                                2076013421
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-pearl-500">
                                                Account Name
                                            </p>
                                            <p className="font-semibold">
                                                Amusan Elizabeth Oluwatoyin
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-warning-700 dark:text-warning-300 mb-4">
                                        Payment Instructions
                                    </h4>
                                    <ol className="space-y-3 text-sm text-warning-600 dark:text-warning-400">
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">
                                                1.
                                            </span>
                                            Transfer ₦6,000 to the account
                                            details provided
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">
                                                2.
                                            </span>
                                            Include your pair token <strong>{pairToken}</strong> in the
                                            payment description
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">
                                                3.
                                            </span>
                                            Click confirm after payment
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">
                                                4.
                                            </span>
                                            Wait for payment verification
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            {/* Payment Confirmation */}
                            <div className="text-center">
                                <button
                                    onClick={handlePaymentConfirmation}
                                    disabled={loading}
                                    className="btn btn-primary btn-lg px-12"
                                >
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Confirming Payment...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>I&apos;ve Made Payment</span>
                                        </div>
                                    )}
                                </button>

                                <p className="text-sm text-pearl-400 mt-4">
                                    Payment verification will take it up from there, we&apos;ll let you know when we&apos;ve confirmed
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* How it Works */}
                <div className="mt-16 text-center">
                    <div className="card p-6 max-w-2xl mx-auto">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6">
                            How It Works
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-champagne-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-6 h-6 text-champagne-gold-600" />
                                </div>
                                <h4 className="font-semibold mb-2">
                                    1. Find Partner
                                </h4>
                                <p className="text-sm text-pearl-500">
                                    Get consent token from your dinner companion
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-champagne-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="w-6 h-6 text-champagne-gold-600" />
                                </div>
                                <h4 className="font-semibold mb-2">
                                    2. Pay ₦6,000
                                </h4>
                                <p className="text-sm text-pearl-500">
                                    Transfer ₦6,000 with your pair token
                                    included
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-champagne-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-champagne-gold-600" />
                                </div>
                                <h4 className="font-semibold mb-2">
                                    3. Confirmation
                                </h4>
                                <p className="text-sm text-pearl-500">
                                    Automatic verification secures your spots
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default observer(DinnerInvitationPage);
