"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Lock, UserPlus } from "lucide-react";

import AssociateAvatar from "@/components/shared/associate-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePairingStore } from "@/store/pairing.store";
import { associateSchema, type AssociateFormValues } from "./schema";
import PairCard from "./pair-card";
import RefundNotice from "./refund-notice";

/** Step 3b — bring someone from outside the fellowship. */
const AssociateStep = (): React.JSX.Element | null => {
    const self = usePairingStore((s) => s.self);
    const expects = usePairingStore((s) => s.expects);
    const expectsTerm = usePairingStore((s) => s.expectsTerm);
    const submitAssociate = usePairingStore((s) => s.submitAssociate);
    const submitting = usePairingStore((s) => s.submitting);
    const error = usePairingStore((s) => s.error);
    const back = usePairingStore((s) => s.back);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AssociateFormValues>({ resolver: zodResolver(associateSchema) });

    if (!self) return null;

    const onSubmit = async (values: AssociateFormValues): Promise<void> => {
        await submitAssociate(values);
    };

    const fields = [
        { name: "name", label: "Full name", placeholder: "Grace Okon", type: "text" },
        { name: "email", label: "Email", placeholder: "grace@example.com", type: "email" },
        { name: "phone", label: "Phone", placeholder: "0801 234 5678", type: "tel" },
        {
            name: "relationship",
            label: "How do you know them?",
            placeholder: "Course mate, family friend…",
            type: "text",
        },
    ] as const;

    return (
        <div className="mx-auto max-w-md animate-fade-in">
            <PairCard card={self} caption="You" />

            <form onSubmit={handleSubmit(onSubmit)} className="surface mt-3 p-6">
                <div className="flex items-center gap-3">
                    {expects ? (
                        <AssociateAvatar gender={expects} className="h-12 w-12" />
                    ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                            <UserPlus size={20} />
                        </span>
                    )}
                    <div>
                        <p className="font-medium text-foreground">Your associate</p>
                        <p className="text-sm text-muted-foreground">
                            A {expectsTerm} who isn&apos;t part of the fellowship. Their
                            invitation goes to the email you give us.
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <Label htmlFor={field.name}>{field.label}</Label>
                            <Input
                                id={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                className="mt-1.5"
                                aria-invalid={Boolean(errors[field.name])}
                                {...register(field.name)}
                            />
                            {errors[field.name] && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors[field.name]?.message}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex gap-3 rounded-token border border-border bg-muted/40 px-4 py-3.5">
                    <Lock size={17} className="mt-0.5 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-foreground/80">
                        <strong className="text-foreground">This takes you off the market.</strong>{" "}
                        Once submitted, no other finalist can pair with you and you can&apos;t add
                        a different associate. Only the organizers can undo it.
                    </p>
                </div>

                <RefundNotice className="mt-3" />

                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

                <Button type="submit" size="lg" disabled={submitting} className="sheen mt-4 w-full">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {submitting ? "Locking it in…" : "Bring this person"}
                </Button>
            </form>

            <Button variant="ghost" onClick={back} className="mt-3 w-full">
                <ArrowLeft size={16} /> Back
            </Button>
        </div>
    );
};

export default AssociateStep;
