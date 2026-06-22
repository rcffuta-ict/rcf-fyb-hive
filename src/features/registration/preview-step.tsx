"use client";

import Image from "next/image";
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRegistrationStore } from "@/store/registration.store";
import Link from "next/link";

const formatGender = (gender: string | null): string | null =>
    gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : null;

const Detail = ({
    label,
    value,
}: {
    label: string;
    value: string;
}): React.JSX.Element => (
    <div className="rounded-token bg-accent/30 px-4 py-3">
        <dt className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
    </div>
);

const PreviewStep = (): React.JSX.Element | null => {
    const member = useRegistrationStore((s) => s.member);
    const photoPreview = useRegistrationStore((s) => s.photoPreview);
    const submitting = useRegistrationStore((s) => s.submitting);
    const error = useRegistrationStore((s) => s.error);
    const submit = useRegistrationStore((s) => s.submit);
    const back = useRegistrationStore((s) => s.back);

    if (!member) return null;

    const details: { label: string; value: string }[] = [
        member.email && { label: "Email", value: member.email },
        member.phoneNumber && { label: "Phone", value: member.phoneNumber },
        formatGender(member.gender) && {
            label: "Gender",
            value: formatGender(member.gender)!,
        },
        member.matricNumber && {
            label: "Matric No.",
            value: member.matricNumber,
        },
        member.department && { label: "Department", value: member.department },
        member.faculty && { label: "Faculty", value: member.faculty },
    ].filter((d): d is { label: string; value: string } => Boolean(d));

    return (
        <div className="mx-auto max-w-lg animate-fade-in">
            <div className="surface overflow-hidden">
                <div className="flex flex-col items-center gap-4 border-b border-border bg-accent/40 px-5 py-6 text-center sm:flex-row sm:text-left">
                    <div className="relative h-20 w-20 shrink-0">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-xl"
                        />
                        {photoPreview ? (
                            <Image
                                src={photoPreview}
                                alt={`${member.firstName} ${member.lastName}`}
                                fill
                                className="rounded-full border-2 border-primary/40 object-cover"
                                unoptimized={
                                    photoPreview.startsWith("blob:") ||
                                    photoPreview.startsWith("data:")
                                }
                            />
                        ) : null}
                    </div>
                    <div className="min-w-0">
                        <p className="font-luxury text-xl text-foreground">
                            {member.firstName} {member.lastName}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                            {member.level} · Finalist
                        </span>
                    </div>
                </div>

                <div className="p-5 sm:p-8">
                    <h2 className="font-luxury text-xl text-foreground">
                        Confirm your details
                    </h2>
                    <p className="mt-1.5 text-sm text-foreground/70">
                        Pulled from your RCF FUTA profile. If something looks
                        off, update it at{" "}
                        <Link href="https://ict.rcffuta.com/" target="_blank">
                            <span className="font-medium text-foreground">
                                ict.rcffuta.com
                            </span>
                            .
                        </Link>
                    </p>

                    {details.length > 0 && (
                        <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {details.map((d) => (
                                <Detail
                                    key={d.label}
                                    label={d.label}
                                    value={d.value}
                                />
                            ))}
                        </dl>
                    )}

                    {member.units.length > 0 && (
                        <div className="mt-5">
                            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Units &amp; Teams
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {member.units.map((u) => (
                                    <span
                                        key={u.name}
                                        className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                    >
                                        {u.name}
                                        {u.role && u.role !== "Member"
                                            ? ` · ${u.role}`
                                            : ""}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {member.leadership.length > 0 && (
                        <div className="mt-5">
                            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Leadership
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {member.leadership.map((l, i) => (
                                    <span
                                        key={`${l.title}-${i}`}
                                        className="rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-medium text-primary"
                                    >
                                        {l.title}
                                        {l.unit ? ` · ${l.unit}` : ""}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-5 flex items-center gap-2 rounded-token border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle size={16} className="shrink-0" />{" "}
                            {error}
                        </div>
                    )}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
                        <Button
                            onClick={() => void submit()}
                            size="lg"
                            className="sheen w-full sm:flex-1"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />{" "}
                                    Registering…
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={18} /> Confirm &amp;
                                    Register
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={back}
                            size="lg"
                            variant="ghost"
                            disabled={submitting}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft size={18} /> Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewStep;
