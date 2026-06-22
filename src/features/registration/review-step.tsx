"use client";

import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/shared/image-upload";
import { useRegistrationStore } from "@/store/registration.store";

const ReviewStep = (): React.JSX.Element | null => {
    const member = useRegistrationStore((s) => s.member);
    const photoUrl = useRegistrationStore((s) => s.photoUrl);
    const submitting = useRegistrationStore((s) => s.submitting);
    const error = useRegistrationStore((s) => s.error);
    const setPhoto = useRegistrationStore((s) => s.setPhoto);
    const submit = useRegistrationStore((s) => s.submit);
    const back = useRegistrationStore((s) => s.back);

    if (!member) return null;

    return (
        <div className="mx-auto max-w-lg animate-fade-in">
            <div className="surface overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b border-border bg-accent/40 px-6 py-5">
                    <div>
                        <p className="font-luxury text-lg text-foreground">
                            {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {member.department ?? "RCF FUTA"}
                        </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        {member.level} · Finalist
                    </span>
                </div>

                <div className="p-6 sm:p-8">
                    <h2 className="font-luxury text-xl text-foreground">Add a clear face photo</h2>
                    <p className="mt-1.5 text-sm text-foreground/70">
                        Front-facing, well-lit, just you. We use this to identify you at the door.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <ImageUpload
                            name="photo"
                            value={photoUrl}
                            onChange={setPhoto}
                            disable={submitting}
                            folder="registrations"
                        />
                    </div>

                    {error && (
                        <div className="mt-5 flex items-center gap-2 rounded-token border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
                        <Button
                            onClick={() => void submit()}
                            size="lg"
                            className="w-full sheen sm:flex-1"
                            disabled={submitting || !photoUrl}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Registering…
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={18} /> Confirm & Register
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

export default ReviewStep;
