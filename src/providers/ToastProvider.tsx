"use client";

import { Toaster, toast as hotToast } from "react-hot-toast";
import React from "react";
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Sparkles,
    Heart,
    Utensils,
    Wine,
    Clock,
    Construction,
    Coffee,
} from "lucide-react";

interface Props {
    children: React.ReactNode;
}

export const GlobalToastProvider: React.FC<Props> = ({ children }) => {
    return (
        <>
            {children}
            <Toaster
                position="bottom-left"
                toastOptions={{
                    // Default style
                    style: {
                        background: "rgba(30, 30, 30, 0.95)",
                        color: "#FDF6E3",
                        borderRadius: "1.25rem",
                        padding: "1rem 1.5rem",
                        boxShadow: "0 8px 30px rgba(255, 215, 0, 0.5)",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        fontSize: "1rem",
                        border: "1px solid rgba(255, 215, 0, 0.2)",
                        backdropFilter: "blur(12px)",
                        maxWidth: "400px",
                    },
                    success: {
                        icon: (
                            <CheckCircle
                                className="text-champagne-gold-400"
                                size={24}
                            />
                        ),
                        style: {
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                        },
                    },
                    error: {
                        icon: (
                            <XCircle className="text-rose-gold-400" size={24} />
                        ),
                        style: {
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#EF4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
                        },
                    },
                    loading: {
                        icon: (
                            <Loader2
                                className="text-champagne-gold-400 animate-spin"
                                size={24}
                            />
                        ),
                        style: {
                            background: "rgba(250, 214, 165, 0.15)",
                            color: "#B8860B",
                            border: "1px solid rgba(186, 134, 11, 0.3)",
                            boxShadow: "0 0 25px rgba(250, 214, 165, 0.4)",
                        },
                    },
                    duration: 4000,
                }}
            />
        </>
    );
};

// Custom toast functions with elegant icons
export const appToast = {
    // Basic toasts
    success: (message: string) => hotToast.success(message),
    error: (message: string) => hotToast.error(message),
    loading: (message: string) => hotToast.loading(message),
    dismiss: (id?: string) => hotToast.dismiss(id),

    // Theme-specific toasts
    romantic: (message: string) =>
        hotToast(message, {
            icon: <Heart className="text-rose-gold-400" size={24} />,
            style: {
                background: "rgba(255, 105, 180, 0.15)",
                color: "#FF69B4",
                border: "1px solid rgba(255, 105, 180, 0.3)",
                boxShadow: "0 0 25px rgba(255, 105, 180, 0.4)",
            },
        }),

    celebration: (message: string) =>
        hotToast(message, {
            icon: <Sparkles className="text-champagne-gold-400" size={24} />,
            style: {
                background: "rgba(255, 215, 0, 0.15)",
                color: "#FFD700",
                border: "1px solid rgba(255, 215, 0, 0.3)",
                boxShadow: "0 0 25px rgba(255, 215, 0, 0.4)",
            },
        }),

    dining: (message: string) =>
        hotToast(message, {
            icon: <Utensils className="text-champagne-gold-400" size={24} />,
            style: {
                background: "rgba(218, 165, 32, 0.15)",
                color: "#DAA520",
                border: "1px solid rgba(218, 165, 32, 0.3)",
                boxShadow: "0 0 25px rgba(218, 165, 32, 0.4)",
            },
        }),

    reservation: (message: string) =>
        hotToast(message, {
            icon: <Wine className="text-luxury-400" size={24} />,
            style: {
                background: "rgba(147, 51, 234, 0.15)",
                color: "#9333EA",
                border: "1px solid rgba(147, 51, 234, 0.3)",
                boxShadow: "0 0 25px rgba(147, 51, 234, 0.4)",
            },
        }),

    // New: Coming Soon / Not Implemented toasts
    comingSoon: (message: string = "This feature is coming soon!") =>
        hotToast(message, {
            icon: <Clock className="text-champagne-gold-400" size={24} />,
            style: {
                background: "rgba(250, 214, 165, 0.15)",
                color: "#B8860B",
                border: "1px solid rgba(186, 134, 11, 0.3)",
                boxShadow: "0 0 25px rgba(250, 214, 165, 0.4)",
            },
            duration: 3000,
        }),

    notImplemented: (message: string = "This feature is not yet implemented") =>
        hotToast(message, {
            icon: <Construction className="text-pearl-400" size={24} />,
            style: {
                background: "rgba(158, 158, 158, 0.15)",
                color: "#9E9E9E",
                border: "1px solid rgba(158, 158, 158, 0.3)",
                boxShadow: "0 0 25px rgba(158, 158, 158, 0.4)",
            },
            duration: 3000,
        }),

    // Optional: More playful version
    inProgress: (message: string = "We're still working on this!") =>
        hotToast(message, {
            icon: <Coffee className="text-luxury-400" size={24} />,
            style: {
                background: "rgba(147, 51, 234, 0.15)",
                color: "#9333EA",
                border: "1px solid rgba(147, 51, 234, 0.3)",
                boxShadow: "0 0 25px rgba(147, 51, 234, 0.4)",
            },
            duration: 3000,
        }),

    // Custom promise toast
    promise: (
        promise: Promise<any>,
        messages: { loading: string; success: string; error: string }
    ) => {
        return hotToast.promise(promise, messages);
    },
};
