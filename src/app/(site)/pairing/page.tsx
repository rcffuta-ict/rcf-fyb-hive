import type { Metadata } from "next";

import NotAvailableYet from "@/components/ui/not-available-yet";
import { PairingFlow } from "@/features/pairing";
import { isFeatureLive } from "@/services/settings.service";
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
    const live = await isFeatureLive("pairing");

    if (!live) {
        return (
            <NotAvailableYet
                title="Pairing opens soon"
                description="No date, no entry. When pairing opens, you'll redeem your consent token here and lock in the person you're coming with."
            />
        );
    }

    return <PairingFlow />;
}
