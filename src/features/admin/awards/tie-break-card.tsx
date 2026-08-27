"use client";

import { Check, Loader2 } from "lucide-react";

import EntryAvatar from "@/components/ui/entry-avatar";
import { cn } from "@/lib/utils";
import type { TieBreakCategory, TieBreakContender } from "@/types/awards.types";

/**
 * One deadlocked award, and this admin's vote in it.
 *
 * The contenders are the only options, and there is no field for anyone else.
 * That is the shape of the power on purpose: the committee chooses between
 * people the members already put exactly level, and cannot promote anybody who
 * lost. A dropdown of every candidate would be a different feature — a veto —
 * and this app has no business having one.
 */
const ContenderButton = ({
    contender,
    picked,
    busy,
    onPick,
}: {
    contender: TieBreakContender;
    picked: boolean;
    busy: boolean;
    onPick: () => void;
}): React.JSX.Element => (
    <button
        type="button"
        onClick={onPick}
        disabled={busy}
        aria-pressed={picked}
        className={cn(
            "flex items-center gap-3 rounded-token border p-3 text-left transition-colors disabled:opacity-60",
            picked
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40"
        )}
    >
        <EntryAvatar
            entryKind={contender.entryKind}
            imageUrl={contender.imageUrl}
            members={contender.members}
            alt={contender.displayName}
            size={40}
        />

        <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
                {contender.displayName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
                {contender.committeeVotes === 0
                    ? "No committee votes yet"
                    : `${contender.committeeVotes} committee vote${contender.committeeVotes === 1 ? "" : "s"}`}
            </span>
        </span>

        {picked && <Check size={16} className="shrink-0 text-primary" />}
    </button>
);

const TieBreakCard = ({
    tie,
    busy,
    onPick,
}: {
    tie: TieBreakCategory;
    busy: boolean;
    onPick: (candidateId: string) => void;
}): React.JSX.Element => {
    return (
        <li className="surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="font-luxury text-base text-foreground">{tie.title}</h4>
                <span className="text-xs text-muted-foreground">
                    Tied at {tie.tiedAt} vote{tie.tiedAt === 1 ? "" : "s"} each
                </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {tie.contenders.map((contender) => (
                    <ContenderButton
                        key={contender.candidateId}
                        contender={contender}
                        picked={tie.myVoteCandidateId === contender.candidateId}
                        busy={busy}
                        onPick={() => onPick(contender.candidateId)}
                    />
                ))}
            </div>

            <p
                className={cn(
                    "mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs",
                    tie.settled ? "text-primary" : "text-amber-600"
                )}
            >
                {busy && <Loader2 size={13} className="animate-spin" />}
                {tie.votesIn} of {tie.committeeSize} admin
                {tie.committeeSize === 1 ? "" : "s"} have voted ·{" "}
                {tie.settled
                    ? "one name is ahead — results can be published"
                    : "still level, so results can't be published yet"}
            </p>
        </li>
    );
};

export default TieBreakCard;
