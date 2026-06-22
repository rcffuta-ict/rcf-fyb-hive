/**
 * Theme palettes — the single place to add or change a color scheme.
 *
 * Each palette maps CSS custom properties to values. `ThemeProvider` writes the
 * active palette (selected by `site.theme`) onto <html>, so changing the look of
 * the entire app is a one-line config change — add a new object here and point
 * `site.config.json#theme` at its key.
 *
 * Semantic tokens use **HSL channels** (e.g. "40 58% 60%") so Tailwind's
 * `<alpha-value>` opacity modifiers work (`bg-primary/20`). Brand tokens are
 * raw colors consumed directly by the metallic-gold/honeycomb utilities.
 */

export type ThemeToken =
    | "--background"
    | "--foreground"
    | "--card"
    | "--card-foreground"
    | "--popover"
    | "--popover-foreground"
    | "--primary"
    | "--primary-foreground"
    | "--secondary"
    | "--secondary-foreground"
    | "--accent"
    | "--accent-foreground"
    | "--muted"
    | "--muted-foreground"
    | "--border"
    | "--input"
    | "--ring"
    | "--destructive"
    | "--destructive-foreground"
    | "--gold-highlight"
    | "--gold-midtone"
    | "--gold-bronze"
    | "--gold-dark"
    | "--rose-burgundy"
    | "--rose-shadow";

export type ThemePalette = Record<ThemeToken, string>;

/**
 * Default palette, sampled from the fyb-hive logo (burgundy rose + metallic gold)
 * on a premium warm-ivory base. Keep these values in sync with global.css :root.
 */
const armyOfLight: ThemePalette = {
    "--background": "40 40% 97%",
    "--foreground": "345 25% 15%",
    "--card": "40 33% 99%",
    "--card-foreground": "345 25% 15%",
    "--popover": "40 33% 99%",
    "--popover-foreground": "345 25% 15%",
    "--primary": "35 52% 40%",
    "--primary-foreground": "35 45% 14%",
    "--secondary": "349 72% 22%",
    "--secondary-foreground": "40 40% 96%",
    "--accent": "40 52% 90%",
    "--accent-foreground": "349 50% 22%",
    "--muted": "38 24% 93%",
    "--muted-foreground": "345 8% 42%",
    "--border": "38 22% 86%",
    "--input": "38 22% 86%",
    "--ring": "37 55% 50%",
    "--destructive": "0 70% 45%",
    "--destructive-foreground": "0 0% 98%",
    "--gold-highlight": "#e8c77b",
    "--gold-midtone": "#b38841",
    "--gold-bronze": "#785121",
    "--gold-dark": "#43290e",
    "--rose-burgundy": "#550b18",
    "--rose-shadow": "#33050d",
};

/** Example alternate palette — proves a new skin is a single object away. */
const midnightEmerald: ThemePalette = {
    "--background": "200 35% 8%",
    "--foreground": "150 20% 92%",
    "--card": "200 30% 11%",
    "--card-foreground": "150 20% 92%",
    "--popover": "200 32% 10%",
    "--popover-foreground": "150 20% 92%",
    "--primary": "45 65% 60%",
    "--primary-foreground": "200 40% 10%",
    "--secondary": "162 60% 22%",
    "--secondary-foreground": "150 25% 92%",
    "--accent": "45 75% 70%",
    "--accent-foreground": "200 40% 10%",
    "--muted": "200 20% 18%",
    "--muted-foreground": "150 12% 70%",
    "--border": "162 20% 24%",
    "--input": "162 20% 22%",
    "--ring": "45 70% 60%",
    "--destructive": "0 72% 51%",
    "--destructive-foreground": "0 0% 98%",
    "--gold-highlight": "#ecd58a",
    "--gold-midtone": "#bb9347",
    "--gold-bronze": "#7c5a24",
    "--gold-dark": "#3f2f12",
    "--rose-burgundy": "#0f5132",
    "--rose-shadow": "#08301d",
};

export const themes = {
    "army-of-light": armyOfLight,
    "midnight-emerald": midnightEmerald,
} as const;

export type ThemeName = keyof typeof themes;

export const DEFAULT_THEME: ThemeName = "army-of-light";

export const getTheme = (name: string): ThemePalette =>
    themes[name as ThemeName] ?? themes[DEFAULT_THEME];

/** Serialize a palette to a CSS string for inline <style> (avoids FOUC). */
export const paletteToCss = (palette: ThemePalette): string =>
    `:root{${Object.entries(palette)
        .map(([token, value]) => `${token}:${value};`)
        .join("")}}`;
