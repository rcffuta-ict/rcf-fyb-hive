"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setMessage({
                text: "Login link sent to your email! Please check your inbox.",
                type: "success",
            });
            setEmail("");
        } catch (error) {
            setMessage({
                text: "Failed to send login link. Please try again.",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-900 via-luxury-900 to-pearl-800 p-6">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-pearl-800/40 backdrop-blur-md border border-pearl-700/50 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-champagne-gold to-golden-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-serif text-pearl-100 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-pearl-400 text-sm">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-pearl-300 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-pearl-600 rounded-xl bg-pearl-700/50 text-pearl-100 placeholder:text-pearl-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/40 focus:border-champagne-gold transition-all duration-200"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-champagne-gold to-golden-600 hover:from-golden-600 hover:to-champagne-gold text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Sending link...
                                </>
                            ) : (
                                "Send Login Link"
                            )}
                        </button>

                        {message.text && (
                            <div
                                className={`rounded-lg p-3 text-sm ${
                                    message.type === "success"
                                        ? "bg-green-900/30 text-green-300 border border-green-700/50"
                                        : "bg-red-900/30 text-red-300 border border-red-700/50"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}
                    </form>

                    {/* Divider */}
                    <div className="my-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-pearl-600 to-transparent"></div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-pearl-400 text-sm mb-4">
                            Don&apos;t have an account?
                        </p>
                        <Link
                            href="https://ict.rcffuta.com/portal/register"
                            target="_blank"
                            className="inline-flex items-center justify-center w-full border border-pearl-600 text-pearl-200 hover:bg-pearl-700/50 hover:border-pearl-500 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                        >
                            Visit ICT portal
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2 h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-pearl-500 text-xs">
                        By continuing, you agree to our{" "}
                        <a
                            href="#"
                            className="text-champagne-gold hover:text-golden-400 hover:underline"
                        >
                            Terms
                        </a>{" "}
                        and{" "}
                        <a
                            href="#"
                            className="text-champagne-gold hover:text-golden-400 hover:underline"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
