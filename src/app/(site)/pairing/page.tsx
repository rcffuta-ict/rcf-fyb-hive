import type { Metadata } from "next";

import NotAvailableYet from "@/components/ui/not-available-yet";
import { PairingFlow } from "@/features/pairing";
import { getSettings } from "@/services/settings.service";
import { site } from "@/config/site";

export const metadata: Metadata = {
    title: `Pair up — ${site.name}`,
    description: `No date, no entry. Redeem your consent token and lock in your ${site.event.title} pairing.`,
};

/**
 * The flag is read from the database on every request, so an admin toggling
 * pairing on takes effect immediately — hence no static generation here.
 */
export const dynamic = "force-dynamic";

export default async function PairingPage(): Promise<React.JSX.Element> {
    const { pairingEnabled, pairingRan } = await getSettings();

    if (!pairingEnabled) {
        // "Off" means two opposite things, and the page used to say the same
        // sentence for both. Before pairing opens it genuinely hasn't started;
        // after it closes, telling somebody it's "opening soon" is how a person
        // who has actually missed the deadline goes on waiting for it.
        return pairingRan ? (
            <NotAvailableYet
                title="Pairing has closed"
                description="The window for registering the person you're coming with is shut. If you paired in time, you're set — check the email that confirmed it. If you didn't, speak to an organizer directly."
            />
        ) : (
            <NotAvailableYet
                title="Pairing opens soon"
                description="No date, no entry. When pairing opens, you'll redeem your consent token here and lock in the person you're coming with."
            />
        );
    }

    return <PairingFlow />;
}
