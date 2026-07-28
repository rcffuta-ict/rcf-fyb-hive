import { fybEnv } from "./env.ts";
import { COLORS, FONTS } from "./theme.ts";

/**
 * The branded email shell.
 *
 * Constraints that shape every decision here:
 *  • Table-based layout + inline styles only — Outlook ignores <style> blocks
 *    and most clients strip classes.
 *  • Images are blocked by default in many clients, so the mail must read
 *    correctly with every <img> missing. The consent token is therefore live
 *    text in a styled cell, never an image, and the header keeps its colour
 *    from `bgcolor` rather than a background image.
 *  • Gmail/Outlook auto-invert light emails, which turns gold-on-ivory to mud.
 *    `color-scheme: light` plus an explicit background-color on *every* cell
 *    leaves inversion nothing loose to grab.
 */

const SITE_URL = fybEnv("PUBLIC_SITE_URL") ?? "https://fyb.rcffuta.com";
const SUPPORT_EMAIL = fybEnv("SUPPORT_EMAIL") ?? "ict@rcffuta.com";
const LINK_STYLE = `color:${COLORS.gold};text-decoration:underline;`;

/**
 * Email clients ignore stylesheets, so link styling is inlined on every <a>.
 *
 * Anchors that already declare their own `color:` are left alone — otherwise
 * this appends gold-and-underlined to the CTA button too, and a burgundy button
 * ends up with gold underlined text sitting on it.
 */
const styleLinks = (html: string): string =>
    html.replace(/<a\b([^>]*)>/gi, (_full, attrs: string) => {
        if (/\bstyle\s*=[^>]*\bcolor\s*:/i.test(attrs)) return `<a${attrs}>`;

        if (/\bstyle\s*=/i.test(attrs)) {
            return `<a${attrs.replace(
                /\bstyle\s*=\s*"([^"]*)"/i,
                (_m, existing: string) => `style="${existing};${LINK_STYLE}"`
            )}>`;
        }
        return `<a${attrs} style="${LINK_STYLE}">`;
    });

/**
 * A brand logo, downsized through Cloudinary at 2x the display height.
 * The source PNGs are 60–80KB each; shipping three raw would put ~200KB of
 * chrome into every inbox, most of a Gmail clipping budget spent on decoration.
 *
 * PNG is correct here and JPEG is not: these are flat-colour marks with sharp
 * edges and transparency, which JPEG turns into ringing artefacts and an opaque
 * box. They compress to 2–6KB as PNG anyway. See `renderAvatar` for why photos
 * take the opposite decision.
 */
const logo = (url: string | undefined, alt: string, height: number): string => {
    if (!url) return `<span style="color:${COLORS.goldHighlight};font-size:13px;">${alt}</span>`;

    const src = url.includes("/image/upload/")
        ? url.replace("/image/upload/", `/image/upload/h_${height * 2},c_limit,f_png,q_auto/`)
        : url;

    return `<img src="${src}" alt="${alt}" height="${height}" style="display:block;border:0;outline:none;height:${height}px;width:auto;" />`;
};

/**
 * The finalist's registration photo as a rounded-square avatar with a thin
 * gold outline.
 *
 * Cloudinary does the work: `g_face` centres on the face (registration photos
 * are face-verified, so there is always exactly one), `r_max` rounds it, and
 * `b_rgb` fills the corners with the header burgundy rather than transparency —
 * Outlook renders alpha unreliably, and a grey-cornered circle looks broken.
 * Rendered at 2x for retina and displayed at 80px.
 *
 * Format, measured on a real photo at this exact transform:
 *   PNG 15.3KB · JPEG 6.2KB · WebP 4.3KB
 * JPEG wins. WebP is smaller still, but Outlook on Windows renders through the
 * Word engine and shows nothing at all for it — a blank face in a third of
 * inboxes is not worth 2KB. `f_auto` is also wrong here: it negotiates on the
 * fetching client's Accept header, which for email is an image proxy rather
 * than the reader's actual client, so the format it picks is a coin flip.
 * Explicit `f_jpg` it is. The `b_rgb` backfill means we lose nothing to JPEG's
 * lack of transparency.
 *
 * Returns "" for anything that isn't a Cloudinary delivery URL, so the header
 * simply falls back to the logo rather than emitting a broken image.
 */
export const renderAvatar = (photoUrl: string | undefined): string => {
    if (!photoUrl || !photoUrl.includes("/image/upload/")) return "";

    const transform = [
        "c_thumb",
        "g_face",
        "z_0.7",
        "w_160",
        "h_160",
        // Rounded square, not a circle: r_16 at 2x renders as the 8px the CSS
        // `border-radius:10%` asks for, so clients that honour CSS and clients
        // that only see the baked-in shape agree.
        "r_16",
        `b_rgb:${COLORS.burgundy.slice(1)}`,
        // A thin outline, not a ring: 3px at 2x reads as a 1.5px hairline at the
        // 80px display size. Anything heavier turns into a frame and competes
        // with the token card for attention.
        `bo_3px_solid_rgb:${COLORS.goldHighlight.slice(1)}`,
        "f_jpg",
        "q_auto:good",
    ].join(",");

    const src = photoUrl.replace("/image/upload/", `/image/upload/${transform}/`);
    return `<img src="${src}" alt="" width="80" height="80" style="display:block;border:0;outline:none;width:80px;height:80px;border-radius:10%;" />`;
};

/**
 * The consent token card — deliberately the loudest thing in the message, so
 * it reads first in a lock-screen preview. Rendered by the worker rather than
 * stored in the editable template, so reworded copy can never break it.
 */
export const renderTokenBlock = (token: string): string => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 26px;">
  <tr>
    <td align="center" bgcolor="${COLORS.accent}" style="background-color:${COLORS.accent};border:2px solid ${COLORS.goldMid};border-radius:14px;padding:26px 18px;">
      <p style="margin:0 0 10px;font-family:${FONTS.body};font-size:11px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase;color:${COLORS.gold};">
        Your consent token
      </p>
      <p style="margin:0 0 12px;font-family:${FONTS.mono};font-size:32px;font-weight:bold;letter-spacing:5px;color:${COLORS.burgundy};">
        ${token}
      </p>
      <p style="margin:0;font-family:${FONTS.body};font-size:12px;line-height:19px;color:${COLORS.inkMuted};">
        Four characters, and capitals don't matter.<br />
        There's no O, I or L in there — nothing that can be misread.
      </p>
    </td>
  </tr>
</table>`;

/**
 * Numbered "what happens next" list. Built as a table with the numeral in its
 * own cell — `<ol>` styling is unreliable across clients, and a gold numeral
 * carries the brand better than a bullet.
 */
export const renderSteps = (steps: { title: string; body: string }[]): string => {
    const rows = steps
        .map(
            (step, index) => `
      <tr>
        <td width="34" valign="top" style="background-color:${COLORS.background};padding:0 0 14px;">
          <span style="display:inline-block;font-family:${FONTS.display};font-size:19px;line-height:19px;color:${COLORS.goldMid};">${index + 1}</span>
        </td>
        <td valign="top" style="background-color:${COLORS.background};padding:0 0 14px;font-family:${FONTS.body};font-size:14.5px;line-height:23px;color:${COLORS.ink};">
          <strong>${step.title}</strong><br />
          <span style="color:${COLORS.inkMuted};">${step.body}</span>
        </td>
      </tr>`
        )
        .join("");

    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 24px;">
  ${rows}
</table>`;
};

/** Callout for the one thing they must not get wrong. */
export const renderCallout = (html: string): string => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 26px;">
  <tr>
    <td bgcolor="${COLORS.accent}" style="background-color:${COLORS.accent};border-left:4px solid ${COLORS.goldMid};border-radius:0 10px 10px 0;padding:16px 18px;font-family:${FONTS.body};font-size:14px;line-height:23px;color:${COLORS.ink};">
      ${html}
    </td>
  </tr>
</table>`;

/**
 * Bulletproof-ish CTA button: a table cell with a background colour and an
 * anchor filling it. Padding lives on the <a> so the whole block is clickable
 * even in clients that collapse cell padding.
 */
export const renderButton = (label: string, href: string): string => `
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 26px;">
  <tr>
    <td bgcolor="${COLORS.burgundy}" style="background-color:${COLORS.burgundy};border-radius:10px;">
      <a href="${href}" style="display:inline-block;padding:13px 30px;font-family:${FONTS.body};font-size:14px;font-weight:bold;letter-spacing:0.4px;color:${COLORS.onDark};text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;

/** Event details strip. */
export const renderEventBlock = (event: {
    date: string;
    venue: string;
    dressCode: string;
}): string => {
    const row = (icon: string, label: string, value: string): string => `
      <tr>
        <td style="padding:5px 0;font-family:${FONTS.body};font-size:14px;line-height:22px;color:${COLORS.ink};background-color:${COLORS.background};">
          <span style="color:${COLORS.gold};">${icon}</span>&nbsp;
          <span style="color:${COLORS.inkMuted};">${label}</span>&nbsp;
          <strong>${value}</strong>
        </td>
      </tr>`;

    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 0 26px;border-top:1px solid ${COLORS.border};border-bottom:1px solid ${COLORS.border};padding:6px 0;">
  ${row("&#128197;", "When", event.date)}
  ${row("&#128205;", "Where", event.venue)}
  ${row("&#127913;", "Dress", event.dressCode)}
</table>`;
};

/** Wrap rendered body copy in the branded shell. */
export const wrapInEmailShell = (input: {
    bodyHtml: string;
    heading: string;
    eyebrow?: string;
    /** Inbox preview line, shown after the subject in most clients. */
    preheader?: string;
    /** Registration photo — rendered as the gold-ringed avatar in the header. */
    photoUrl?: string;
}): string => {
    const logoFyb = fybEnv("LOGO_FYB_URL");
    const logoRcffuta = fybEnv("LOGO_RCFFUTA_URL");
    const logoIct = fybEnv("LOGO_ICT_URL");
    const logoArmy = fybEnv("LOGO_ARMY_URL");
    const eyebrow = input.eyebrow ?? "FYB Dinner";
    const avatar = renderAvatar(input.photoUrl);

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${input.heading}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .shell-pad { padding: 24px 20px !important; }
        .shell-head { padding: 30px 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.background};">
    <!-- Preheader: the grey line after the subject in the inbox list. The
         trailing entities stop clients pulling body copy in after it. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${input.preheader ?? input.heading}
      ${"&#847;&zwnj;&nbsp;".repeat(60)}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="${COLORS.background}" style="background-color:${COLORS.background};padding:32px 12px;">
      <tr>
        <td align="center" style="background-color:${COLORS.background};">
          <!-- The width attribute must match max-width: Outlook's Word engine
               ignores max-width and obeys the attribute, so a mismatch renders
               narrower there than everywhere else. -->
          <table width="700" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;max-width:700px;background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:18px;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td class="shell-head" align="center" bgcolor="${COLORS.burgundy}" style="background-color:${COLORS.burgundy};background-image:linear-gradient(160deg,${COLORS.burgundy} 0%,${COLORS.burgundyDeep} 100%);padding:38px 28px 32px;">
                <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                  <tr><td align="center" style="padding-bottom:${avatar ? 16 : 0}px;">${logo(logoFyb, "FYB Hive", 44)}</td></tr>
                  ${avatar ? `<tr><td align="center">${avatar}</td></tr>` : ""}
                </table>
                <p style="margin:18px 0 8px;font-family:${FONTS.body};font-size:11px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;color:${COLORS.goldHighlight};">
                  ${eyebrow}
                </p>
                <h1 style="margin:0;font-family:${FONTS.display};font-size:27px;line-height:34px;font-weight:normal;color:${COLORS.onDark};">
                  ${input.heading}
                </h1>
              </td>
            </tr>

            <!-- Gold rule -->
            <tr>
              <td height="4" bgcolor="${COLORS.goldMid}" style="height:4px;line-height:4px;font-size:0;background-color:${COLORS.goldMid};background-image:linear-gradient(90deg,${COLORS.goldMid} 0%,${COLORS.goldHighlight} 50%,${COLORS.goldMid} 100%);">&nbsp;</td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="shell-pad" bgcolor="${COLORS.background}" style="background-color:${COLORS.background};padding:32px 34px;font-family:${FONTS.body};font-size:15.5px;line-height:26px;color:${COLORS.ink};">
                ${styleLinks(input.bodyHtml)}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" bgcolor="${COLORS.accent}" style="background-color:${COLORS.accent};border-top:1px solid ${COLORS.border};padding:24px 22px;">
                <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px;">
                  <tr>
                    <td style="padding:0 11px;background-color:${COLORS.accent};">${logo(logoRcffuta, "RCF FUTA", 30)}</td>
                    <td style="padding:0 11px;background-color:${COLORS.accent};">${logo(logoArmy, "Army of Light", 28)}</td>
                    <td style="padding:0 11px;background-color:${COLORS.accent};">${logo(logoIct, "RCFFUTA ICT", 26)}</td>
                  </tr>
                </table>
                <p style="margin:0 0 4px;font-family:${FONTS.body};font-size:12px;line-height:20px;color:${COLORS.ink};">
                  Presented by <strong>RCF FUTA</strong>
                </p>
                <p style="margin:0 0 14px;font-family:${FONTS.body};font-size:12px;line-height:20px;color:${COLORS.inkMuted};">
                  Brought to you by the <strong>300 Level Family</strong>, in tribute to the
                  <strong>Army of Light Family</strong>.<br />
                  Powered by the <strong>RCFFUTA ICT Team</strong>.
                </p>
                <p style="margin:0;font-family:${FONTS.body};font-size:11px;line-height:18px;color:${COLORS.inkMuted};">
                  You're getting this because you registered for the ${eyebrow} at
                  <a href="${SITE_URL}" style="${LINK_STYLE}">${SITE_URL.replace(/^https?:\/\//, "")}</a>.
                  Wasn't you? Tell us at
                  <a href="mailto:${SUPPORT_EMAIL}" style="${LINK_STYLE}">${SUPPORT_EMAIL}</a>
                  and we'll sort it.<br />
                  This mailbox isn't monitored, so please don't reply here.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
