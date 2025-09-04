"use client";

import { ShieldAlert, Mail, Phone } from "lucide-react";

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
