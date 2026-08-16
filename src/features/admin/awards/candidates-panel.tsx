"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Plus, Users } from "lucide-react";

import {
    addCandidate,
    addCandidatesBulk,
    listCandidates,
    removeCandidate,
} from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/providers/ToastProvider";
import CandidateRow, { campaignUrl } from "./candidate-row";
import type { AdminCandidate } from "@/types/awards.types";

/**
 * Who is standing in one category.
 *
 * Candidates are added by their **dinner** email — the address on their
 * `fyb_registrations` row — because that is what carries the photo and level a
 * card needs. A member who never registered simply has nothing to show.
 */
const CandidatesPanel = ({ categoryId }: { categoryId: string }): React.JSX.Element => {
    const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [bulk, setBulk] = useState("");
    const [showBulk, setShowBulk] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failures, setFailures] = useState<string[]>([]);

    const [version, setVersion] = useState(0);
    const reload = (): void => setVersion((current) => current + 1);

    useEffect(() => {
        const load = async (): Promise<void> => {
            setCandidates(await listCandidates(categoryId));
        };
        void load();
    }, [categoryId, version]);

    const handleAdd = async (): Promise<void> => {
        setBusy(true);
        const result = await addCandidate({ categoryId, email, nickname });
        setBusy(false);

        if (!result.ok) {
            appToast.error(result.message);
            return;
        }
        appToast.success(result.message);
        setEmail("");
        setNickname("");
        reload();
    };

    const handleBulk = async (): Promise<void> => {
        setBusy(true);
        const result = await addCandidatesBulk(categoryId, bulk);
        setBusy(false);
        setFailures(result.failures);

        if (result.added > 0) {
            appToast.success(`Added ${result.added} candidate${result.added === 1 ? "" : "s"}.`);
            setBulk("");
            reload();
        }
        if (result.added === 0 && result.failures.length > 0) {
            appToast.error("Nothing was added — see the details below.");
        }
    };

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

            <div className="mt-4 space-y-3 sm:flex sm:gap-3 sm:space-y-0">
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finalist@email.com"
                    className="sm:flex-1"
                />
                <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Nickname for this category"
                    className="sm:flex-1"
                />
                <Button onClick={() => void handleAdd()} disabled={busy}>
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Add
                </Button>
            </div>

            <button
                type="button"
                onClick={() => setShowBulk(!showBulk)}
                className="mt-3 text-xs font-medium text-primary hover:underline"
            >
                {showBulk ? "Hide bulk paste" : "Paste a whole list instead"}
            </button>

            {showBulk && (
                <div className="mt-3">
                    <textarea
                        value={bulk}
                        onChange={(e) => setBulk(e.target.value)}
                        rows={5}
                        placeholder={"one per line:\nada@email.com, The Encourager\ntobi@email.com, Gbedu Minister"}
                        className="w-full rounded-token border border-border bg-background p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={busy || !bulk.trim()}
                        onClick={() => void handleBulk()}
                        className="mt-2"
                    >
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
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
