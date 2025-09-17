"use client";

import { Renderable, Toaster, toast as hotToast } from "react-hot-toast";
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
import { slugify } from "@/lib/function";

interface Props {
    children: React.ReactNode;
}

export const GlobalToastProvider: React.FC<Props> = ({ children }) => {
    return (
        <>
            {children}
            <Toaster
                position="bottom-center"
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
    success: (message: string, id?: string) =>
        hotToast.success(message, { id: id || message }),
    error: (message: string, id?: string) =>
        hotToast.error(message, { id: id || message }),
    loading: (message: string, id?: string) =>
        hotToast.loading(message, { id: id || message }),
    dismiss: (id?: string) => hotToast.dismiss(id),

    // Theme-specific toasts with cleaner backgrounds
    romantic: (message: string, id?: string) =>
        hotToast(message, {
            icon: <Heart className="text-rose-500" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#EC4899",
                border: "1px solid rgba(236, 72, 153, 0.2)",
                boxShadow: "0 4px 20px rgba(236, 72, 153, 0.15)",
                backdropFilter: "blur(10px)",
            },
            id: id || slugify(message),
        }),

    celebration: (message: string, id?: string) =>
        hotToast(message, {
            icon: <Sparkles className="text-amber-500" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#F59E0B",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                boxShadow: "0 4px 20px rgba(245, 158, 11, 0.15)",
                backdropFilter: "blur(10px)",
            },
            id: id || slugify(message),
        }),

    dining: (message: string, id?: string) =>
        hotToast(message, {
            icon: <Utensils className="text-amber-600" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#D97706",
                border: "1px solid rgba(217, 119, 6, 0.2)",
                boxShadow: "0 4px 20px rgba(217, 119, 6, 0.15)",
                backdropFilter: "blur(10px)",
            },
            id: id || slugify(message),
        }),

    reservation: (message: string, id?: string) =>
        hotToast(message, {
            icon: <Wine className="text-purple-600" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#9333EA",
                border: "1px solid rgba(147, 51, 234, 0.2)",
                boxShadow: "0 4px 20px rgba(147, 51, 234, 0.15)",
                backdropFilter: "blur(10px)",
            },
            id: id || slugify(message),
        }),

    // New: Coming Soon / Not Implemented toasts
    comingSoon: (
        message: string = "This feature is coming soon!",
        id?: string
    ) =>
        hotToast(message, {
            icon: <Clock className="text-blue-500" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#3B82F6",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)",
                backdropFilter: "blur(10px)",
            },
            duration: 3000,
            id: id || slugify(message),
        }),

    notImplemented: (
        message: string = "This feature is not yet implemented",
        id?: string
    ) =>
        hotToast(message, {
            icon: <Construction className="text-gray-500" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#6B7280",
                border: "1px solid rgba(107, 114, 128, 0.2)",
                boxShadow: "0 4px 20px rgba(107, 114, 128, 0.15)",
                backdropFilter: "blur(10px)",
            },
            duration: 3000,
            id: id || slugify(message),
        }),

    // More elegant version
    inProgress: (
        message: string = "We're still working on this!",
        id?: string
    ) =>
        hotToast(message, {
            icon: <Coffee className="text-indigo-600" size={22} />,
            style: {
                background: "rgba(255, 255, 255, 0.95)",
                color: "#4F46E5",
                border: "1px solid rgba(79, 70, 229, 0.2)",
                boxShadow: "0 4px 20px rgba(79, 70, 229, 0.15)",
                backdropFilter: "blur(10px)",
            },
            duration: 3000,
            id: id || slugify(message),
        }),

    // Custom promise toast
    promise: (
        promise: Promise<any>,
        messages: { loading: string; success: string; error: string }
    ) => {
        return hotToast.promise(promise, messages);
    },

    // Additional elegant toast variants
    elegant: (
        message: string,
        icon: React.ReactNode = (
            <Sparkles className="text-golden-500" size={22} />
        ),
        id?: string
    ) =>
        hotToast(message, {
            icon: icon as Renderable,
            style: {
                background: "rgba(255, 255, 255, 0.98)",
                color: "#78350F",
                border: "1px solid rgba(250, 214, 165, 0.3)",
                boxShadow: "0 4px 25px rgba(250, 214, 165, 0.2)",
                backdropFilter: "blur(12px)",
            },
            id: id || slugify(message),
        }),

    // Minimal toast for subtle notifications
    minimal: (message: string, id?: string) =>
        hotToast(message, {
            style: {
                background: "rgba(255, 255, 255, 0.92)",
                color: "#374151",
                border: "1px solid rgba(209, 213, 219, 0.3)",
                boxShadow: "0 2px 15px rgba(0, 0, 0, 0.08)",
                backdropFilter: "blur(8px)",
                fontSize: "0.9rem",
            },
            duration: 2000,
            id: id || slugify(message),
        }),
};