import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
    AwardStandard,
    AwardStandardDoc,
    EntryKind,
    StandardGender,
} from "@/types/awards.types";

/**
 * Loads and validates the award standard from `award-standard.jsonrc`.
 *
 * The standard is authored as JSON-with-comments so that a future ICT
 * coordinator can add a category by editing a data file rather than a module.
 * The cost of that choice is that a malformed edit would otherwise only surface
 * at runtime — so it is paid back here: `parseStandard` validates every field of
 * every category and **throws with the offending path** rather than handing back
 * a half-formed standard. A blank checklist reaching a live ballot is precisely
 * the failure this whole system exists to prevent, so refusing to boot is the
 * correct response to a broken file.
 *
 * Server-only by construction. The parsed document is passed down to client
 * components as props, which keeps the parser, `node:fs`, and the raw file out
 * of the browser bundle entirely.
 */

const STANDARD_PATH = join(process.cwd(), "src", "constants", "award-standard.jsonrc");

const ENTRY_KINDS: readonly EntryKind[] = ["individual", "clique", "brand"];
const GENDERS: readonly StandardGender[] = ["any", "male", "female"];

/**
 * Strip `//` and slash-star comments, and trailing commas, from JSONC.
 *
 * Written as a character scan rather than a regex because a regex cannot tell a
 * comment from the same characters inside a string literal — and the standard's
 * copy is full of prose that may one day contain a URL. Getting this wrong
 * would corrupt a checklist silently, which is the one outcome worth real care.
 */
const stripJsonc = (raw: string): string => {
    let out = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < raw.length; i += 1) {
        const char = raw[i];
        const next = raw[i + 1];

        if (inString) {
            out += char;
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === '"') inString = false;
            continue;
        }

        if (char === '"') {
            inString = true;
            out += char;
            continue;
        }

        if (char === "/" && next === "/") {
            while (i < raw.length && raw[i] !== "\n") i += 1;
            out += "\n";
            continue;
        }

        if (char === "/" && next === "*") {
            i += 2;
            while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i += 1;
            i += 1;
            continue;
        }

        out += char;
    }

    // Trailing commas, now that every comment is gone and only strings remain
    // quoted. Safe to regex: a `,` followed by `}`/`]` outside a string.
    return out.replace(/,(\s*[}\]])/g, "$1");
};

/** Throws with the JSON path of the bad field, so a typo is one line to fix. */
const fail = (path: string, expected: string): never => {
    throw new Error(
        `award-standard.jsonrc is invalid at ${path}: expected ${expected}. ` +
            "Fix the file — the ballot cannot open against a malformed standard."
    );
};

type Unknown = Record<string, unknown>;

const asString = (value: unknown, path: string): string => {
    if (typeof value !== "string" || value.trim() === "") fail(path, "a non-empty string");
    return (value as string).trim();
};

const asStringArray = (value: unknown, path: string, min: number): string[] => {
    if (!Array.isArray(value)) fail(path, "an array of strings");
    const list = (value as unknown[]).map((item, index) =>
        asString(item, `${path}[${index}]`)
    );
    if (list.length < min) fail(path, `at least ${min} item${min === 1 ? "" : "s"}`);
    return list;
};

const parseCategory = (value: unknown, index: number): AwardStandard => {
    const path = `categories[${index}]`;
    if (typeof value !== "object" || value === null) fail(path, "an object");
    const row = value as Unknown;

    const key = asString(row.key, `${path}.key`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
        fail(`${path}.key`, "a lowercase kebab-case slug, e.g. \"tech-guru-of-the-year\"");
    }

    const entryKind = asString(row.entryKind, `${path}.entryKind`);
    if (!ENTRY_KINDS.includes(entryKind as EntryKind)) {
        fail(`${path}.entryKind`, `one of ${ENTRY_KINDS.join(", ")}`);
    }

    const gender = asString(row.gender, `${path}.gender`);
    if (!GENDERS.includes(gender as StandardGender)) {
        fail(`${path}.gender`, `one of ${GENDERS.join(", ")}`);
    }

    // A clique that could stand with two people would not be a clique, and the
    // checklist is what a nominee is screened against — an empty one is an
    // award with no criteria, which is the thing this file exists to forbid.
    const standard: AwardStandard = {
        key,
        title: asString(row.title, `${path}.title`),
        entryKind: entryKind as EntryKind,
        gender: gender as StandardGender,
        blurb: asString(row.blurb, `${path}.blurb`),
        definition: asString(row.definition, `${path}.definition`),
        disqualifiers: asStringArray(row.disqualifiers, `${path}.disqualifiers`, 1),
        checklist: asStringArray(row.checklist, `${path}.checklist`, 1),
    };

    if (row.note !== undefined) {
        const note = row.note as Unknown;
        if (typeof note !== "object" || note === null) fail(`${path}.note`, "an object");
        standard.note = {
            title: asString(note.title, `${path}.note.title`),
            body: asString(note.body, `${path}.note.body`),
        };
    }

    return standard;
};

const parseStandard = (raw: string): AwardStandardDoc => {
    const parsed: unknown = JSON.parse(stripJsonc(raw));
    if (typeof parsed !== "object" || parsed === null) fail("<root>", "an object");
    const doc = parsed as Unknown;

    if (!Array.isArray(doc.categories)) fail("categories", "an array");
    const categories = (doc.categories as unknown[]).map(parseCategory);

    // Two categories sharing a key would make "which criteria was this nominee
    // screened against" unanswerable.
    const seen = new Set<string>();
    for (const category of categories) {
        if (seen.has(category.key)) {
            fail(`categories[…].key`, `unique keys — "${category.key}" appears twice`);
        }
        seen.add(category.key);
    }

    if (!Array.isArray(doc.screeningStages)) fail("screeningStages", "an array");
    if (!Array.isArray(doc.definitions)) fail("definitions", "an array");

    return {
        principle: asString(doc.principle, "principle"),
        generalRules: asStringArray(doc.generalRules, "generalRules", 1),
        screeningStages: (doc.screeningStages as unknown[]).map((stage, index) => {
            const row = stage as Unknown;
            return {
                title: asString(row?.title, `screeningStages[${index}].title`),
                body: asString(row?.body, `screeningStages[${index}].body`),
            };
        }),
        definitions: (doc.definitions as unknown[]).map((entry, index) => {
            const row = entry as Unknown;
            return {
                term: asString(row?.term, `definitions[${index}].term`),
                meaning: asString(row?.meaning, `definitions[${index}].meaning`),
            };
        }),
        categories,
    };
};

/**
 * Parsed once per server process. The file cannot change without a deploy, so
 * re-reading it per request would buy nothing and cost a disk hit on the ballot's
 * hot path.
 */
let cached: AwardStandardDoc | null = null;

export const getStandardDoc = (): AwardStandardDoc => {
    if (!cached) cached = parseStandard(readFileSync(STANDARD_PATH, "utf8"));
    return cached;
};

/** Every standard, in the order the file lists them. */
export const listStandards = (): AwardStandard[] => getStandardDoc().categories;

/**
 * The standard behind a category slug, or null when nothing matches.
 *
 * Null is the entire enforcement mechanism, so every caller must handle it: a
 * category that resolves to null does not go on the ballot and blocks voting
 * from opening. Never substitute a permissive default.
 */
export const findStandard = (slug: string | null | undefined): AwardStandard | null =>
    (slug && getStandardDoc().categories.find((c) => c.key === slug)) || null;

/** Whether a slug names a documented award in this deploy. */
export const isDocumented = (slug: string | null | undefined): boolean =>
    findStandard(slug) !== null;
