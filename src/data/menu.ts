import { appToast } from "@/providers/ToastProvider";
import { MemberProfile } from "@rcffuta/ict-lib";
import React, { MouseEvent } from "react";

export type MenuType = {
    href: string,
    label: string,
    title: string;
    icon: {
        main: React.ReactNode,
        sub: React.ReactNode
    },
    glow: string,
    description: string;
    gradient: string;
    hoverShadow: string;
    delay: string;
}


export const Menu: MenuType[] = [
    {
        href: "/register",
        label: "Register",
        title: "Register for Dinner",
        icon: {
            main: "🎫",
            sub: "💕",
        },
        glow: "rose",
        description:
            "Secure your exclusive seat at the most anticipated FYB celebration",
        gradient:
            "from-champagne-gold via-golden-400 to-golden-500",
        hoverShadow: "shadow-golden-glow",
        delay: "0ms",
    },
    {
        href: "/vote",
        label: "Awards",
        title: "Vote a Finalist",
        icon: {
            main: "👑",
            sub: "🏆"
        },
        glow: "golden",
        description:
            "Crown excellence and celebrate the remarkable achievements of your peers",
        gradient:
            "from-romance-500 via-rose-gold to-romance-400",
        hoverShadow: "shadow-romantic-glow",
        delay: "200ms",
    },
    {
        href: "/table",
        label: "Tables",
        title: "Pair Your Date",
        icon: {
            main: "💕",
            sub: "🍽️"
        },
        glow: "luxury",
        description:
            "Bring your special someone and create magical memories together",
        gradient:
            "from-luxury-500 via-luxury-400 to-luxury-600",
        hoverShadow: "shadow-magic",
        delay: "400ms",
    },
    // {
    //     href: "#",
    //     label: "About",
    //     icon: "✨",
    //     glow: "romance",
    // },
]


export const handleLinkClick = (e: any, item: MenuType, member: MemberProfile | null) => {
    if (item.href === "#") {
        e.preventDefault();
        appToast.comingSoon();
        return;
    }

    if (!member) {
        e.preventDefault();
        appToast.error("Please log in to continue");
    }
};