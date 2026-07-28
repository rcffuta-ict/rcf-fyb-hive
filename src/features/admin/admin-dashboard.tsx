"use client";

import { useState } from "react";
import { HeartHandshake, Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import DashboardHeader from "./dashboard-header";
import PairIntentsPanel from "./pair-intents-panel";
import RegistrationsPanel from "./registrations-panel";
import SettingsPanel from "./settings-panel";

type Tab = "registrations" | "pairings" | "settings";

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "registrations", label: "Registrations", icon: Users },
    { key: "pairings", label: "Pairings", icon: HeartHandshake },
    { key: "settings", label: "Settings", icon: Settings },
];

const AdminDashboard = (): React.JSX.Element => {
    const [tab, setTab] = useState<Tab>("registrations");

    return (
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <DashboardHeader />

            <div
                role="tablist"
                aria-label="Admin sections"
                className="mt-6 flex gap-1 border-b border-border"
            >
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        role="tab"
                        type="button"
                        aria-selected={tab === key}
                        onClick={() => setTab(key)}
                        className={cn(
                            "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                            tab === key
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {tab === "registrations" && <RegistrationsPanel />}
            {tab === "pairings" && <PairIntentsPanel />}
            {tab === "settings" && <SettingsPanel />}
        </section>
    );
};

export default AdminDashboard;
