import type { CheckInPair } from "@/types/fyb.types";

/**
 * Matching a couple at the gate.
 *
 * Whoever is at the door will say whatever they remember: a name, the code off
 * the email, a phone number typed with spaces in it, an address in the wrong
 * case. One box takes all of it, so this is deliberately forgiving — the cost
 * of a near-miss here is a queue at the door.
 *
 * Pure and client-side by design: the roster is loaded once and filtered in the
 * browser, so a flaky network at the venue can't stop the gate moving.
 */

/** Phones are compared by digits only, so 0803… and +234 803… are the same. */
const digits = (value: string): string => value.replace(/\D/g, "");

/** Codes are compared without spacing or case: "fyb pair pr7k2m" → "FYBPAIRPR7K2M". */
const squash = (value: string): string => value.replace(/\s+/g, "").toUpperCase();

const phoneMatches = (phone: string | null, query: string): boolean => {
    const typed = digits(query);
    // Fewer than four digits is a name with a number in it, not a phone.
    if (typed.length < 4) return false;
    const stored = digits(phone ?? "");
    if (!stored) return false;
    // Suffix, so a local 080… number still finds a +234 one on file.
    return stored.endsWith(typed) || typed.endsWith(stored);
};

/** Every name token must appear somewhere — "grace ade" beats "grace" alone. */
const nameMatches = (name: string, tokens: string[]): boolean => {
    const haystack = name.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
};

/**
 * Table lookups are exact, and understand the word people say out loud: both
 * "table 7" and "7" find whoever holds it. Substring matching would be wrong
 * here — table 1 must not drag in tables 11 and 12.
 */
const tableMatches = (tableNumber: string | null, query: string): boolean => {
    if (!tableNumber) return false;
    const asked = squash(query.replace(/^\s*tables?\s*/i, ""));
    return asked.length > 0 && squash(tableNumber) === asked;
};

export const pairMatches = (pair: CheckInPair, rawQuery: string): boolean => {
    const query = rawQuery.trim();
    if (!query) return false;

    const lower = query.toLowerCase();
    const tokens = lower.split(/\s+/).filter(Boolean);

    if (squash(pair.code).includes(squash(query))) return true;
    if (tableMatches(pair.tableNumber, query)) return true;

    return pair.people.some(
        (person) =>
            nameMatches(person.name, tokens) ||
            (person.email ?? "").toLowerCase().includes(lower) ||
            phoneMatches(person.phone, query)
    );
};

/**
 * The roster filtered to a query, with the people who haven't arrived yet on
 * top — an already-admitted pair is almost never who the gate is looking for.
 */
export const searchPairs = (
    roster: CheckInPair[],
    query: string,
    limit = 20
): CheckInPair[] =>
    roster
        .filter((pair) => pairMatches(pair, query))
        .sort(
            (a, b) =>
                Number(Boolean(a.checkedInAt)) - Number(Boolean(b.checkedInAt))
        )
        .slice(0, limit);
