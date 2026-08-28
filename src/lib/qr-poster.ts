import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

/**
 * The printed "find your table" poster, drawn as one SVG.
 *
 * Built server-side and handed to the browser as markup, so what is displayed,
 * printed and downloaded are the same artwork rather than three renderings that
 * drift. Vector, because this ends up on a wall at whatever size the print shop
 * has paper for.
 *
 * The QR itself is drawn module by module rather than taken from the library's
 * own SVG output: the finder patterns get the brand's rounded treatment, the
 * dots are dots, and the Hive crest sits in the middle. Error correction is
 * fixed at H (30%), which is what buys back the modules the logo covers.
 */

const INK = "#33050D"; // rose-shadow — near-black, but warm like the brand
const BURGUNDY = "#550B18";
const GOLD = "#B38841";
const GOLD_LIGHT = "#E8C77B";
const IVORY = "#FBF8F1";

const WIDTH = 1000;
const HEIGHT = 1414; // A-series ratio, so it prints to A4/A3 with no cropping

const QR_BOX = 640;
const QR_TOP = 470;
const QR_LEFT = (WIDTH - QR_BOX) / 2;

/** Text goes into markup, so anything user-configurable is escaped. */
const escapeXml = (value: string): string =>
    value.replace(/[<>&'"]/g, (char) =>
        char === "<"
            ? "&lt;"
            : char === ">"
              ? "&gt;"
              : char === "&"
                ? "&amp;"
                : char === "'"
                  ? "&apos;"
                  : "&quot;"
    );

/** The crest, inlined — a poster that fetches an asset is a poster with a hole. */
const loadLogo = async (publicPath: string): Promise<string | null> => {
    try {
        const file = await readFile(path.join(process.cwd(), "public", publicPath));
        return `data:image/png;base64,${file.toString("base64")}`;
    } catch (error) {
        console.error("QR poster: logo unavailable:", error);
        return null;
    }
};

type Modules = { size: number; data: Uint8Array };

/** Finder patterns are drawn by hand, so the dot loop must skip their squares. */
const inFinder = (x: number, y: number, size: number): boolean =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);

const drawDots = (modules: Modules, unit: number, logoRadius: number): string => {
    const { size, data } = modules;
    const centre = (size - 1) / 2;
    const dots: string[] = [];

    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            if (!data[y * size + x] || inFinder(x, y, size)) continue;
            // Modules under the crest are left out rather than painted over, so
            // the logo sits in clean space instead of on a broken grid.
            if (Math.abs(x - centre) <= logoRadius && Math.abs(y - centre) <= logoRadius) {
                continue;
            }
            const px = (QR_LEFT + x * unit).toFixed(2);
            const py = (QR_TOP + y * unit).toFixed(2);
            const side = (unit * 0.92).toFixed(2);
            dots.push(
                `<rect x="${px}" y="${py}" width="${side}" height="${side}" rx="${(unit * 0.3).toFixed(2)}" />`
            );
        }
    }

    return `<g fill="${INK}">${dots.join("")}</g>`;
};

/** The three corner eyes, rounded and gold-ringed to match the brand. */
const drawFinders = (size: number, unit: number): string => {
    const corners: [number, number][] = [
        [0, 0],
        [size - 7, 0],
        [0, size - 7],
    ];

    return corners
        .map(([cx, cy]) => {
            const x = QR_LEFT + cx * unit;
            const y = QR_TOP + cy * unit;
            const outer = unit * 7;
            const inner = unit * 3;
            return `
        <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${outer.toFixed(2)}" height="${outer.toFixed(2)}"
              rx="${(unit * 2).toFixed(2)}" fill="none" stroke="${INK}" stroke-width="${unit.toFixed(2)}" />
        <rect x="${(x + unit * 2).toFixed(2)}" y="${(y + unit * 2).toFixed(2)}"
              width="${inner.toFixed(2)}" height="${inner.toFixed(2)}"
              rx="${(unit * 0.9).toFixed(2)}" fill="${INK}" />`;
        })
        .join("");
};

export type QrPosterInput = {
    url: string;
    eyebrow: string;
    title: string;
    instruction: string;
    footer: string;
    /** Path under `public/`, e.g. "/fyb-hive-logo.png". */
    logoPath: string;
};

/** The whole poster as one self-contained SVG string. */
export const buildTableQrPoster = async ({
    url,
    eyebrow,
    title,
    instruction,
    footer,
    logoPath,
}: QrPosterInput): Promise<string> => {
    const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
    const modules = qr.modules as Modules;
    const unit = QR_BOX / modules.size;

    // ~5 modules across, which stays inside what H-level correction can lose.
    const logoRadius = 2.5;
    const logoSide = unit * (logoRadius * 2 + 1);
    const logoX = QR_LEFT + QR_BOX / 2 - logoSide / 2;
    const logoY = QR_TOP + QR_BOX / 2 - logoSide / 2;

    const logo = await loadLogo(logoPath.replace(/^\//, ""));
    const crest = logo
        ? `<image href="${logo}" x="${(logoX + logoSide * 0.1).toFixed(2)}" y="${(logoY + logoSide * 0.1).toFixed(2)}"
                 width="${(logoSide * 0.8).toFixed(2)}" height="${(logoSide * 0.8).toFixed(2)}"
                 preserveAspectRatio="xMidYMid meet" />`
        : "";

    const host = escapeXml(url.replace(/^https?:\/\//, ""));

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img"
     aria-label="${escapeXml(title)} — scan to see your table">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${IVORY}" />
    <rect x="26" y="26" width="${WIDTH - 52}" height="${HEIGHT - 52}" rx="42"
          fill="none" stroke="${GOLD}" stroke-width="3" />
    <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" rx="32"
          fill="none" stroke="${GOLD_LIGHT}" stroke-width="1.5" />

    <text x="${WIDTH / 2}" y="188" text-anchor="middle" fill="${GOLD}"
          font-family="Georgia, 'Times New Roman', serif" font-size="34"
          letter-spacing="10">${escapeXml(eyebrow.toUpperCase())}</text>

    <text x="${WIDTH / 2}" y="300" text-anchor="middle" fill="${BURGUNDY}"
          font-family="Georgia, 'Times New Roman', serif" font-size="92"
          font-weight="bold">${escapeXml(title)}</text>

    <text x="${WIDTH / 2}" y="378" text-anchor="middle" fill="${INK}" opacity="0.72"
          font-family="Helvetica, Arial, sans-serif" font-size="34">${escapeXml(instruction)}</text>

    <rect x="${QR_LEFT - 34}" y="${QR_TOP - 34}" width="${QR_BOX + 68}" height="${QR_BOX + 68}"
          rx="44" fill="#FFFFFF" stroke="${GOLD_LIGHT}" stroke-width="2" />
    ${drawDots(modules, unit, logoRadius)}
    ${drawFinders(modules.size, unit)}
    ${crest}

    <text x="${WIDTH / 2}" y="${QR_TOP + QR_BOX + 128}" text-anchor="middle" fill="${BURGUNDY}"
          font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="bold"
          letter-spacing="1">${host}</text>

    <text x="${WIDTH / 2}" y="${HEIGHT - 96}" text-anchor="middle" fill="${INK}" opacity="0.6"
          font-family="Georgia, 'Times New Roman', serif" font-size="30"
          letter-spacing="4">${escapeXml(footer)}</text>
</svg>`;
};
