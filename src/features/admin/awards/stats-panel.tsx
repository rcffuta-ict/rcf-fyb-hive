"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert, RefreshCw } from "lucide-react";

import { getAwardStats } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import CategoryLeaderboard from "./category-leaderboard";
import RaceInsights from "./race-insights";
import StatTiles from "./stat-tiles";
import TurnoutPanel from "./turnout-panel";
import type { AwardStats } from "@/types/awards.types";

/** Turnout, totals and every category's standings. Admin eyes only until published. */
const StatsPanel = (): React.JSX.Element => {
    const [stats, setStats] = useState<AwardStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const [version, setVersion] = useState(0);
    const reload = (): void => setVersion((current) => current + 1);

    useEffect(() => {
        const load = async (): Promise<void> => {
            setRefreshing(true);
            setStats(await getAwardStats());
            setRefreshing(false);
        };
        void load();
    }, [version]);

    if (!stats) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    return (
        <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Live tally. Nobody outside this dashboard sees these numbers until you
                    publish results in Settings.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={reload}
                    disabled={refreshing}
                >
                    <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                </Button>
            </div>

            <StatTiles stats={stats} />

            {stats.undocumentedCategories.length > 0 && (
                <div className="flex items-start gap-2 rounded-token border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <span>
                        No published criteria for:{" "}
                        {stats.undocumentedCategories.join(", ")}. These are hidden from every
                        ballot, and voting cannot open while they are live — archive them, or
                        add the award to the standard and deploy.
                    </span>
                </div>
            )}

            {(stats.emptyCategories.length > 0 || stats.thinCategories.length > 0) && (
                <div className="space-y-2 rounded-token border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600">
                    {stats.emptyCategories.length > 0 && (
                        <p className="flex items-start gap-2">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>
                                No candidates yet in: {stats.emptyCategories.join(", ")}. These
                                render as empty rails on the ballot.
                            </span>
                        </p>
                    )}
                    {stats.thinCategories.length > 0 && (
                        <p className="flex items-start gap-2">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>
                                Only one or two standing in: {stats.thinCategories.join(", ")}.
                                A two-horse race is a coin toss — nominate more while you can.
                            </span>
                        </p>
                    )}
                </div>
            )}

            {stats.results.length === 0 ? (
                <p className="surface p-8 text-center text-sm text-muted-foreground">
                    Nothing to tally yet — add a category and some candidates first.
                </p>
            ) : (
                <>
                    <RaceInsights
                        results={stats.results}
                        multiLeaders={stats.multiLeaders}
                    />
                    <TurnoutPanel levels={stats.levels} timeline={stats.timeline} />
                    <CategoryLeaderboard results={stats.results} />
                </>
            )}
        </div>
    );
};

export default StatsPanel;
