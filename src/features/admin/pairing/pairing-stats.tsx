"use client";

import { useEffect, useState } from "react";
import { Ban, Banknote, CalendarHeart, Clock, HeartHandshake, UserRound } from "lucide-react";

import { getPairingStatsForAdmin } from "@/actions/admin.action";
import { site } from "@/config/site";
import type { PairingStats as Stats } from "@/services/pairing.service";
import DayChart from "../day-chart";
import StatGrid, { type Tile } from "../stat-grid";
import PairingSplit from "./pairing-split";

/** Naira, whole — kobo has never once mattered on this screen. */
const money = (value: number): string =>
    `${site.payment.currency}${value.toLocaleString()}`;

/**
 * Pairing at a glance.
 *
 * The number organizers actually chase is the pending one: those are people who
 * paired and haven't paid, and each is a conversation somebody has to have
 * before the night.
 */
const PairingStats = (): React.JSX.Element => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async (): Promise<void> => {
            setStats(await getPairingStatsForAdmin());
            setLoading(false);
        };
        void load();
    }, []);

    if (loading) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }
    if (!stats) {
        return (
            <p className="mt-6 text-center text-sm text-muted-foreground">
                Couldn&apos;t load pairing stats.
            </p>
        );
    }

    const pairedPct =
        stats.finalists === 0 ? 0 : Math.round((stats.pairedFinalists / stats.finalists) * 100);

    const tiles: Tile[] = [
        {
            label: "Paired",
            value: String(stats.approved),
            hint: `${stats.pairedFinalists} finalists — ${pairedPct}% of ${stats.finalists}`,
            icon: HeartHandshake,
        },
        {
            label: "Awaiting payment",
            value: String(stats.pending),
            hint:
                stats.pending > 0
                    ? `${money(stats.pendingRevenue)} still to come in`
                    : "nothing outstanding",
            icon: Clock,
        },
        {
            label: "Still single",
            value: String(stats.single),
            hint: "no live pairing at all",
            icon: UserRound,
        },
        // {
        //     label: "Collected",
        //     value: money(stats.confirmedRevenue),
        //     hint: `${stats.approved} approved transfer${stats.approved === 1 ? "" : "s"}`,
        //     icon: Banknote,
        // },
        {
            label: "Cancelled",
            value: String(stats.cancelled),
            hint: "conflicts and withdrawals",
            icon: Ban,
        },
    ];

    return (
        <div className="mt-5 space-y-3">
            <StatGrid tiles={tiles} />

            <div className="grid gap-3 lg:grid-cols-2">
                <PairingSplit
                    finalistPairs={stats.finalistPairs}
                    associatePairs={stats.associatePairs}
                />
                <DayChart
                    title="Pairings per day"
                    icon={CalendarHeart}
                    unit="pairings"
                    empty="Nobody has paired yet."
                    points={stats.timeline.map((point) => ({
                        day: point.day,
                        value: point.intents,
                    }))}
                />
            </div>
        </div>
    );
};

export default PairingStats;
