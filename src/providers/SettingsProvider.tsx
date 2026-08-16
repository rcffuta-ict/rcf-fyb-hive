"use client";

import { useSettingsStore } from "@/store/settings.store";
import type { AppSettings } from "@/services/settings.service";

/**
 * Pushes server-read settings into the client store.
 *
 * Hydration happens during render rather than in an effect, so client
 * components never flash the build-time default before the real values arrive
 * — which would briefly show a "Pairing" nav link that shouldn't be there, or
 * an empty account number on the payment screen.
 *
 * It re-hydrates whenever the server values differ, rather than once. Zustand
 * stores are module singletons, and on the server that module is shared across
 * every request in the process — so a hydrate-once guard would pin the whole
 * server to whatever the settings were on its first request. An admin toggling
 * pairing or fixing an account number would not show up in server-rendered
 * markup until the process restarted. Settings are global and identical for
 * every visitor, so overwriting is always correct here.
 */
const SettingsProvider = ({
    settings,
    children,
}: {
    settings: AppSettings;
    children: React.ReactNode;
}): React.JSX.Element => {
    const current = useSettingsStore.getState();
    // Compared key by key over whatever `AppSettings` currently holds, rather
    // than a hand-written list: a new setting added to the type would otherwise
    // be silently excluded from the staleness check and never re-hydrate.
    const stale =
        !current.hydrated ||
        (Object.keys(settings) as (keyof AppSettings)[]).some(
            (key) => current[key] !== settings[key]
        );

    if (stale) current.hydrate(settings);

    return <>{children}</>;
};

export default SettingsProvider;
