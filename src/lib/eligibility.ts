/**
 * Academic-level derivation — mirrors @rcffuta/ict-lib's canonical formula:
 *   level = (sessionYear - entryYear + 1) * 100
 * where `sessionYear` is the first year of the active tenure session (e.g. the
 * "2025" in "2025/2026"). FYB Dinner is for the graduating class, so eligibility
 * is level ∈ {400, 500}.
 */

export type FinalistLevel = "400L" | "500L";

/** First year of a tenure session string like "2025/2026" → 2025. */
export const parseSessionYear = (session: string | null | undefined): number | null => {
    if (!session) return null;
    const year = parseInt(session.split("/")[0], 10);
    return Number.isFinite(year) ? year : null;
};

/** Returns a level label ("400L", "500L", "Alumni", "100L"…) or null if unknown. */
export const computeLevel = (
    entryYear: number | null | undefined,
    sessionYear: number | null | undefined
): string | null => {
    if (!entryYear || !sessionYear) return null;
    const levelCalc = (sessionYear - entryYear + 1) * 100;
    if (levelCalc >= 600) return "Alumni";
    if (levelCalc <= 0) return null;
    return `${levelCalc}L`;
};

/** Whether a computed level qualifies for FYB registration (final-year). */
export const isFinalistLevel = (level: string | null): level is FinalistLevel =>
    level === "400L" || level === "500L";
