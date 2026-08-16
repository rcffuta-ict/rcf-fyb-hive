"use client";

import { useEffect, useState } from "react";

/**
 * A value that lags behind its source until typing stops.
 *
 * Used to keep a search box from firing a Server Action per keystroke — the
 * request that matters is the one after the last letter.
 */
export const useDebounced = <T,>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};
