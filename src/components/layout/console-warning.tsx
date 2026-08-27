"use client";

import { useEffect } from "react";

import { site } from "@/config/site";

/**
 * The self-XSS warning every large site prints into the browser console.
 *
 * It is aimed at exactly one attack, and it is not a technical one: somebody is
 * told "paste this in the console and you'll see who won / get access", pastes
 * it, and hands over their session. No amount of server-side care prevents a
 * person from running an attacker's code in their own browser — the only
 * defence is telling them, in the one place they'd be looking when it happens.
 *
 * What it is emphatically *not* is a security control over the awards. Nothing
 * on this site relies on the console being hard to open: the winners are not in
 * the page until they are published, so there is nothing in there to find.
 */
const MESSAGE_STYLE = [
    "color: hsl(43 74% 49%)",
    "font-size: 44px",
    "font-weight: 800",
    "text-shadow: 0 2px 8px rgba(0,0,0,0.35)",
].join(";");

const BODY_STYLE = "font-size: 15px; line-height: 1.6";
const ACCENT_STYLE = "font-size: 15px; line-height: 1.6; font-weight: 700; color: hsl(0 72% 51%)";

const ConsoleWarning = (): null => {
    useEffect(() => {
        // React runs effects twice in development's strict mode, and this is a
        // side effect on a shared object — the flag keeps the console readable.
        const flagged = "__fybConsoleWarned";
        if (window[flagged as keyof Window]) return;
        Object.defineProperty(window, flagged, { value: true, writable: false });

        console.log("%cHold on.", MESSAGE_STYLE);
        console.log(
            "%cThis console is a developer tool. If someone told you to paste something " +
                "here — to see the award winners early, to unlock something, to help with " +
                "your account — they are trying to take over your session.\n\n" +
                "%cPasting code you don't understand here can hand a stranger your account.%c\n\n" +
                `Nothing is hidden in here anyway: ${site.name} doesn't send the results to your ` +
                "browser until the organizers publish them.\n\n" +
                "Curious how the site works? The awards criteria are public at /awards/standard.",
            BODY_STYLE,
            ACCENT_STYLE,
            BODY_STYLE
        );
    }, []);

    return null;
};

export default ConsoleWarning;
