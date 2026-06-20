"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/authStore";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function VerifySSOPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let hasRun = false;

        // Immediately invoked async function inside useEffect
        (async () => {
            if (hasRun) return;
            hasRun = true;

            try {
                await authStore.verify();
                setStatus("success");

                // Redirect after short delay
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } catch (err: any) {
                setError(err.message || "SSO verification failed.");
                setStatus("error");
            }
        })();

        // Cleanup function just in case
        return () => {
            hasRun = true;
        };
    }, [router]);


    if (status === "error") {
        return <VerifyError error={error} />;
    }

    if (status === "success") {
        return (
            <>
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <h1 className="text-xl font-luxury text-pearl-100 mb-2">
                    Login Verified!
                </h1>
                <p className="text-pearl-400">Redirecting you shortly...</p>
            </>
        );
    }

    return <VerifyLoading/>
}

export default VerifySSOPage;

function VerifyError({ error }: { error: string | null }) {
    return (
        <>
            <div className="flex justify-center mb-6">
                <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-xl font-luxury text-pearl-100 mb-2">
                Verification Failed
            </h1>
            <p className="text-pearl-400 mb-4">
                {error || "Something went wrong. Please try again."}
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


function VerifyLoading() {
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