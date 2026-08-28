/**
 * The absolute base every generated URL hangs off.
 *
 * Lives here rather than in the root layout because two very different things
 * need the same answer: link previews in metadata, and the QR code printed and
 * pasted at the door. A QR code pointing at localhost is a poster that has to
 * be reprinted, so there is exactly one definition of this.
 *
 * Vercel supplies VERCEL_PROJECT_PRODUCTION_URL; NEXT_PUBLIC_SITE_URL overrides
 * it for any other host.
 */
export const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3004");

/** An absolute URL for a path like "/tables". */
export const absoluteUrl = (path: string): string =>
    new URL(path, siteUrl).toString();
