"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * The pill switcher inside a dashboard tab.
 *
 * Lifted out of the awards panel so pairing gets the identical control rather
 * than a lookalike — two switchers that drift apart is exactly how an admin
 * screen starts feeling improvised.
 */

export type PanelTab<T extends string> = {
    key: T;
    label: string;
    icon: LucideIcon;
};

const PanelTabs = <T extends string>({
    tabs,
    active,
    onChange,
}: {
    tabs: PanelTab<T>[];
    active: T;
    onChange: (key: T) => void;
}): React.JSX.Element => (
    <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
            <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                aria-pressed={active === key}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    active === key
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                )}
            >
                <Icon size={14} />
                {label}
            </button>
        ))}
    </div>
);

export default PanelTabs;
