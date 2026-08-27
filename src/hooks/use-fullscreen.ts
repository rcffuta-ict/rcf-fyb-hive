"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Fullscreen for the whole document.
 *
 * The winners screen is projected from a laptop, and a browser's tab strip and
 * address bar across the top of a church television is the difference between a
 * ceremony and a demo. Fullscreen has to be triggered by a user gesture, so this
 * is a toggle for a button rather than something the page does on mount.
 *
 * Both values are read through `useSyncExternalStore` because both live in the
 * document, not in React: fullscreen is exited by Escape and by the browser's
 * own controls as often as by our button, and reading it as a subscription
 * means the icon follows what actually happened rather than what we asked for.
 * The server snapshot is the honest one — during SSR there is no document, so
 * nothing is fullscreen and nothing is supported.
 */

const subscribeToFullscreen = (onChange: () => void): (() => void) => {
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
};

/** Support never changes for the life of the page, so there is nothing to watch. */
const subscribeToNothing = (): (() => void) => () => undefined;

const isSupported = (): boolean =>
    typeof document.documentElement.requestFullscreen === "function";

const isFullscreenNow = (): boolean => Boolean(document.fullscreenElement);

const off = (): boolean => false;

export const useFullscreen = (): {
    isFullscreen: boolean;
    supported: boolean;
    toggle: () => void;
} => {
    const isFullscreen = useSyncExternalStore(subscribeToFullscreen, isFullscreenNow, off);
    const supported = useSyncExternalStore(subscribeToNothing, isSupported, off);

    const toggle = useCallback((): void => {
        if (document.fullscreenElement) {
            void document.exitFullscreen().catch(() => undefined);
            return;
        }
        // Rejected when the gesture isn't trusted. Nothing to tell the user —
        // the screen is perfectly usable windowed.
        void document.documentElement.requestFullscreen().catch(() => undefined);
    }, []);

    return { isFullscreen, supported, toggle };
};
