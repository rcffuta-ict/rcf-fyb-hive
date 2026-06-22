"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

import { useRegistrationStore } from "@/store/registration.store";
import { cn } from "@/lib/utils";
import IdentifyStep from "./identify-step";
import ReviewStep from "./review-step";
import SuccessStep from "./success-step";

const STEPS = [
    { key: "identify", label: "Identify" },
    { key: "review", label: "Photo" },
    { key: "done", label: "Confirmed" },
] as const;

const RegistrationFlow = (): React.JSX.Element => {
    const step = useRegistrationStore((s) => s.step);
    const reset = useRegistrationStore((s) => s.reset);

    // Start every visit fresh so stale state never leaks between sessions.
    useEffect(() => {
        reset();
    }, [reset]);

    const activeIndex = STEPS.findIndex((s) => s.key === step);

    return (
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
            <div className="text-center">
                <span className="eyebrow mb-3">FYB Dinner</span>
                <h1 className="font-luxury text-foreground">Register</h1>
            </div>

            <ol className="mx-auto mt-8 flex max-w-md items-center justify-between">
                {STEPS.map((s, i) => {
                    const state =
                        i < activeIndex
                            ? "done"
                            : i === activeIndex
                              ? "active"
                              : "todo";
                    return (
                        <li
                            key={s.key}
                            className="flex flex-1 items-center last:flex-none"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span
                                    className={cn(
                                        "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                                        state === "active" &&
                                            "border-primary bg-primary text-primary-foreground shadow-gold-glow",
                                        state === "done" &&
                                            "border-primary/40 bg-accent text-primary",
                                        state === "todo" &&
                                            "border-border bg-card text-muted-foreground"
                                    )}
                                >
                                    {state === "done" ? (
                                        <Check size={16} />
                                    ) : (
                                        i + 1
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        "text-xs font-medium transition-colors",
                                        state === "todo"
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <span
                                    className={cn(
                                        "mx-2 h-px flex-1 transition-colors duration-300",
                                        i < activeIndex
                                            ? "bg-primary/50"
                                            : "bg-border"
                                    )}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>

            <div className="mt-10">
                {step === "identify" && <IdentifyStep />}
                {step === "preview" && <ReviewStep />}
                {step === "done" && <SuccessStep />}
            </div>
        </section>
    );
};

export default RegistrationFlow;
