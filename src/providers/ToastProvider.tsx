"use client";

import { Toaster, toast as hotToast } from "react-hot-toast";
import React from "react";

interface Props {
    children: React.ReactNode;
}

export const GlobalToastProvider: React.FC<Props> = ({ children }) => {
    return (
        <>
            {children}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    // Default style
                    style: {
                        background: "rgba(30, 30, 30, 0.95)", // darker, semi-transparent
                        color: "#FDF6E3",
                        borderRadius: "1.25rem",
                        padding: "1rem 1.5rem",
                        boxShadow: "0 8px 30px rgba(255, 215, 0, 0.5)",
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                    },
                    success: {
                        style: {
                            background: "rgba(16, 185, 129, 0.2)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.5)",
                            boxShadow: "0 0 25px rgba(16, 185, 129, 0.7)",
                        },
                    },
                    error: {
                        style: {
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#EF4444",
                            border: "1px solid rgba(239, 68, 68, 0.5)",
                            boxShadow: "0 0 25px rgba(239, 68, 68, 0.7)",
                        },
                    },
                    loading: {
                        style: {
                            background: "rgba(250, 214, 165, 0.2)",
                            color: "#B8860B",
                            border: "1px solid rgba(186, 134, 11, 0.5)",
                            boxShadow: "0 0 25px rgba(250, 214, 165, 0.7)",
                        },
                    },
                    duration: 4000,
                    // errorDuration: 5000,
                    // loadingDuration: 3000,
                }}
            />
        </>
    );
};

// helper to call toast anywhere
export const toast = hotToast;
