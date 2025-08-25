"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/authStore";
import { appToast } from "@/providers/ToastProvider";

function VerifySSOPage() {

    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );

    useEffect(() => {
        async function verify() {
            // if (status === "loading") return; // Prevent multiple calls{

            console.debug("Starting SSO verification...");
            try {
                await authStore.verify();
                appToast.elegant("Login verified! Redirecting...",);
                setStatus("success");
                setTimeout(() => router.push("/"), 2500);
            } catch {
                setStatus("error");
                appToast.error(authStore.error || "SSO verification failed.");
            }
        }
        verify();

    }, [status, router]);

    console.debug("Auth Store State:", {
        isLoading: authStore.isLoading,
        isAuthenticated: authStore.isAuthenticated,
        member: authStore.member,
        error: authStore.error,
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-900 via-luxury-900 to-pearl-800 p-6">
            <div className="bg-pearl-800/40 backdrop-blur-md border border-pearl-700/50 rounded-2xl shadow-2xl p-10 max-w-md text-center">
                {status === "loading" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 border-4 border-champagne-gold border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h1 className="text-xl font-serif text-pearl-100 mb-2">
                            Verifying Login
                        </h1>
                        <p className="text-pearl-400">
                            Please wait while we verify your login...
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600/30 text-green-400 shadow-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-xl font-serif text-pearl-100 mb-2">
                            Login Verified!
                        </h1>
                        <p className="text-pearl-400">
                            Redirecting you to your dashboard...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600/30 text-red-400 shadow-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-xl font-serif text-pearl-100 mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-pearl-400 mb-4">
                            Something went wrong. Please try logging in again.
                        </p>
                        <a
                            href="/login"
                            className="inline-block bg-gradient-to-r from-champagne-gold to-golden-600 text-white font-medium py-2 px-6 rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                            Go Back to Login
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}


export default observer(VerifySSOPage);