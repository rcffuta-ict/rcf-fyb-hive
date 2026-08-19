import { ImageResponse } from "next/og";

import { campaignArtwork, POSTER_SIZE } from "@/features/awards/campaign-artwork";
import { getCampaignCard } from "@/services/awards.service";
import { getSettings } from "@/services/settings.service";

/**
 * The downloadable campaign poster — 1080×1920, the WhatsApp Status and IG
 * Story shape.
 *
 * A poster travels where a link doesn't: it survives being screenshotted,
 * reposted and re-shared, and it carries the share code in readable text so
 * someone can still reach the page from a picture of it.
 */

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ code: string }> }
): Promise<Response> {
    const { code } = await params;
    const { awardsEnabled } = await getSettings();
    const card = await getCampaignCard(code, awardsEnabled);

    if (!card) return new Response("Not found", { status: 404 });

    // The display name can be a brand or clique name with spaces in it, so it
    // is slugged rather than interpolated — a filename with a space in it is
    // mangled differently by every chat app it passes through.
    const slug = card.shortName.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
    const filename = `fyb-${slug}-${card.shareCode}.png`.toLowerCase();

    return new ImageResponse(campaignArtwork(card, "poster"), {
        ...POSTER_SIZE,
        headers: {
            "Content-Disposition": `attachment; filename="${filename}"`,
            // Safe to cache: the poster only changes if the nickname or photo
            // does, and a stale one for an hour costs nothing.
            "Cache-Control": "public, max-age=3600",
        },
    });
}
