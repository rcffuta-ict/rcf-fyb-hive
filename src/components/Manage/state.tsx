import { Loader2, ShieldAlert, UserX } from "lucide-react";

export const ErrorState = ({ message }: { message: string }) => (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-error/10 text-error p-4 rounded-full">
                <ShieldAlert className="w-10 h-10" />
            </div>
        </div>
        <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
            Something Went Wrong
        </h2>
        <p className="text-pearl-600 dark:text-pearl-300 mb-6">{message}</p>
        <button
            onClick={() => window.location.reload()}
            className="btn btn-primary transform-romantic hover-lift"
        >
            Try Again
        </button>
    </div>
);

export const EmptyState = () => (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-champagne-gold/10 text-champagne-gold-600 dark:text-champagne-gold-400 p-4 rounded-full">
                <UserX className="w-10 h-10" />
            </div>
        </div>
        <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-4">
            No Profiles
        </h2>
        <p className="text-pearl-600 dark:text-pearl-300 mb-6">
            There are no dinner profiles yet.
        </p>
    </div>
);

export const SearchState = ({ count }: { count: number }) => (
    <div className="text-center py-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-champagne-gold/20 text-champagne-gold-700 dark:text-champagne-gold-300">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Searching... Found {count} results</span>
        </div>
    </div>
);
