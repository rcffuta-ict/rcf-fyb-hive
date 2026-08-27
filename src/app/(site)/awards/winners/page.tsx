import type { Metadata } from "next";

import NotAvailableYet from "@/components/ui/not-available-yet";
import { site } from "@/config/site";
import { WinnersReveal } from "@/features/awards";
import { getWinnersReveal } from "@/services/awards.service";

export const metadata: Metadata = {
    title: `Winners — ${site.name}`,
    description: `The winners of the ${site.event.title} awards.`,
};

/**
 * The winners screen — the one projected in the hall on the night.
 *
 * Reachable at every stage, on purpose. Before the organizers publish it is a
 * hall of sealed envelopes: every award, its criteria, and its nominees behind
 * a blur. That is a far better wait than a "coming soon" panel, and it costs
 * nothing to be honest about, because the sealing happens on the server —
 * `getWinnersReveal` does not put a winner in the payload until publication.
 *
 * Dynamic per request and never cached: this page's whole job is to flip the
 * moment an admin publishes, and a cached shell would leave the hall's screen
 * still sealed while the dashboard said otherwise.
 *
 * Note what it does *not* check: whether voting is open. Voting being closed is
 * the normal state by the time anyone gathers to watch this — the ceremony
 * happens after the ballot shuts.
 */
export const dynamic = "force-dynamic";

export default async function WinnersPage(): Promise<React.JSX.Element> {
    const reveal = await getWinnersReveal();

    if (reveal.categories.length === 0) {
        return (
            <NotAvailableYet
                title="Nothing to announce"
                description="No award is running this year yet. Once a category is on the ballot, its envelope appears here."
            />
        );
    }

    return <WinnersReveal reveal={reveal} />;
}
