import { ImageResponse } from "next/og";

import { site } from "@/config/site";
import { campaignArtwork, OG_SIZE } from "@/features/awards/campaign-artwork";
import { getCampaignCard } from "@/services/awards.service";
import { getSettings } from "@/services/settings.service";

/**
 * The link preview.
 *
 * This is the whole campaign feature, really: a forwarded link that unfurls
 * into a face and a nickname gets opened, and a bare URL does not.
 */

export const alt = `Vote in the ${site.event.title} awards`;
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Scrapers refetch a link every time it is forwarded, and each miss costs a
 * database read plus a full satori render. An hour of staleness only matters if
 * a nickname or photo changed in that hour, which nothing here is worth.
 */
export const revalidate = 3600;

/** Shown when there is nothing to show. A plain card still unfurls; a 500 doesn't. */
const fallback = (): React.JSX.Element => (
    <div
        style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1114",
            color: "#e8c77b",
            fontSize: 56,
            fontWeight: 700,
        }}
    >
        {site.event.title} — Awards
    </div>
);

export default async function Image({
    params,
}: {
    params: Promise<{ code: string }>;
}): Promise<ImageResponse> {
    const [{ code }, { awardsEnabled }] = await Promise.all([params, getSettings()]);
    const card = await getCampaignCard(code, awardsEnabled);

    // A dead code still has to return an image — a broken preview in a chat is
    // worse than a plain one.
    if (!card) return new ImageResponse(fallback(), size);

    try {
        return new ImageResponse(campaignArtwork(card, "og"), size);
    } catch (err) {
        // Almost always the portrait fetch: a deleted Cloudinary asset, or the
        // CDN having a bad minute. Degrade to the plain card rather than 500,
        // which would leave the link naked in every chat it lands in.
        console.error(`campaign OG render failed for ${code}:`, err);
        return new ImageResponse(fallback(), size);
    }
}
