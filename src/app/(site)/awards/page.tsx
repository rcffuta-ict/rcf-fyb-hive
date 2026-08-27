import type { Metadata } from "next";

import { getBallot } from "@/actions/awards.action";
import NotAvailableYet from "@/components/ui/not-available-yet";
import { site } from "@/config/site";
import { BallotBoard, VoterGate, VotingClosed } from "@/features/awards";
import { getCampaignCard, getWinnersReveal } from "@/services/awards.service";
import { isFeatureLive } from "@/services/settings.service";

export const metadata: Metadata = {
    title: `Awards — ${site.name}`,
    description: `Celebrate the set. Vote for the standout finalists of the ${site.event.title}.`,
};

/**
 * Both the feature flag and the voter's own cookie are read per request — an
 * admin opening voting takes effect immediately, and a cached ballot would show
 * one member another member's picks.
 */
export const dynamic = "force-dynamic";

export default async function AwardsPage({
    searchParams,
}: {
    searchParams: Promise<{ pick?: string }>;
}): Promise<React.JSX.Element> {
    const live = await isFeatureLive("awards");

    if (!live) {
        // Voting being off means one of two very different things, and the page
        // used to say the same thing for both. Before a season starts there is
        // genuinely nothing here. After the ballot shuts there are categories,
        // criteria and a full slate of nominees — and the people arriving are
        // the most interested traffic this page ever gets. Sending them to a
        // "coming soon" panel would be both untrue and a wasted moment.
        const reveal = await getWinnersReveal();
        const anythingToShow =
            reveal.published ||
            reveal.categories.some((category) => category.nominees.length > 0);

        if (!anythingToShow) {
            return (
                <NotAvailableYet
                    title="Awards voting soon"
                    description="Celebrate the set. When voting opens, you'll crown the standout finalists right here."
                />
            );
        }

        return <VotingClosed reveal={reveal} />;
    }

    const [{ pick }, ballot] = await Promise.all([searchParams, getBallot()]);

    // `?pick=<shareCode>` arrives from a campaign link. It scrolls the ballot to
    // that candidate and rings their card — it never casts the vote. Being
    // carried to a ballot with a vote already cast in your name is exactly the
    // thing that would make people distrust the whole poll.
    const spotlight = pick ? await getCampaignCard(pick, true) : null;

    if (!ballot) {
        return <VoterGate spotlightName={spotlight?.shortName ?? null} />;
    }

    return (
        <BallotBoard
            ballot={ballot}
            spotlightCandidateId={spotlight?.candidateId ?? null}
        />
    );
}
