"use client";

import { useState } from "react";
import { BarChart3, ListChecks, SlidersHorizontal } from "lucide-react";

import PanelTabs, { type PanelTab } from "../panel-tabs";
import AwardsSettings from "./awards-settings";
import CategoryWorkbench from "./category-workbench";
import StatsPanel from "./stats-panel";

type View = "categories" | "stats" | "settings";

const VIEWS: PanelTab<View>[] = [
    { key: "categories", label: "Categories", icon: ListChecks },
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "settings", label: "Settings", icon: SlidersHorizontal },
];

/** The awards tab: set the ballot up, watch it fill, decide when it opens. */
const AwardsPanel = (): React.JSX.Element => {
    const [view, setView] = useState<View>("categories");

    return (
        <div className="mt-5">
            <PanelTabs tabs={VIEWS} active={view} onChange={setView} />

            {view === "categories" && <CategoryWorkbench />}
            {view === "stats" && <StatsPanel />}
            {view === "settings" && <AwardsSettings />}
        </div>
    );
};

export default AwardsPanel;
