"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { addCandidatesBulk } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";

/**
 * The escape hatch: a whole list at once.
 *
 * Demoted behind a disclosure now that the picker exists — it's still the right
 * tool when someone hands you a nomination sheet, and the wrong one for adding
 * three people.
 */
const BulkAdd = ({
    categoryId,
    onAdded,
}: {
    categoryId: string;
    onAdded: () => void;
}): React.JSX.Element => {
    const [open, setOpen] = useState(false);
    const [raw, setRaw] = useState("");
    const [busy, setBusy] = useState(false);
    const [failures, setFailures] = useState<string[]>([]);

    const handleBulk = async (): Promise<void> => {
        setBusy(true);
        const result = await addCandidatesBulk(categoryId, raw);
        setBusy(false);
        setFailures(result.failures);

        if (result.added > 0) {
            appToast.success(`Added ${result.added} candidate${result.added === 1 ? "" : "s"}.`);
            setRaw("");
            onAdded();
            return;
        }
        if (result.failures.length > 0) {
            appToast.error("Nothing was added — see the details below.");
        }
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="text-xs font-medium text-primary hover:underline"
            >
                {open ? "Hide bulk paste" : "Paste a whole list instead"}
            </button>

            {open && (
                <div className="mt-3">
                    <textarea
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        rows={5}
                        placeholder={
                            "one per line:\nada@email.com, The Encourager\ntobi@email.com, Gbedu Minister"
                        }
                        className="w-full rounded-token border border-border bg-background p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={busy || !raw.trim()}
                        onClick={() => void handleBulk()}
                        className="mt-2"
                    >
                        {busy ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Plus size={15} />
                        )}
                        Add all
                    </Button>

                    {failures.length > 0 && (
                        <ul className="mt-3 space-y-1 rounded-token border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                            {failures.map((failure) => (
                                <li key={failure}>{failure}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkAdd;
