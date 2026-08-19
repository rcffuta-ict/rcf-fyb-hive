"use client";

import { useState } from "react";
import { Check, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import EntryAvatar from "@/components/ui/entry-avatar";
import { appToast } from "@/providers/ToastProvider";
import type { AdminCandidate } from "@/types/awards.types";

/**
 * One entry in the admin list, with the thing organizers will actually use
 * most: its campaign link, ready to paste into a DM.
 *
 * Group entries show their roster on the second line. That is the line an admin
 * scans when a complaint arrives — "who is actually in that clique" is the
 * question, and it should not require opening anything.
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

    const roster = candidate.members
        .map((member) => `${member.firstName} ${member.lastName}`)
        .join(", ");

    return (
        <li className="flex items-center gap-3 rounded-token border border-border p-2.5">
            <EntryAvatar
                entryKind={candidate.entryKind}
                imageUrl={candidate.imageUrl}
                members={candidate.members}
                alt={candidate.displayName}
                size={36}
            />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                    {candidate.displayName}
                    {candidate.entryKind !== "individual" && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {candidate.entryKind}
                        </span>
                    )}
                </p>
                <p className="truncate text-xs text-primary">
                    &ldquo;{candidate.nickname}&rdquo;
                    <span className="ml-2 font-mono text-muted-foreground">
                        {candidate.shareCode}
                    </span>
                </p>
                {roster && (
                    <p className="truncate text-[11px] text-muted-foreground">{roster}</p>
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                aria-label={`Copy the campaign link for ${candidate.displayName}`}
                title="Copy campaign link"
                onClick={() => void handleCopy()}
            >
                {copied ? <Check size={15} className="text-primary" /> : <Link2 size={15} />}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${candidate.displayName}`}
                onClick={() => onRemove(candidate)}
            >
                <Trash2 size={15} className="text-destructive" />
            </Button>
        </li>
    );
};

export default CandidateRow;
