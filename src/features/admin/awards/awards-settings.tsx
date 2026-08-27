"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MonitorPlay, Save } from "lucide-react";

import { getAwardSettings, saveAwardSettings } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";

/** The two switches that decide whether anyone can vote, and who sees the tally. */
const AwardsSettings = (): React.JSX.Element => {
    const [awardsEnabled, setAwardsEnabled] = useState(false);
    const [resultsPublic, setResultsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async (): Promise<void> => {
            const settings = await getAwardSettings();
            setAwardsEnabled(settings.awardsEnabled);
            setResultsPublic(settings.resultsPublic);
            setLoading(false);
        };
        void load();
    }, []);

    const handleSave = async (): Promise<void> => {
        setSaving(true);
        const result = await saveAwardSettings({ awardsEnabled, resultsPublic });
        setSaving(false);

        if (result.ok) {
            appToast.success(result.message);
            return;
        }

        // A refused save (opening voting with no candidates, say) would
        // otherwise leave the box ticked while the database says otherwise —
        // so the switches snap back to what was actually stored.
        appToast.error(result.message);
        const stored = await getAwardSettings();
        setAwardsEnabled(stored.awardsEnabled);
        setResultsPublic(stored.resultsPublic);
    };

    if (loading) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    return (
        <div className="surface mt-4 max-w-lg p-6">
            <label className="flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    checked={awardsEnabled}
                    onChange={(e) => setAwardsEnabled(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                    <span className="block font-medium text-foreground">Voting is open</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                        Opens the awards page and its nav link for every member, immediately.
                        Turn it off and the ballot freezes — votes already cast are kept and
                        shown back to their owners, but nothing new lands.
                    </span>
                </span>
            </label>

            <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-border pt-6">
                <input
                    type="checkbox"
                    checked={resultsPublic}
                    onChange={(e) => setResultsPublic(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                    <span className="block font-medium text-foreground">Unveil the winners</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                        The winners screen is already live and already sealed — every award and
                        its nominees, behind a blur, with no winner in the page at all. This is
                        the switch that unseals it: the counts go public and the names appear.
                        Usually a decision for the night itself, and it won&apos;t save while any
                        award is still tied.
                    </span>
                </span>
            </label>

            <Link
                href="/awards/winners"
                target="_blank"
                className="mt-4 flex items-center gap-2 rounded-token border border-primary/40 p-3 text-sm text-primary transition-colors hover:bg-primary/10"
            >
                <MonitorPlay size={16} className="shrink-0" />
                <span>
                    {resultsPublic
                        ? "Open the winners screen — the full-screen reveal to project on the night. Save first if you have just ticked the box."
                        : "Preview the winners screen — sealed, exactly as everyone else sees it right now."}
                </span>
            </Link>

            <Button onClick={() => void handleSave()} disabled={saving} className="mt-6">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save settings"}
            </Button>
        </div>
    );
};

export default AwardsSettings;
