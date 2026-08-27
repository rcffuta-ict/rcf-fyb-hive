"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The state behind the winners screen: which award is on, and whether its
 * winner has been said out loud yet.
 *
 * Every category is two beats, not one. The screen names the award and what it
 * is given for, the room reacts, and only then does the winner appear — which
 * is how the moment is run from a stage, and is impossible if a slide arrives
 * with the answer already on it. So one "next" means reveal, the next "next"
 * means move on, and the whole ceremony is driveable from a single forward
 * button — which is all a presenter remote sends.
 */

const AUTOPLAY_MS = 6000;
const IDLE_MS = 3500;

type Position = { index: number; revealed: boolean };

export type RevealDeck = Position & {
    /** True once the last winner is up — nothing further to advance to. */
    atEnd: boolean;
    autoplay: boolean;
    /** Nobody has touched anything recently; the chrome gets out of the way. */
    idle: boolean;
    next: () => void;
    previous: () => void;
    restart: () => void;
    toggleAutoplay: () => void;
};

export const useRevealDeck = (total: number): RevealDeck => {
    const [position, setPosition] = useState<Position>({ index: 0, revealed: false });
    const [autoplay, setAutoplay] = useState(false);
    const [idle, setIdle] = useState(false);

    const next = useCallback((): void => {
        setPosition(({ index, revealed }) => {
            if (!revealed) return { index, revealed: true };
            if (index >= total - 1) return { index, revealed: true };
            return { index: index + 1, revealed: false };
        });
    }, [total]);

    // Going back lands on a revealed slide rather than un-revealing one: you
    // step back to check a name you missed, not to un-hear it.
    const previous = useCallback((): void => {
        setPosition(({ index, revealed }) => {
            if (revealed) return { index, revealed: false };
            if (index === 0) return { index, revealed: false };
            return { index: index - 1, revealed: true };
        });
    }, []);

    const restart = useCallback((): void => setPosition({ index: 0, revealed: false }), []);

    const toggleAutoplay = useCallback((): void => setAutoplay((on) => !on), []);

    /**
     * Autoplay wraps rather than stopping at the end. It exists for the screen
     * left running in the hall before and after the ceremony, where stalling on
     * the last award for an hour would be the wrong behaviour; the live reveal
     * is driven by hand with it off, which is the default.
     */
    useEffect(() => {
        if (!autoplay || total === 0) return;

        const timer = window.setInterval(() => {
            setPosition(({ index, revealed }) => {
                if (!revealed) return { index, revealed: true };
                return { index: (index + 1) % total, revealed: false };
            });
        }, AUTOPLAY_MS);

        return () => window.clearInterval(timer);
    }, [autoplay, total]);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent): void => {
            // Space and PageDown/PageUp are what a clicker sends; the arrows are
            // what someone driving from the laptop reaches for.
            if ([" ", "ArrowRight", "ArrowDown", "PageDown", "Enter"].includes(event.key)) {
                event.preventDefault();
                next();
                return;
            }
            if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(event.key)) {
                event.preventDefault();
                previous();
                return;
            }
            if (event.key === "Home") {
                event.preventDefault();
                restart();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [next, previous, restart]);

    useEffect(() => {
        let timer = window.setTimeout(() => setIdle(true), IDLE_MS);

        const wake = (): void => {
            setIdle(false);
            window.clearTimeout(timer);
            timer = window.setTimeout(() => setIdle(true), IDLE_MS);
        };

        const events = ["pointermove", "pointerdown", "keydown"] as const;
        events.forEach((name) => window.addEventListener(name, wake));

        return () => {
            window.clearTimeout(timer);
            events.forEach((name) => window.removeEventListener(name, wake));
        };
    }, []);

    // The screen is a fixed overlay over the site's own scrolling page. Without
    // this, a swipe on a phone scrolls the ballot page hiding behind it.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return {
        ...position,
        atEnd: position.revealed && position.index >= total - 1,
        autoplay,
        idle,
        next,
        previous,
        restart,
        toggleAutoplay,
    };
};
