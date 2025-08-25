"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/authStore";
import { appToast } from "@/providers/ToastProvider";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifySSOPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );

    useEffect(() => {
        async function verify() {
            console.debug("Starting SSO verification...");
            try {
                await authStore.verify();
                appToast.elegant("Login verified! Redirecting...");
                setStatus("success");
                setTimeout(() => router.push("/"), 2000);
            } catch {
                setStatus("error");
                appToast.error(authStore.error || "SSO verification failed.");
            }
        }
        verify();
    }, [router]);

    const renderContent = () => {
        switch (status) {
            case "loading":
                return (
                    <>
                        <div className="flex justify-center mb-6">
                            <Loader2 className="w-12 h-12 text-champagne-gold animate-spin" />
                        </div>
                        <h1 className="text-xl font-luxury text-pearl-100 mb-2">
                            Verifying Login
                        </h1>
                        <p className="text-pearl-400">
                            Please hold on a moment...
                        </p>
                    </>
                );
            case "success":
                return (
                    <>
                        <div className="flex justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </div>
                        <h1 className="text-xl font-luxury text-pearl-100 mb-2">
                            Login Verified!
                        </h1>
                        <p className="text-pearl-400">
                            Redirecting you shortly...
                        </p>
                    </>
                );
            case "error":
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
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-900 via-luxury-900 to-pearl-800 p-6">
            <div className="bg-pearl-800/40 backdrop-blur-md border border-pearl-700/50 rounded-2xl shadow-2xl p-10 max-w-md text-center animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
}

export default observer(VerifySSOPage);
