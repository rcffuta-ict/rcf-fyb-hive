"use client";

import { Check, DoorOpen, Loader2, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SeatedPair } from "@/services/check-in.service";

/**
 * One couple on the seating list.
 *
 * The same row serves a guest looking for their name and a check-in manager
 * working the door — the buttons simply aren't there for the guest. One list,
 * so the door and the wall can never disagree about where somebody sits.
 */
type Props = {
    pair: SeatedPair;
    /** Buttons appear only for a signed-in member of the check-in team. */
    staffing: boolean;
    busy: boolean;
    onCheckIn: (intentId: string) => void;
    onUndo: (intentId: string) => void;
};

const SeatRow = ({ pair, staffing, busy, onCheckIn, onUndo }: Props): React.JSX.Element => (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{pair.names.join(" & ")}</p>
            {pair.checkedIn && (
                <Badge variant="success" className="mt-1 px-1.5 py-0 text-[10px]">
                    <Check size={10} /> Inside
                </Badge>
            )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-token bg-accent/60 px-3 py-1 font-mono text-sm font-bold tracking-wider text-primary">
                {pair.tableNumber}
            </span>

            {staffing &&
                (pair.checkedIn ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => onUndo(pair.intentId)}
                        title="Admitted by mistake"
                    >
                        <Undo2 size={14} />
                    </Button>
                ) : (
                    <Button size="sm" disabled={busy} onClick={() => onCheckIn(pair.intentId)}>
                        {busy ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <DoorOpen size={14} />
                        )}
                        Check in
                    </Button>
                ))}
        </div>
    </li>
);

export default SeatRow;
