"use client";

import { useState } from "react";
import { Armchair, Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * The table a couple is seated at — shown as a label, edited in place.
 *
 * Free text, because rooms are laid out as "A4" and "VIP 2" as often as "12",
 * and always editable: seating gets rearranged on the night, and an organizer
 * who cannot correct a table will write the real one on their hand instead.
 */
type Props = {
    tableNumber: string | null;
    busy: boolean;
    onSave: (value: string) => void;
};

const TableNumberField = ({ tableNumber, busy, onSave }: Props): React.JSX.Element => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(tableNumber ?? "");

    // Seeded on open, never in an effect: a refresh (or another gate's save)
    // between edits should be what the field starts from, and once the operator
    // is typing nothing but they gets to move it.
    const handleOpen = (): void => {
        setValue(tableNumber ?? "");
        setEditing(true);
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        setEditing(false);
        if (value.trim() === (tableNumber ?? "")) return;
        onSave(value);
    };

    const handleCancel = (): void => {
        setValue(tableNumber ?? "");
        setEditing(false);
    };

    if (!editing) {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={handleOpen}
                title={tableNumber ? "Change table" : "Assign a table"}
            >
                {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Armchair size={14} />
                )}
                {tableNumber ? `Table ${tableNumber}` : "Assign table"}
            </Button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <Input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && handleCancel()}
                maxLength={12}
                placeholder="Table"
                aria-label="Table number"
                autoCapitalize="characters"
                autoCorrect="off"
                className="h-9 w-24 px-3 text-sm uppercase"
            />
            <Button type="submit" size="sm" disabled={busy}>
                <Check size={14} />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                <X size={14} />
            </Button>
        </form>
    );
};

export default TableNumberField;
