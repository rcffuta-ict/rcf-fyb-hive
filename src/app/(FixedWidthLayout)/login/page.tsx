"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import { appToast } from "@/providers/ToastProvider";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// 1. Define Zod schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// 2. Type inferred from Zod
type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
    const [formMessage, setFormMessage] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isLoading, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setFormMessage({ type: null, message: "" });

        try {
            const {
                message,
                success,
                data: obj,
            } = await authStore.login(data.email);

            if (!success) {
                throw new Error(message || "Failed to send login link");
            }

            // Set success message in form component
            setFormMessage({
                type: "success",
                message: message || "Login link sent! Check your inbox.",
            });

            appToast.elegant("Login link sent! Check your inbox.");
            // reset();
        } catch (error: any) {
            const errorMessage =
                error.message ||
                authStore.error ||
                "Failed to send login link.";

            // Set error message in form component
            setFormMessage({
                type: "error",
                message: errorMessage,
            });

            appToast.error(errorMessage);
        }
    };

    const loading = isLoading || isSubmitting;

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
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

                    {/* Form Messages */}
                    {formMessage.type && (
                        <div
                            className={`mb-6 p-4 rounded-xl border ${
                                formMessage.type === "success"
                                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                {formMessage.type === "success" ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                )}
                                <p className="text-sm font-medium">
                                    {formMessage.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
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
                                {...register("email")}
                                className={`w-full px-4 py-3 border rounded-xl bg-pearl-700/50 text-pearl-100 placeholder:text-pearl-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/40 focus:border-champagne-gold transition-all duration-200 ${
                                    errors.email
                                        ? "border-red-500 focus:ring-red-400"
                                        : "border-pearl-600"
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-champagne-gold to-golden-600 hover:from-golden-600 hover:to-champagne-gold text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Sending link...
                                </>
                            ) : (
                                "Send Login Link"
                            )}
                        </button>
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

export default observer(LoginPage);
