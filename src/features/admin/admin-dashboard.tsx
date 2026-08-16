"use client";

import { useState } from "react";
import { HeartHandshake, Trophy, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import AwardsPanel from "./awards/awards-panel";
import DashboardHeader from "./dashboard-header";
import PairingPanel from "./pairing/pairing-panel";
import RegistrationsPanel from "./registrations-panel";

/**
 * One tab per feature, each owning its own stats and settings.
 *
 * There is deliberately no global Settings tab: everything it held was pairing
 * configuration, and keeping the switch that opens pairing two tabs away from
 * the pairings was the kind of split that gets a fee changed on the wrong night.
 */
type Tab = "registrations" | "pairings" | "awards";

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "registrations", label: "Registrations", icon: Users },
    { key: "pairings", label: "Pairings", icon: HeartHandshake },
    { key: "awards", label: "Awards", icon: Trophy },
];

const AdminDashboard = (): React.JSX.Element => {
    const [tab, setTab] = useState<Tab>("registrations");

    return (
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <DashboardHeader />

            <div
                role="tablist"
                aria-label="Admin sections"
                className="mt-6 flex gap-1 overflow-x-auto border-b border-border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            {tab === "pairings" && <PairingPanel />}
            {tab === "awards" && <AwardsPanel />}
        </section>
    );
};

export default AdminDashboard;
