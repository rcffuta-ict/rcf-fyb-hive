"use client";

import { useSettingsStore } from "@/store/settings.store";
import type { AppSettings } from "@/services/settings.service";

/**
 * Pushes server-read settings into the client store.
 *
 * Hydration happens during the first render rather than in an effect, so client
 * components never flash the build-time default before the real flag arrives —
 * which would briefly show a "Pairing" nav link that shouldn't be there.
 */
const SettingsProvider = ({
    settings,
    children,
}: {
    settings: AppSettings;
    children: React.ReactNode;
}): React.JSX.Element => {
    // Guarded by the store's own flag rather than a ref: this runs before any
    // child renders, so nothing ever reads the build-time default.
    if (!useSettingsStore.getState().hydrated) {
        useSettingsStore.getState().hydrate(settings);
    }

    return <>{children}</>;
};

export default SettingsProvider;
