"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import CheckInFace from "@/features/check-in/check-in-face";
import type { CheckInPair } from "@/types/fyb.types";
import TableNumberField from "./table-number-field";

/**
 * One couple on the seating plan.
 *
 * Faces are here for the same reason they are at the door: the organizer
 * building the plan is thinking about who sits with whom, and two names in a
 * list are much easier to mix up than two faces.
 */
type Props = {
    pair: CheckInPair;
    busy: boolean;
    onSetTable: (intentId: string, value: string) => void;
};

const SeatingRow = ({ pair, busy, onSetTable }: Props): React.JSX.Element => (
    <div className="border-b border-border p-4 last:border-0">
        <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs font-bold tracking-wider text-secondary">
                {pair.code}
            </p>
            {pair.checkedInAt && (
                <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                    <Check size={10} /> Inside
                </Badge>
            )}
        </div>

        <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {pair.people.map((person) => (
                <CheckInFace key={`${pair.intentId}-${person.name}`} person={person} />
            ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <TableNumberField
                tableNumber={pair.tableNumber}
                busy={busy}
                emphasize={!pair.tableNumber}
                onSave={(value) => onSetTable(pair.intentId, value)}
            />
            {pair.checkedInAt && pair.checkedInBy && (
                <p className="text-xs text-muted-foreground">
                    Admitted by {pair.checkedInBy}
                </p>
            )}
        </div>
    </div>
);

export default SeatingRow;
