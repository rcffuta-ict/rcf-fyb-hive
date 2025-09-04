import { Loader2 } from "lucide-react";


export default function VerifyLoading() {
    return (
        <>
            <div className="flex justify-center mb-6">
                <Loader2 className="w-12 h-12 text-champagne-gold animate-spin" />
            </div>
            <h1 className="text-xl font-luxury text-pearl-100 mb-2">
                Verifying Login
            </h1>
            <p className="text-pearl-400">Please hold on a moment...</p>
        </>
    );
}