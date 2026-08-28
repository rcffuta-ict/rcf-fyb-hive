"use client";

import { Armchair, Check, DoorOpen, Loader2, Undo2 } from "lucide-react";

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
 * One couple at the door: both faces, their table, and one button.
 *
 * There is no table field here on purpose. Seating is an organizer's job done
 * ahead of the evening; the door admits people to the seats the plan gave them.
 * A couple with no table cannot be checked in — the card says so, and the
 * database refuses it too (migration 011), which is what makes it hold when
 * several people are working the door at once.
 */
const CheckInCard = ({ pair, busy, onCheckIn, onUndo }: Props): React.JSX.Element => {
    const arrived = Boolean(pair.checkedInAt);
    const seated = Boolean(pair.tableNumber);

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
                {seated ? (
                    <span className="inline-flex items-center gap-1.5 rounded-token bg-accent/60 px-3 py-1.5 text-sm font-bold text-primary">
                        <Armchair size={15} /> Table {pair.tableNumber}
                    </span>
                ) : (
                    <Badge variant="warning">No table yet</Badge>
                )}

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
                        variant={seated ? "default" : "outline"}
                        disabled={busy || !seated}
                        onClick={() => onCheckIn(pair.intentId)}
                        title={seated ? undefined : "An organizer must seat them first"}
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

            <p className="mt-2 text-xs text-muted-foreground">
                {arrived && pair.checkedInBy
                    ? `Admitted by ${pair.checkedInBy}`
                    : !seated
                      ? "No table assigned — send them to an organizer."
                      : "Both of them come in together — no date, no entry."}
            </p>
        </div>
    );
};

export default CheckInCard;
