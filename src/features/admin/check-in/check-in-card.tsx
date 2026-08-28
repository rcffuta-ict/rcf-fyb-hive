"use client";

import { Check, DoorOpen, Loader2, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckInPair } from "@/types/fyb.types";
import CheckInFace from "./check-in-face";

/** Wall-clock arrival, in the timezone the door is standing in. */
const timeFmt = new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
});

type Props = {
    pair: CheckInPair;
    busy: boolean;
    onCheckIn: (intentId: string) => void;
    onUndo: (intentId: string) => void;
};

/**
 * One couple, as the gate sees them: both faces, the code off their email, and
 * a single button. Already-admitted pairs keep the same card but lose the
 * button — the only thing left to do with them is undo a mistake.
 */
const CheckInCard = ({ pair, busy, onCheckIn, onUndo }: Props): React.JSX.Element => {
    const arrived = Boolean(pair.checkedInAt);

    return (
        <div className="border-b border-border p-4 last:border-0">
            <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-sm font-bold tracking-wider text-secondary">
                    {pair.code}
                </p>
                {arrived ? (
                    <Badge variant="success">
                        <Check size={12} /> Inside ·{" "}
                        {timeFmt.format(new Date(pair.checkedInAt as string))}
                    </Badge>
                ) : (
                    <Badge variant="outline">Not arrived</Badge>
                )}
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                {pair.people.map((person) => (
                    <CheckInFace key={`${pair.intentId}-${person.name}`} person={person} />
                ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {arrived && pair.checkedInBy
                        ? `Admitted by ${pair.checkedInBy}`
                        : "Both of them come in together — no date, no entry."}
                </p>

                {arrived ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => onUndo(pair.intentId)}
                        title="Wrong couple admitted on this row"
                    >
                        <Undo2 size={14} /> Undo
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        disabled={busy}
                        onClick={() => onCheckIn(pair.intentId)}
                        className="min-w-40"
                    >
                        {busy ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <DoorOpen size={16} />
                        )}
                        Check in
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CheckInCard;
