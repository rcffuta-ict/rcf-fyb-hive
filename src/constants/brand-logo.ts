/**
 * What counts as an acceptable brand logo.
 *
 * A logo goes on a ballot card next to portraits that were all validated the
 * same way, so it needs its own floor — otherwise one brand arrives as a crisp
 * square mark and the next as a blurry screenshot of a WhatsApp status, and the
 * ballot has quietly decided the race on image quality. These are checked in
 * two places, against the same numbers: in the browser before upload, and again
 * on the server, which is the one that counts.
 *
 * Deliberately NOT a face check. `uploadProfileImage` requires exactly one
 * clear face; a logo usually has none, and rejecting a wordmark for having no
 * face would be the wrong rule applied confidently.
 */

export const BRAND_LOGO = {
    /** SVG is excluded on purpose: it is executable markup, not a picture. */
    acceptedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const,
    maxSizeMb: 3,
    /** Below this, the mark is visibly soft on a retina ballot card. */
    minDimension: 400,
    /** Above this is a photo someone dropped in, not a logo. */
    maxDimension: 4000,
    /**
     * Width ÷ height. The card gives a logo a near-square box, so a banner at
     * 5:1 renders as a sliver with the brand name unreadable. Wide wordmarks
     * are common and legitimate, so the range is generous rather than square.
     */
    minAspect: 0.4,
    maxAspect: 2.5,
} as const;

export const BRAND_LOGO_HINT =
    `PNG, JPEG or WEBP · at least ${BRAND_LOGO.minDimension}×${BRAND_LOGO.minDimension}px · ` +
    `roughly square to 2.5:1 wide · max ${BRAND_LOGO.maxSizeMb}MB`;

/**
 * Check dimensions against the standard. Shared so the browser and the server
 * cannot drift into disagreeing about what is acceptable — a client that
 * accepts what the server rejects is a form that fails after the work.
 *
 * Returns a message to show, or null when the logo passes.
 */
export const checkLogoDimensions = (width: number, height: number): string | null => {
    if (width < BRAND_LOGO.minDimension || height < BRAND_LOGO.minDimension) {
        return `That logo is too small. Use one at least ${BRAND_LOGO.minDimension}×${BRAND_LOGO.minDimension}px — anything less looks soft on the ballot card.`;
    }
    if (width > BRAND_LOGO.maxDimension || height > BRAND_LOGO.maxDimension) {
        return `That image is ${width}×${height}px — far larger than a logo needs to be. Use an exported logo rather than a full-size photo.`;
    }

    const aspect = width / height;
    if (aspect < BRAND_LOGO.minAspect) {
        return "That logo is much taller than it is wide, so it would render as a sliver on the ballot. Use a squarer version of the mark.";
    }
    if (aspect > BRAND_LOGO.maxAspect) {
        return "That logo is a wide banner. Use the square or stacked version of the mark — a banner is unreadable at ballot-card size.";
    }
    return null;
};

/**
 * Whether a pasted logo URL is one we can render.
 *
 * `https` only: a ballot served over TLS that pulls a logo over plain HTTP gets
 * the image blocked as mixed content, and the brand shows up blank on the one
 * page where being seen is the entire point.
 */
export const isRenderableLogoUrl = (value: string): boolean => {
    try {
        const url = new URL(value.trim());
        return url.protocol === "https:";
    } catch {
        return false;
    }
};
