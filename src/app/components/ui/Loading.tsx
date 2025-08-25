"use client";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="max-w-md mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center animate-fade-in">
            {/* Spinner */}
            <div className="flex justify-center mb-6">
                <div className="bg-champagne-gold/10 text-champagne-gold-600 dark:text-champagne-gold-400 p-4 rounded-full animate-spin-slow">
                    <Loader2 className="w-10 h-10 animate-spin" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-3">
                Please Hold On
            </h2>

            {/* Message */}
            <p className="text-pearl-600 dark:text-pearl-300">
                We’re processing something.
                <span className="block font-semibold text-champagne-gold-600 dark:text-champagne-gold-400 mt-1">
                    This won’t take long ✨
                </span>
            </p>
        </div>
    );
}
