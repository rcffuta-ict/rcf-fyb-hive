"use client";

import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AutoInit = observer(() => {
    const pathname = usePathname();

    useEffect(() => {
        // Only run once on initial mount
        if (pathname === "/login/verify") return;

        // Prevent re-initialization if already initialized (optional)
        if (!authStore.member) {
            authStore.init();
        }
    }, [pathname]);

    return null;
});

export default AutoInit;
