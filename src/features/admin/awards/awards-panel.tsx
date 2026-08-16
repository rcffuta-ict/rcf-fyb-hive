"use client";

import { useState } from "react";
import { BarChart3, ListChecks, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import AwardsSettings from "./awards-settings";
import CategoriesPanel from "./categories-panel";
import StatsPanel from "./stats-panel";

type View = "categories" | "stats" | "settings";

const VIEWS: { key: View; label: string; icon: typeof ListChecks }[] = [
    { key: "categories", label: "Categories", icon: ListChecks },
    { key: "stats", label: "Stats", icon: BarChart3 },
    { key: "settings", label: "Settings", icon: SlidersHorizontal },
];

/** The awards tab: set the ballot up, watch it fill, decide when it opens. */
const AwardsPanel = (): React.JSX.Element => {
    const [view, setView] = useState<View>("categories");

    return (
        <div className="mt-5">
            <div className="flex flex-wrap gap-2">
                {VIEWS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setView(key)}
                        aria-pressed={view === key}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                            view === key
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {view === "categories" && <CategoriesPanel />}
            {view === "stats" && <StatsPanel />}
            {view === "settings" && <AwardsSettings />}
        </div>
    );
};

export default AwardsPanel;
