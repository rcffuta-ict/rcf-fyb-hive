import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { site } from "@/config/site";
import CampaignPage from "@/features/awards/campaign-page";
import { getCampaignCard } from "@/services/awards.service";
import { getSettings } from "@/services/settings.service";

/**
 * A candidate's campaign page.
 *
 * Deliberately public: the whole point is that it survives being forwarded
 * through WhatsApp to someone who has never opened this site. It shows a name,
 * a face, a nickname and a category — nothing about standings, and nothing that
 * lets the visitor vote without resolving an RCF profile first.
 */

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

const load = async (code: string) => {
    const { awardsEnabled } = await getSettings();
    return getCampaignCard(code, awardsEnabled);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params;
    const card = await load(code);

    if (!card) return { title: `Awards — ${site.name}` };

    const name = card.displayName;
    const title = `Vote ${name} — ${card.categoryTitle}`;
    const description = `“${card.nickname}” is standing for ${card.categoryTitle} at the ${site.event.title}. One vote each, and it takes ten seconds.`;

    // No `images` here: the sibling opengraph-image.tsx generates the preview,
    // and Next wires it up automatically.
    return {
        title,
        description,
        openGraph: { title, description, type: "profile" },
        twitter: { card: "summary_large_image", title, description },
    };
}

export default async function CandidateCampaignPage({
    params,
}: Props): Promise<React.JSX.Element> {
    const { code } = await params;
    const card = await load(code);

    // An unknown or archived code 404s rather than explaining itself — a link
    // to a race that is off the ballot should look like a dead link.
    if (!card) notFound();

    return <CampaignPage card={card} />;
}
