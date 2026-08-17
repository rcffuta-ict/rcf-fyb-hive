"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { addCandidatesBulk, type BulkProblem } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";

/**
 * The escape hatch: a whole list at once.
 *
 * Demoted behind a disclosure now that the picker exists — it's still the right
 * tool when someone hands you a nomination sheet, and the wrong one for adding
 * three people.
 *
 * All-or-nothing by design, so the textarea is never cleared on a failure: the
 * paste in front of the admin is still exactly what is not yet in the database,
 * and the problems below point at lines they can see.
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
    const [problems, setProblems] = useState<BulkProblem[]>([]);

    const handleBulk = async (): Promise<void> => {
        setBusy(true);
        const result = await addCandidatesBulk(categoryId, raw);
        setBusy(false);

        if (!result.ok) {
            setProblems(result.problems);
            appToast.error(
                `Nothing was added — ${result.problems.length} line${
                    result.problems.length === 1 ? "" : "s"
                } need${result.problems.length === 1 ? "s" : ""} fixing.`
            );
            return;
        }

        setProblems([]);
        appToast.success(`Added ${result.added} candidate${result.added === 1 ? "" : "s"}.`);
        setRaw("");
        onAdded();
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
                    <p className="mt-2 text-[11px] text-muted-foreground">
                        Every line is checked first. If one fails, nothing is added.
                    </p>

                    {problems.length > 0 && (
                        <ul className="mt-3 space-y-2 rounded-token border border-destructive/30 bg-destructive/5 p-3 text-xs">
                            {problems.map((problem) => (
                                <li key={`${problem.line}-${problem.reason}`}>
                                    {problem.line > 0 && (
                                        <span className="font-mono text-muted-foreground">
                                            Line {problem.line}:{" "}
                                        </span>
                                    )}
                                    <span className="text-destructive">{problem.reason}</span>
                                    {problem.text && (
                                        <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                                            {problem.text}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkAdd;
