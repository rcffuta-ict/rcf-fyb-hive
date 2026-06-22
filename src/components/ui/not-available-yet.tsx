import { Hourglass } from "lucide-react";

export default function NotAvailableYet() {
    return (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-6">
                <div className="bg-warning/10 text-warning p-4 rounded-full">
                    <Hourglass className="w-10 h-10 animate-pulse" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
                Feature Not Available Yet
            </h2>

            {/* Message */}
            <p className="text-pearl-600 dark:text-pearl-300 mb-6">
                This section is still under preparation.{" "}
                <span className="font-semibold text-champagne-gold-600 dark:text-champagne-gold-400">
                    Please check back soon
                </span>{" "}
                for updates.
            </p>

            {/* Action */}
            <button
                disabled
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-400 to-gray-500 text-white font-semibold shadow-md opacity-70 cursor-not-allowed"
            >
                <Hourglass className="w-5 h-5" />
                <span>Coming Soon</span>
            </button>
        </div>
    );
}
