"use client";

import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/shared/image-upload";
import { useRegistrationStore } from "@/store/registration.store";
import { MemberUnit } from "@/types";

function getUnit(data: MemberUnit[]) {
    let unit: string = "";

    for (const each of data) {
        if (!unit) {
            unit = `${each.name} ${each.type}`;
            continue;
        }

        if (each.type === "UNIT") {
            unit = `${each.name} ${each.type}`;
            break;
        }
    }

    return unit.toLowerCase();
}

const PhotoStep = (): React.JSX.Element | null => {
    const member = useRegistrationStore((s) => s.member);
    const photoPreview = useRegistrationStore((s) => s.photoPreview);
    const error = useRegistrationStore((s) => s.error);
    const setPhotoFile = useRegistrationStore((s) => s.setPhotoFile);
    const clearPhoto = useRegistrationStore((s) => s.clearPhoto);
    const proceedToPreview = useRegistrationStore((s) => s.proceedToPreview);
    const back = useRegistrationStore((s) => s.back);

    if (!member) return null;

    console.log(member);

    return (
        <div className="mx-auto max-w-lg animate-fade-in">
            <div className="surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent/40 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="min-w-0">
                        <p className="truncate font-luxury text-lg text-foreground">
                            {member.firstName} {member.lastName}
                        </p>
                        <p className="truncate text-sm capitalize text-muted-foreground">
                            {getUnit(member.units)}
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        {member.level} · Finalist
                    </span>
                </div>

                <div className="p-5 sm:p-8">
                    <h2 className="font-luxury text-xl text-foreground">
                        Add a clear face photo
                    </h2>
                    <p className="mt-1.5 text-sm text-foreground/70">
                        Front-facing, well-lit, just you. We use this to
                        identify you at the door.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <ImageUpload
                            name="photo"
                            value={photoPreview}
                            onSelect={setPhotoFile}
                            onClear={clearPhoto}
                        />
                    </div>

                    {error && (
                        <div className="mt-5 flex items-center gap-2 rounded-token border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle size={16} className="shrink-0" />{" "}
                            {error}
                        </div>
                    )}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
                        <Button
                            onClick={proceedToPreview}
                            size="lg"
                            className="sheen w-full sm:flex-1"
                            disabled={!photoPreview}
                        >
                            Preview my profile <ArrowRight size={18} />
                        </Button>
                        <Button
                            onClick={back}
                            size="lg"
                            variant="ghost"
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

export default PhotoStep;
