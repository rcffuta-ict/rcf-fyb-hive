"use client";
import { Loader2, XCircle } from "lucide-react";


export default function VerifyError() {
    return (
        <>
            <div className="flex justify-center mb-6">
                <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-xl font-luxury text-pearl-100 mb-2">
                Verification Failed
            </h1>
            <p className="text-pearl-400 mb-4">
                Something went wrong. Please try again.
            </p>
            <a
                href="/login"
                className="inline-block bg-gradient-to-r from-champagne-gold to-golden-600 text-white font-medium py-2 px-6 rounded-xl hover:shadow-lg transition-all duration-200"
            >
                Back to Login
            </a>
        </>
    );
}