"use client";

import { useState } from "react";
import { Check, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import EntryAvatar from "@/components/ui/entry-avatar";
import { appToast } from "@/providers/ToastProvider";
import type { AdminCandidate } from "@/types/awards.types";

/**
 * One entry as a card in the nominee grid, carrying the thing organizers will
 * actually use most: its campaign link, ready to paste into a DM.
 *
 * A card rather than a row because a nominee is a face first — scanning a
 * category for "is that the right Ada" is a visual job, and a full-width row
 * spends most of its space on whitespace between a 36px avatar and two buttons
 * pinned to the far edge.
 *
 * Group entries show their roster under the name. That is the line an admin
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
        <li className="flex flex-col rounded-token border border-border p-3 transition-colors hover:border-primary/30">
            <div className="flex items-start gap-3">
                <EntryAvatar
                    entryKind={candidate.entryKind}
                    imageUrl={candidate.imageUrl}
                    members={candidate.members}
                    alt={candidate.displayName}
                    size={44}
                />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                        {candidate.displayName}
                    </p>
                    <p className="truncate text-xs text-primary">
                        &ldquo;{candidate.nickname}&rdquo;
                    </p>
                    {roster && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                            {roster}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {candidate.shareCode}
                    {candidate.entryKind !== "individual" && (
                        <span className="ml-2 uppercase tracking-wider">
                            {candidate.entryKind}
                        </span>
                    )}
                </span>

                <span className="flex shrink-0 items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Copy the campaign link for ${candidate.displayName}`}
                        title="Copy campaign link"
                        onClick={() => void handleCopy()}
                        className="h-8 w-8"
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
                        aria-label={`Remove ${candidate.displayName}`}
                        onClick={() => onRemove(candidate)}
                        className="h-8 w-8"
                    >
                        <Trash2 size={15} className="text-destructive" />
                    </Button>
                </span>
            </div>
        </li>
    );
};

export default CandidateRow;
