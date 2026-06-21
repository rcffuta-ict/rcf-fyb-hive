"use client";

import { ShieldAlert, UserPlus } from "lucide-react";

export default function MustRegisterFirst() {
    return (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="bg-error/10 text-error p-4 rounded-full">
                    <ShieldAlert className="w-10 h-10" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
                Cannot Perform This Operation
            </h2>

            {/* Message */}
            <p className="text-pearl-600 dark:text-pearl-300 mb-6">
                You must{" "}
                <span className="font-semibold text-champagne-gold-600 dark:text-champagne-gold-400">
                    complete your own registration
                </span>{" "}
                before registering an associate.
            </p>

            {/* Action */}
            <a
                href="/register"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-champagne-gold to-rose-gold text-white font-semibold shadow-golden-glow transform-romantic hover-lift transition-all"
            >
                <UserPlus className="w-5 h-5" />
                <span>Register Yourself First</span>
            </a>
        </div>
    );
}
