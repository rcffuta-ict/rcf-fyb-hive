/**
 * Cloudinary delivery URLs.
 *
 * Photos are uploaded once, at whatever size the registrant's phone produced,
 * and then rendered in a dozen places at a dozen sizes. Cloudinary can do that
 * work in the URL, so nothing here talks to an API or needs a key — these are
 * pure string transforms over the `secure_url` the upload already returned.
 *
 * Two things this buys us:
 *
 *   • **Face framing.** `c_thumb,g_face` crops around the detected face instead
 *     of the middle of the frame. Registration already guarantees exactly one
 *     clear face per photo, so this is reliable; when detection somehow fails
 *     Cloudinary falls back to a centre crop, which is what we had anyway.
 *   • **Weight.** A link-preview renderer that fetches a 1MB original will be
 *     abandoned by the scraper before it finishes, and the shared link unfurls
 *     blank.
 */

const HOST = "res.cloudinary.com";
const UPLOAD = "/image/upload/";

/** A path segment that is a transform, e.g. `c_thumb,g_face,w_400` or `f_auto`. */
const isTransformSegment = (segment: string): boolean =>
    /^[a-z]{1,3}_[^/]+$/.test(segment.split(",")[0] ?? "");

/**
 * Splice a transform into a Cloudinary URL, replacing any transform already
 * there so repeated application can't nest crops. Anything that isn't a
 * Cloudinary upload URL (an S3 leftover, a placeholder, an empty string) is
 * handed back untouched — callers must never have to check first.
 */
const withTransform = (url: string, params: string[]): string => {
    if (!url || !url.includes(HOST) || !url.includes(UPLOAD)) return url;

    const [origin, rest] = url.split(UPLOAD);
    const segments = rest.split("/");
    if (segments.length > 1 && isTransformSegment(segments[0])) segments.shift();

    return `${origin}${UPLOAD}${params.join(",")}/${segments.join("/")}`;
};

type PortraitOptions = {
    width: number;
    /** Defaults to a square. */
    height?: number;
    /**
     * How tightly to crop around the face box. 1.0 is the face alone; lower
     * pulls back. 0.7 lands on head-and-shoulders, which is what a portrait
     * wants — a face cropped at the chin reads as a mugshot.
     */
    zoom?: number;
    /**
     * `auto` lets Cloudinary negotiate WebP/AVIF with the browser. Force `jpg`
     * for anything decoded outside a browser — satori, which renders our OG
     * images, handles PNG and JPEG only and silently drops everything else.
     */
    format?: "auto" | "jpg";
};

/**
 * A face-centred portrait at a known size. `dpr_auto` is deliberately absent:
 * these URLs are consumed by `next/image`, which does its own density work, and
 * by satori, which has no density at all.
 */
export const facePortrait = (
    url: string,
    { width, height = width, zoom = 0.7, format = "auto" }: PortraitOptions
): string =>
    withTransform(url, [
        "c_thumb",
        "g_face",
        `z_${zoom}`,
        `w_${Math.round(width)}`,
        `h_${Math.round(height)}`,
        `f_${format}`,
        "q_auto:good",
    ]);
