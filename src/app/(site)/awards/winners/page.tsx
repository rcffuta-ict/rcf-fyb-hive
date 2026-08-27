import type { Metadata } from "next";

import NotAvailableYet from "@/components/ui/not-available-yet";
import { site } from "@/config/site";
import { WinnersReveal } from "@/features/awards";
import { getPublishedWinners } from "@/services/awards.service";

export const metadata: Metadata = {
    title: `Winners — ${site.name}`,
    description: `The winners of the ${site.event.title} awards.`,
};

/**
 * The winners screen — the one projected in the hall on the night.
 *
 * Dynamic per request, and deliberately not cached at all: this page's whole
 * job is to flip from "not yet" to the results the moment an admin publishes,
 * and a cached shell would mean the hall's screen still saying "not yet" while
 * the dashboard says otherwise.
 *
 * Note what it does *not* check: whether voting is open. Voting being closed is
 * the normal state by the time anyone opens this — the ceremony happens after
 * the ballot shuts. The only gate is publication, and `getPublishedWinners`
 * holds it.
 */
export const dynamic = "force-dynamic";

export default async function WinnersPage(): Promise<React.JSX.Element> {
    const reveal = await getPublishedWinners();

    if (!reveal) {
        return (
            <NotAvailableYet
                title="Not announced yet"
                description="The votes are in and sealed. The winners appear here the moment the organizers read them out."
            />
        );
    }

    if (reveal.categories.length === 0) {
        return (
            <NotAvailableYet
                title="Nothing to announce"
                description="Results are published, but no award is running this year. Check back once a category is on the ballot."
            />
        );
    }

    return <WinnersReveal reveal={reveal} />;
}
