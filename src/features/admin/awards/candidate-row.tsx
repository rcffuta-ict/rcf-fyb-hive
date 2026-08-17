"use client";

import { useState } from "react";
import { Check, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import FaceAvatar from "@/components/ui/face-avatar";
import { appToast } from "@/providers/ToastProvider";
import type { AdminCandidate } from "@/types/awards.types";

/**
 * One candidate in the admin list, with the thing organizers will actually use
 * most: their campaign link, ready to paste into a DM.
 */

/** Absolute, because it is going into someone else's WhatsApp. */
export const campaignUrl = (shareCode: string): string =>
    typeof window === "undefined" ? "" : `${window.location.origin}/awards/c/${shareCode}`;

const CandidateRow = ({
    candidate,
    onRemove,
}: {
    candidate: AdminCandidate;
    onRemove: (candidate: AdminCandidate) => void;
}): React.JSX.Element => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(campaignUrl(candidate.shareCode));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            appToast.error("Couldn't copy the link.");
        }
    };

    return (
        <li className="flex items-center gap-3 rounded-token border border-border p-2.5">
            <FaceAvatar src={candidate.photoUrl} size={36} className="h-9 w-9" />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                    {candidate.firstName} {candidate.lastName}
                </p>
                <p className="truncate text-xs text-primary">
                    &ldquo;{candidate.nickname}&rdquo;
                    <span className="ml-2 font-mono text-muted-foreground">
                        {candidate.shareCode}
                    </span>
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                aria-label={`Copy ${candidate.firstName}'s campaign link`}
                title="Copy campaign link"
                onClick={() => void handleCopy()}
            >
                {copied ? (
                    <Check size={15} className="text-primary" />
                ) : (
                    <Link2 size={15} />
                )}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${candidate.firstName}`}
                onClick={() => onRemove(candidate)}
            >
                <Trash2 size={15} className="text-destructive" />
            </Button>
        </li>
    );
};

export default CandidateRow;
