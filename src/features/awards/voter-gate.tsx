"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, ExternalLink, Loader2, Search } from "lucide-react";

import { identifyVoter } from "@/actions/awards.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { site } from "@/config/site";
import { voterIdentifySchema, type VoterIdentifyValues } from "./schema";
import type { VoterLookupStatus } from "@/types/awards.types";

/**
 * Claiming a ballot.
 *
 * Any member profile can vote — level is deliberately irrelevant, and the copy
 * says so, because "final year only" is the assumption everyone arrives with
 * after registration and pairing.
 */

const VoterGate = ({
    spotlightName = null,
}: {
    /** Set when they arrived from a campaign link — name the person they came for. */
    spotlightName?: string | null;
}): React.JSX.Element => {
    const [status, setStatus] = useState<VoterLookupStatus | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VoterIdentifyValues>({
        resolver: zodResolver(voterIdentifySchema),
        defaultValues: { identifier: "" },
    });

    const onSubmit = handleSubmit(async ({ identifier }) => {
        const result = await identifyVoter(identifier);
        setStatus(result.status);
        setMessage(result.message ?? null);

        // The ballot is rendered by the server off the cookie this just set, so
        // a refresh is what hands them the categories.
        if (result.status === "ok") window.location.reload();
    });

    const fieldError = errors.identifier?.message;

    return (
        <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
            <header className="text-center">
                <span className="eyebrow">The Honours</span>
                <h1 className="mt-2 font-luxury text-4xl text-foreground">
                    {spotlightName ? `Vote ${spotlightName}` : "Cast your vote"}
                </h1>
                <p className="mt-3 text-sm text-foreground/70">
                    {spotlightName
                        ? `Almost there — we just need to know who you are. Your ballot opens on ${spotlightName}'s category.`
                        : "Every RCF FUTA member votes — any level, whether or not you're coming to the dinner."}{" "}
                    Enter the email or phone number on your RCF profile.
                </p>
            </header>

            <form onSubmit={onSubmit} className="surface mt-8 space-y-4 p-7" noValidate>
                <div>
                    <div className="relative">
                        <Search
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            {...register("identifier")}
                            placeholder="you@email.com or 080..."
                            autoComplete="off"
                            className="pl-11"
                            aria-invalid={Boolean(fieldError)}
                        />
                    </div>
                    {fieldError && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive">
                            <AlertCircle size={14} /> {fieldError}
                        </p>
                    )}
                </div>

                <Button type="submit" size="lg" className="w-full sheen" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Checking…
                        </>
                    ) : (
                        <>
                            Start voting <ArrowRight size={18} />
                        </>
                    )}
                </Button>
            </form>

            {status === "not_member" && (
                <div className="surface mt-5 animate-scale-in p-6 text-center">
                    <p className="text-sm text-foreground/80">
                        We couldn&apos;t find a profile with that email or phone. Make sure your
                        details are up to date at{" "}
                        <span className="font-medium text-foreground">ict.rcffuta.com</span>.
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href={site.links.ict} target="_blank" rel="noopener noreferrer">
                            Update your profile <ExternalLink size={16} />
                        </Link>
                    </Button>
                </div>
            )}

            {(status === "error" || status === "closed") && message && (
                <div className="mt-5 flex items-center gap-2 rounded-token border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertCircle size={16} /> {message}
                </div>
            )}
        </section>
    );
};

export default VoterGate;
