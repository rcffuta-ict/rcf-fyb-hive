"use client";

import { ShieldAlert, Mail, Phone, UserX, Calendar, Users } from "lucide-react";

interface NotEligibleProps {
    coordinatorName?: string;
    coordinatorEmail?: string;
    coordinatorPhone?: string;
}

export default function NotEligible({
    coordinatorName = "500 Level Coordinator",
    coordinatorEmail,
    coordinatorPhone,
}: NotEligibleProps) {
    return (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-error/10 text-error p-4 rounded-full">
                    <ShieldAlert className="w-10 h-10" />
                </div>
            </div>

            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
                Not Eligible To Perform This Action
            </h2>

            <p className="text-pearl-600 dark:text-pearl-300 mb-6">
                You’re currently not eligible to perform this action. Please
                make sure you&apos;re logged in — you can check your login status by
                clicking the padlock icon in the header. <br />
                <br />
                If you believe this is an error, kindly contact the{" "}
                <span className="font-semibold text-champagne-gold-600 dark:text-champagne-gold-400">
                    {coordinatorName}
                </span>{" "}
                for assistance.
            </p>

            <div className="space-y-4">
                {coordinatorEmail && (
                    <a
                        href={`mailto:${coordinatorEmail}`}
                        className="flex items-center justify-center space-x-2 text-pearl-700 dark:text-pearl-200 hover:text-champagne-gold transition-colors"
                    >
                        <Mail className="w-4 h-4" />
                        <span>{coordinatorEmail}</span>
                    </a>
                )}

                {coordinatorPhone && (
                    <a
                        href={`tel:${coordinatorPhone}`}
                        className="flex items-center justify-center space-x-2 text-pearl-700 dark:text-pearl-200 hover:text-champagne-gold transition-colors"
                    >
                        <Phone className="w-4 h-4" />
                        <span>{coordinatorPhone}</span>
                    </a>
                )}
            </div>
        </div>
    );
}


interface NoDinnerProfileProps {
    coordinatorName?: string;
    coordinatorEmail?: string;
    coordinatorPhone?: string;
    eventDate?: string;
    registrationDeadline?: string;
}

export function NoDinnerProfile({
    coordinatorName = "500 Level Coordinator",
    coordinatorEmail = "",
    coordinatorPhone = "",
    eventDate = "September 26, 2025",
    registrationDeadline = "September 20, 2025",
}: NoDinnerProfileProps) {
    return (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-warning/10 text-warning p-4 rounded-full">
                    <UserX className="w-10 h-10" />
                </div>
            </div>

            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
                Dinner Profile Not Found
            </h2>

            <p className="text-pearl-600 dark:text-pearl-300 mb-6">
                You haven&apos;t created your dinner profile yet. To participate
                in the fellowship dinner and register a companion, you need to
                set up your dinner profile first.
            </p>

            <div className="bg-champagne-gold-50 dark:bg-champagne-gold-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 text-sm text-pearl-600 dark:text-pearl-300 mb-3">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Event: {eventDate}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Register by: {registrationDeadline}</span>
                    </div>
                </div>

                <p className="text-xs text-pearl-500 dark:text-pearl-400">
                    Complete your profile to secure your spot at the dinner
                </p>
            </div>

            <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-pearl-700 dark:text-pearl-200">
                    Next Steps:
                </h3>
                <ol className="text-sm text-pearl-600 dark:text-pearl-300 space-y-2 text-left">
                    <li className="flex items-start">
                        <span className="font-bold text-champagne-gold-600 mr-2">
                            1.
                        </span>
                        Complete your dinner profile registration
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold text-champagne-gold-600 mr-2">
                            2.
                        </span>
                        Find a companion for the dinner
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold text-champagne-gold-600 mr-2">
                            3.
                        </span>
                        Register your companion using their consent token
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold text-champagne-gold-600 mr-2">
                            4.
                        </span>
                        Complete the payment process
                    </li>
                </ol>
            </div>

            <div className="border-t border-pearl-200 dark:border-pearl-700 pt-6">
                <p className="text-pearl-500 dark:text-pearl-400 text-sm mb-4">
                    Need help? Contact the {coordinatorName}:
                </p>

                <div className="space-y-3">
                    {coordinatorEmail && (
                        <a
                            href={`mailto:${coordinatorEmail}`}
                            className="flex items-center justify-center space-x-2 text-pearl-700 dark:text-pearl-200 hover:text-champagne-gold transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            <span>{coordinatorEmail}</span>
                        </a>
                    )}

                    {coordinatorPhone && (
                        <a
                            href={`tel:${coordinatorPhone}`}
                            className="flex items-center justify-center space-x-2 text-pearl-700 dark:text-pearl-200 hover:text-champagne-gold transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            <span>{coordinatorPhone}</span>
                        </a>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-pearl-200 dark:border-pearl-700">
                <a href="/register" className="btn btn-primary w-full">
                    Create Dinner Profile
                </a>
            </div>
        </div>
    );
}


export function NoDinnerProfileSimple({
    coordinatorName = "500 Level Coordinator",
    coordinatorEmail = "",
    coordinatorPhone = "",
    eventDate = "September 26, 2025",
    registrationDeadline = "September 20, 2025",
}: NoDinnerProfileProps) {
    return (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-warning/10 text-warning p-4 rounded-full">
                    <UserX className="w-10 h-10" />
                </div>
            </div>

            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
                Dinner Profile Not Found
            </h2>

            <p className="text-pearl-600 dark:text-pearl-300 mb-6">
                You haven&apos;t created your dinner profile yet. To participate
                in the fellowship dinner and register a companion, you need to
                set up your dinner profile first.
            </p>

            {/* <div className="border-t border-pearl-200 dark:border-pearl-700 pt-6">
                <p className="text-pearl-500 dark:text-pearl-400 text-sm mb-4">
                    Need help? Contact the {coordinatorName}:
                </p>

                <div className="space-y-3">
                    {coordinatorEmail && (
                        <a
                            href={`mailto:${coordinatorEmail}`}
                            className="flex items-center justify-center space-x-2 text-pearl-700 dark:text-pearl-200 hover:text-champagne-gold transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            <span>{coordinatorEmail}</span>
                        </a>
                    )}

                    {coordinatorPhone && (
                        <a
                            href={`tel:${coordinatorPhone}`}
                            className="flex items-center justify-center space-x-2 text-pearl-700 dark:text-pearl-200 hover:text-champagne-gold transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            <span>{coordinatorPhone}</span>
                        </a>
                    )}
                </div>
            </div> */}
        </div>
    );
}