import { site } from "@/config/site";
import { themes, type ThemeName } from "@/config/themes";
import type { CampaignCard } from "@/types/awards.types";

/**
 * The generated campaign artwork, in two shapes:
 *
 *   • `og`     1200×630  — the WhatsApp/X link preview
 *   • `poster` 1080×1920 — a WhatsApp Status / IG Story image to download
 *
 * Rendered by satori (`next/og`), which knows nothing about Tailwind or CSS
 * variables: every value here has to be a literal. So the palette is read from
 * the same theme object the site is skinned with, and converted — change the
 * theme and the posters follow, which is the whole reason not to paste hexes.
 *
 * Satori also needs `display: flex` on any element with more than one child.
 */

const palette = themes[site.theme as ThemeName] ?? themes["army-of-light"];

/** "40 40% 97%" → "hsl(40, 40%, 97%)", which satori's colour parser accepts. */
const hsl = (token: keyof typeof palette): string => {
    const value = palette[token];
    if (value.startsWith("#")) return value;
    return `hsl(${value.trim().split(/\s+/).join(", ")})`;
};

const COLORS = {
    background: hsl("--background"),
    foreground: hsl("--foreground"),
    muted: hsl("--muted-foreground"),
    gold: palette["--gold-midtone"],
    goldLight: palette["--gold-highlight"],
    border: hsl("--border"),
};

export const OG_SIZE = { width: 1200, height: 630 };
export const POSTER_SIZE = { width: 1080, height: 1920 };

export const campaignArtwork = (
    card: CampaignCard,
    variant: "og" | "poster"
): React.JSX.Element => {
    const poster = variant === "poster";
    const scale = poster ? 1.6 : 1;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: poster ? "column" : "row",
                background: COLORS.background,
                fontFamily: "sans-serif",
            }}
        >
            {/* Portrait. Bleeds off the edge in both shapes so the face, not the
                frame, is the first thing the eye lands on in a chat list. */}
            <div
                style={{
                    display: "flex",
                    width: poster ? "100%" : "44%",
                    height: poster ? "58%" : "100%",
                    position: "relative",
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={card.photoUrl}
                    alt=""
                    width={poster ? POSTER_SIZE.width : 528}
                    height={poster ? 1114 : OG_SIZE.height}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: poster
                            ? `linear-gradient(to top, ${COLORS.background} 2%, transparent 45%)`
                            : `linear-gradient(to right, transparent 60%, ${COLORS.background} 99%)`,
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: poster ? "center" : "flex-start",
                    textAlign: poster ? "center" : "left",
                    flex: 1,
                    padding: poster ? "0 72px 90px" : "0 64px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        color: COLORS.gold,
                        fontSize: 20 * scale,
                        letterSpacing: 6,
                        textTransform: "uppercase",
                        fontWeight: 700,
                    }}
                >
                    {card.categoryTitle}
                </div>

                <div
                    style={{
                        display: "flex",
                        color: COLORS.foreground,
                        fontSize: 62 * scale,
                        fontWeight: 700,
                        lineHeight: 1.05,
                        marginTop: 18 * scale,
                    }}
                >
                    {card.firstName} {card.lastName}
                </div>

                <div
                    style={{
                        display: "flex",
                        width: 90 * scale,
                        height: 3,
                        background: COLORS.goldLight,
                        marginTop: 24 * scale,
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        color: COLORS.goldLight,
                        fontSize: 26 * scale,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        marginTop: 24 * scale,
                    }}
                >
                    {card.nickname}
                </div>

                <div
                    style={{
                        display: "flex",
                        color: COLORS.muted,
                        fontSize: 22 * scale,
                        marginTop: 34 * scale,
                        lineHeight: 1.4,
                    }}
                >
                    Vote at {site.name.toLowerCase().replace(/\s+/g, "")}
                </div>

                <div
                    style={{
                        display: "flex",
                        color: COLORS.foreground,
                        fontSize: 24 * scale,
                        fontWeight: 700,
                        marginTop: 10 * scale,
                        padding: `${12 * scale}px ${26 * scale}px`,
                        border: `2px solid ${COLORS.gold}`,
                        borderRadius: 999,
                    }}
                >
                    /awards/c/{card.shareCode}
                </div>

                <div
                    style={{
                        display: "flex",
                        color: COLORS.muted,
                        fontSize: 18 * scale,
                        marginTop: 26 * scale,
                    }}
                >
                    {site.event.title} · One vote each
                </div>
            </div>
        </div>
    );
};
