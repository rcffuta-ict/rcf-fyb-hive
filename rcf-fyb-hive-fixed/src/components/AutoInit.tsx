"use client";

import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const AutoInit = observer(() => {
    const pathname = usePathname();
    const hasInit = useRef(false);

    useEffect(() => {
        if (pathname === "/login/verify") return;
        if (hasInit.current) return;
        hasInit.current = true;
        authStore.init();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
});

export default AutoInit;
