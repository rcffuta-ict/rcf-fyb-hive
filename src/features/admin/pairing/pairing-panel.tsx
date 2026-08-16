"use client";

import { useState } from "react";
import { BarChart3, HeartHandshake, SlidersHorizontal } from "lucide-react";

import PanelTabs, { type PanelTab } from "../panel-tabs";
import PairIntentsPanel from "./pair-intents-panel";
import PairingSettings from "./pairing-settings";
import PairingStats from "./pairing-stats";

type View = "requests" | "stats" | "settings";

const VIEWS: PanelTab<View>[] = [
    { key: "requests", label: "Requests", icon: HeartHandshake },
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "settings", label: "Settings", icon: SlidersHorizontal },
];

/**
 * The pairing tab: approve the payments, watch the numbers, set the terms.
 *
 * Shaped like the awards tab on purpose — the fee and the bank account used to
 * live in a separate top-level Settings tab, which meant the switch that opens
 * pairing sat nowhere near the pairings themselves.
 */
const PairingPanel = (): React.JSX.Element => {
    const [view, setView] = useState<View>("requests");

    return (
        <div className="mt-5">
            <PanelTabs tabs={VIEWS} active={view} onChange={setView} />

            {view === "requests" && <PairIntentsPanel />}
            {view === "stats" && <PairingStats />}
            {view === "settings" && <PairingSettings />}
        </div>
    );
};

export default PairingPanel;
