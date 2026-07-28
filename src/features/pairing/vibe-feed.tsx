"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart, Users } from "lucide-react";

import { getPairFeed, getPairStats, type FeedItem, type PairStats } from "@/actions/pairing.action";

/**
 * The live "vibes" strip.
 *
 * Text arrives pre-rendered from the server so no surname or unit ever reaches
 * the browser — see `getPairFeed`. It refreshes on an interval rather than a
 * socket: this is atmosphere, not a chat app, and a poll every half minute
 * costs nothing.
 */

const REFRESH_MS = 30_000;

const Stat = ({
    icon: Icon,
    value,
    label,
}: {
    icon: typeof Heart;
    value: number;
    label: string;
}): React.JSX.Element => (
    <div className="flex items-center gap-2 rounded-token bg-accent/50 px-3.5 py-2">
        <Icon size={15} className="text-primary" />
        <span className="text-sm font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
    </div>
);

const VibeFeed = (): React.JSX.Element | null => {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [stats, setStats] = useState<PairStats | null>(null);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            const [feed, counts] = await Promise.all([getPairFeed(), getPairStats()]);
            if (!active) return;
            setItems(feed);
            setStats(counts);
        };

        void load();
        const timer = setInterval(() => void load(), REFRESH_MS);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    if (items.length === 0 && !stats) return null;

    return (
        <div className="mx-auto mt-12 max-w-md">
            {stats && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Stat icon={Heart} value={stats.locked} label="locked in" />
                    <Stat icon={Flame} value={stats.pending} label="awaiting payment" />
                    <Stat icon={Users} value={stats.single} label="still single" />
                </div>
            )}

            {items.length > 0 && (
                <div className="surface mt-4 overflow-hidden p-0">
                    <p className="border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-primary">
                        Happening now
                    </p>
                    <ul className="divide-y divide-border">
                        <AnimatePresence initial={false}>
                            {items.map((item) => (
                                <motion.li
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-5 py-3 text-sm text-foreground/80"
                                >
                                    {item.text}
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VibeFeed;
