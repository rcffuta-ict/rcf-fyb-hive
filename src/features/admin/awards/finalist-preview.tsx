"use client";

import Image from "next/image";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FinalistOption } from "@/types/awards.types";

/**
 * Who that email turned out to be.
 *
 * The face is the point: an admin catches a mistyped address by not
 * recognising the person, long before a stranger reaches the ballot.
 */
const FinalistPreview = ({
    finalist,
    valid,
    note,
}: {
    finalist: FinalistOption;
    valid: boolean;
    note: string;
}): React.JSX.Element => (
    <div
        className={cn(
            "mt-3 flex items-center gap-3 rounded-token border p-3",
            valid ? "border-primary/40 bg-primary/5" : "border-amber-500/40 bg-amber-500/5"
        )}
    >
        <Image
            src={finalist.photoUrl}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
                {finalist.firstName} {finalist.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
                {finalist.level}
                {finalist.unit ? ` · ${finalist.unit}` : ""}
                {finalist.otherCategories > 0 &&
                    ` · standing in ${finalist.otherCategories} other categor${
                        finalist.otherCategories === 1 ? "y" : "ies"
                    }`}
            </p>
            {note && (
                <p
                    className={cn(
                        "mt-0.5 text-xs",
                        valid ? "text-primary" : "text-amber-600"
                    )}
                >
                    {note}
                </p>
            )}
        </div>

        {valid ? (
            <CheckCircle2 size={18} className="shrink-0 text-primary" />
        ) : (
            <AlertTriangle size={18} className="shrink-0 text-amber-600" />
        )}
    </div>
);

export default FinalistPreview;
