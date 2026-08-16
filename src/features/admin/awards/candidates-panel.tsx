"use client";

import { useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";

import { listCandidates, removeCandidate } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";
import AddCandidateForm from "./add-candidate-form";
import BulkAdd from "./bulk-add";
import CandidateRow, { campaignUrl } from "./candidate-row";
import type { AdminCandidate } from "@/types/awards.types";

/**
 * Who is standing in one category.
 *
 * Candidates come from `fyb_registrations` — the finalists who registered and
 * hold consent tokens — because that is what carries the photo a card needs.
 * A member who never registered simply has nothing to show.
 */
const CandidatesPanel = ({ categoryId }: { categoryId: string }): React.JSX.Element => {
    const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
    const [version, setVersion] = useState(0);
    const reload = (): void => setVersion((current) => current + 1);

    useEffect(() => {
        const load = async (): Promise<void> => {
            setCandidates(await listCandidates(categoryId));
        };
        void load();
    }, [categoryId, version]);

    const handleRemove = async (candidate: AdminCandidate): Promise<void> => {
        const sure = window.confirm(
            `Remove ${candidate.firstName} from this category? Votes already cast for them are removed too.`
        );
        if (!sure) return;

        const result = await removeCandidate(candidate.id);
        if (result.ok) reload();
        else appToast.error(result.message);
    };

    /** One line per candidate — paste straight into the group chat. */
    const handleCopyAll = async (): Promise<void> => {
        const lines = candidates
            .map((c) => `${c.firstName} ${c.lastName} — ${campaignUrl(c.shareCode)}`)
            .join("\n");

        try {
            await navigator.clipboard.writeText(lines);
            appToast.success(`Copied ${candidates.length} campaign links.`);
        } catch {
            appToast.error("Couldn't copy the links.");
        }
    };

    return (
        <div className="surface mt-2 border-primary/30 p-5">
            <div className="flex items-center justify-between gap-3">
                <h4 className="flex items-center gap-2 font-luxury text-base text-foreground">
                    <Users size={16} className="text-primary" />
                    Candidates ({candidates.length})
                </h4>

                {candidates.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => void handleCopyAll()}>
                        <Copy size={14} /> Copy all links
                    </Button>
                )}
            </div>

            <AddCandidateForm categoryId={categoryId} onAdded={reload} />
            <BulkAdd categoryId={categoryId} onAdded={reload} />

            {candidates.length > 0 && (
                <ul className="mt-5 space-y-2">
                    {candidates.map((candidate) => (
                        <CandidateRow
                            key={candidate.id}
                            candidate={candidate}
                            onRemove={(target) => void handleRemove(target)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CandidatesPanel;
