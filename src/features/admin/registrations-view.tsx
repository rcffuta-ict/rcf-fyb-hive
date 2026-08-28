"use client";

import { useState } from "react";
import { DoorOpen, Users } from "lucide-react";

import CheckInManagersPanel from "./check-in/check-in-managers-panel";
import PanelTabs, { type PanelTab } from "./panel-tabs";
import RegistrationsPanel from "./registrations-panel";

/**
 * The registrations tab and the people who staff the door, side by side.
 *
 * The check-in team is drawn from the registration team, and adding somebody to
 * it is a registration-desk job — so it lives here rather than beside the
 * pairings, which are about money.
 */
type View = "list" | "managers";

const VIEWS: PanelTab<View>[] = [
    { key: "list", label: "Registrations", icon: Users },
    { key: "managers", label: "Check-in team", icon: DoorOpen },
];

const RegistrationsView = (): React.JSX.Element => {
    const [view, setView] = useState<View>("list");

    return (
        <div className="mt-5">
            <PanelTabs tabs={VIEWS} active={view} onChange={setView} />
            {view === "list" && <RegistrationsPanel />}
            {view === "managers" && <CheckInManagersPanel />}
        </div>
    );
};

export default RegistrationsView;
