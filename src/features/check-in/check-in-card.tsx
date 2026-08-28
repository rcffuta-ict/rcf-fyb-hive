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
 * One couple at the door: two large photographs, their table, and one button.
 *
 * The pictures lead. Whoever is on the gate is matching faces against two
 * people standing in front of them — a name in a list is something anyone can
 * claim, so the portraits get the width and everything else is arranged under
 * them.
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
        <div className="border-b border-border p-4 last:border-0 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {pair.people.map((person) => (
                    <CheckInFace
                        key={`${pair.intentId}-${person.name}`}
                        person={person}
                        variant="portrait"
                    />
                ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-mono text-xs font-bold tracking-wider text-secondary">
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

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                {seated ? (
                    <span className="inline-flex items-center justify-center gap-1.5 rounded-token bg-accent/60 px-3 py-2 text-base font-bold text-primary sm:py-1.5 sm:text-sm">
                        <Armchair size={16} /> Table {pair.tableNumber}
                    </span>
                ) : (
                    <Badge variant="warning">No table yet</Badge>
                )}

                {arrived ? (
                    <Button
                        variant="ghost"
                        size="lg"
                        disabled={busy}
                        onClick={() => onUndo(pair.intentId)}
                        title="Wrong couple admitted on this row"
                        className="h-12 w-full sm:w-auto"
                    >
                        <Undo2 size={16} /> Undo
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        variant={seated ? "default" : "outline"}
                        disabled={busy || !seated}
                        onClick={() => onCheckIn(pair.intentId)}
                        title={seated ? undefined : "An organizer must seat them first"}
                        className="h-14 w-full text-base sm:h-11 sm:w-auto sm:min-w-40"
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
