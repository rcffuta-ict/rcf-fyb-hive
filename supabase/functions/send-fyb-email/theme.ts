/**
 * Email palette — literal hex mirror of the `army-of-light` theme.
 *
 * SOURCE OF TRUTH: `src/config/themes.ts`. That file stores semantic tokens as
 * HSL channels for Tailwind's `<alpha-value>` opacity modifiers, which email
 * clients cannot read (no CSS custom properties, no `hsl()` in many clients).
 * So the values below are the converted equivalents. If the site palette
 * changes, convert and update here — nothing links these two files at build
 * time, because this function is deployed separately as Deno.
 */

export const COLORS = {
    /** --background 40 40% 97% */
    background: "#FBF8F4",
    /** --card 40 33% 99% */
    card: "#FEFDFB",
    /** --foreground 345 25% 15% */
    ink: "#301D21",
    /** --muted-foreground 345 8% 42% */
    inkMuted: "#746367",
    /** --primary 35 52% 40% */
    gold: "#9B6F31",
    /** --gold-highlight */
    goldHighlight: "#E8C77B",
    /** --gold-midtone */
    goldMid: "#B38841",
    /** --rose-burgundy */
    burgundy: "#550B18",
    /** --rose-shadow */
    burgundyDeep: "#33050D",
    /** --accent 40 52% 90% */
    accent: "#F3EAD8",
    /** --border 38 22% 86% */
    border: "#E3DDD3",
    onDark: "#F6EEE2",
} as const;

/**
 * Web fonts don't load in most email clients, so no @font-face. Georgia is
 * already the declared fallback for `--font-playfair` in tailwind.config.ts,
 * which means the email degrades to exactly what the site degrades to.
 */
export const FONTS = {
    display: "Georgia, 'Times New Roman', Times, serif",
    body: "Arial, Helvetica, sans-serif",
    mono: "'SF Mono', 'Segoe UI Mono', Consolas, 'Courier New', monospace",
} as const;
