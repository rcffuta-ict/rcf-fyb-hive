"use client";

import { Check, DoorOpen, Loader2, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckInPair } from "@/types/fyb.types";
import CheckInFace from "./check-in-face";
import TableNumberField from "./table-number-field";

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
    onSetTable: (intentId: string, value: string) => void;
};

/**
 * One couple, as the gate sees them: both faces, the code off their email, and
 * a single button. Already-admitted pairs keep the same card but lose the
 * button — the only thing left to do with them is undo a mistake.
 *
 * A pair with no table cannot be checked in. The card says so and leads with
 * the table field instead, so the operator is never left guessing why the door
 * button is dead. The database refuses the same thing (migration 011), which is
 * what makes it true when two gates are working at once.
 */
const CheckInCard = ({
    pair,
    busy,
    onCheckIn,
    onUndo,
    onSetTable,
}: Props): React.JSX.Element => {
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
                {/* Seating sits next to the door button, because the two things
                    said to an arriving couple are "you're in" and "you're on
                    table 7" — splitting them across screens splits the sentence. */}
                <TableNumberField
                    tableNumber={pair.tableNumber}
                    busy={busy}
                    emphasize={!seated && !arrived}
                    onSave={(value) => onSetTable(pair.intentId, value)}
                />

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
                        title={seated ? undefined : "Give them a table first"}
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
                      ? "Assign their table to open the door button."
                      : "Both of them come in together — no date, no entry."}
            </p>
        </div>
    );
};

export default CheckInCard;
