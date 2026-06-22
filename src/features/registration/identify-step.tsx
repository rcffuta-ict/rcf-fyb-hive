"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotEligible from "@/components/ui/not-eligible";
import { useRegistrationStore } from "@/store/registration.store";
import { site } from "@/config/site";
import { identifySchema, type IdentifyValues } from "./schema";

const IdentifyStep = (): React.JSX.Element => {
    const looking = useRegistrationStore((s) => s.looking);
    const status = useRegistrationStore((s) => s.lookupStatus);
    const member = useRegistrationStore((s) => s.member);
    const error = useRegistrationStore((s) => s.error);
    const lookup = useRegistrationStore((s) => s.lookup);
    const setIdentifier = useRegistrationStore((s) => s.setIdentifier);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IdentifyValues>({
        resolver: zodResolver(identifySchema),
        defaultValues: { identifier: "" },
    });

    const onSubmit = handleSubmit(async ({ identifier }) => {
        setIdentifier(identifier);
        await lookup(identifier);
    });

    const fieldError = errors.identifier?.message;

    return (
        <div className="mx-auto max-w-md animate-fade-in">
            <div className="surface p-7 sm:p-8">
                <h2 className="font-luxury text-2xl text-foreground">Find your profile</h2>
                <p className="mt-2 text-sm text-foreground/70">
                    Registration is tied to your RCF FUTA membership. Enter the email or phone
                    number on your profile.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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

                    <Button type="submit" size="lg" className="w-full sheen" disabled={looking}>
                        {looking ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Checking…
                            </>
                        ) : (
                            <>
                                Continue <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {status === "not_finalist" && (
                <div className="mt-5">
                    <NotEligible level={member?.level} />
                </div>
            )}

            {status === "not_member" && (
                <div className="surface mt-5 animate-scale-in p-6 text-center">
                    <p className="text-sm text-foreground/80">
                        We couldn&apos;t find a profile with that email or phone. Make sure your
                        details are up to date at{" "}
                        <span className="font-medium text-foreground">ict.rcffuta.com</span>, or
                        reach out to your level coordinator for help.
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href={site.links.ict} target="_blank" rel="noopener noreferrer">
                            Update your profile <ExternalLink size={16} />
                        </Link>
                    </Button>
                </div>
            )}

            {status === "already_registered" && (
                <div className="surface mt-5 flex animate-scale-in items-center gap-3 p-6">
                    <CheckCircle2 className="shrink-0 text-primary" size={22} />
                    <p className="text-sm text-foreground/80">
                        <span className="font-semibold text-foreground">
                            {member?.firstName}, you&apos;re already registered.
                        </span>{" "}
                        We&apos;ve got your spot — see you at the dinner.
                    </p>
                </div>
            )}

            {(status === "error" || status === "config_error") && error && (
                <div className="mt-5 flex items-center gap-2 rounded-token border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
        </div>
    );
};

export default IdentifyStep;
