"use client";
import { appToast } from "@/providers/ToastProvider";
import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useState } from "react";

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const member = authStore.member;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10 shadow-glass animate-fade-in backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 relative">
                    {/* Enhanced ambient glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-golden-400/5 via-romance-400/10 to-luxury-400/5 animate-pulse-romantic"></div>
                    <div className="absolute top-0 left-1/3 w-32 h-16 bg-champagne-gold/10 blur-2xl animate-float-slow"></div>
                    <div className="absolute bottom-0 right-1/4 w-24 h-12 bg-romance-400/15 blur-xl animate-drift"></div>

                    {/* Logo + Branding - Enhanced */}
                    <Link
                        href="/"
                        className="flex flex-col group relative z-10 animate-slide-right hover:scale-105 transition-transform duration-400"
                    >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* More elegant icon */}
                            <div className="relative">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-champagne-gold via-golden-400 to-golden-600 rounded-full flex items-center justify-center shadow-golden-glow animate-glow-pulse">
                                    <span className="text-white font-bold text-sm sm:text-lg drop-shadow-lg">
                                        🌹
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-champagne-gold rounded-full animate-ping opacity-20"></div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xl sm:text-3xl font-luxury font-bold tracking-tight bg-gradient-to-r from-golden-300 via-champagne-gold to-golden-400 bg-clip-text text-transparent group-hover:animate-shimmer transition-all duration-400">
                                    FYB Hive
                                </span>
                                <span className="text-xs font-elegant text-pearl-300 group-hover:text-golden-300 transition-colors duration-300 tracking-wide hidden sm:block">
                                    {"RCF FUTA Finalists' Dinner ✨"}
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 relative z-10">
                        {[
                            {
                                href: "/register",
                                label: "Register",
                                icon: "💕",
                                glow: "rose",
                            },
                            {
                                href: "#",
                                label: "Awards",
                                icon: "🏆",
                                glow: "golden",
                            },
                            {
                                href: "#",
                                label: "Tables",
                                icon: "🍽️",
                                glow: "luxury",
                            },
                            {
                                href: "#",
                                label: "About",
                                icon: "✨",
                                glow: "romance",
                            },
                        ].map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group relative px-4 py-3 rounded-xl transition-all duration-350 hover:bg-glass-warm hover:shadow-rose-glow hover:scale-105 animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={(e) => {
                                    if (item.href === "#") {
                                        e.preventDefault();
                                        appToast.comingSoon();
                                        return;
                                    }

                                    if (!member) {
                                        e.preventDefault();
                                        appToast.error(
                                            "Please log in to continue"
                                        );
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl group-hover:animate-bounce-gentle transition-transform filter drop-shadow-lg">
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-elegant font-medium text-pearl-200 group-hover:text-white transition-colors duration-300">
                                        {item.label}
                                    </span>
                                </div>

                                {/* Enhanced underline effect */}
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-champagne-gold to-golden-400 group-hover:w-full transition-all duration-500 ease-romantic"></div>

                                {/* Glowing border on hover */}
                                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-champagne-gold/30 group-hover:shadow-golden-glow/20 transition-all duration-400"></div>

                                {/* Background glow */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-champagne-gold/5 to-romance-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop User Highlight */}
                    <div className="hidden md:block relative z-10">
                        <UserHighlight />
                    </div>

                    {/* Enhanced Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-3 relative z-10">
                        {/* Mobile User Highlight (simplified) */}
                        <div className="md:hidden">
                            <MobileUserHighlight />
                        </div>

                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="p-2 rounded-xl glass-effect hover:bg-glass-warm transition-all duration-300 animate-scale-in group"
                        >
                            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                                <div
                                    className={`w-full h-0.5 bg-champagne-gold transition-all duration-300 ${
                                        isMobileMenuOpen
                                            ? "rotate-45 translate-y-1.5"
                                            : ""
                                    }`}
                                ></div>
                                <div
                                    className={`w-full h-0.5 bg-champagne-gold transition-all duration-300 ${
                                        isMobileMenuOpen ? "opacity-0" : ""
                                    }`}
                                ></div>
                                <div
                                    className={`w-full h-0.5 bg-champagne-gold transition-all duration-300 ${
                                        isMobileMenuOpen
                                            ? "-rotate-45 -translate-y-1.5"
                                            : ""
                                    }`}
                                ></div>
                            </div>
                        </button>
                    </div>

                    {/* Enhanced decorative elements */}
                    <div className="absolute top-2 right-20 w-2 h-2 bg-golden-400 rounded-full animate-twinkle opacity-70 shadow-golden-glow hidden sm:block"></div>
                    <div
                        className="absolute bottom-3 left-32 w-1.5 h-1.5 bg-romance-400 rounded-full animate-sparkle opacity-50 hidden sm:block"
                        style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                        className="absolute top-4 left-1/2 w-1 h-1 bg-luxury-400 rounded-full animate-twinkle opacity-60 hidden sm:block"
                        style={{ animationDelay: "1.5s" }}
                    ></div>
                </div>

                {/* Enhanced bottom gradient border */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-gold to-transparent opacity-50 animate-pulse-romantic"></div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 md:hidden bg-glass-rose border-b border-white/10 animate-slide-down">
                        <div className="px-4 sm:px-6 py-4 space-y-3">
                            {[
                                {
                                    href: "/register",
                                    label: "Register",
                                    icon: "💕",
                                },
                                {
                                    href: "#",
                                    label: "Awards",
                                    icon: "🏆",
                                },
                                {
                                    href: "#",
                                    label: "Tables",
                                    icon: "🍽️",
                                },
                                { href: "#", label: "About", icon: "✨" },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-glass-gold transition-all duration-300"
                                    onClick={(e) => {
                                        setIsMobileMenuOpen(false);
                                        if (item.href === "#") {
                                            e.preventDefault();
                                            appToast.comingSoon();
                                        }
                                    }}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-pearl-200 font-elegant">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}

export default observer(Header);

const UserHighlight = observer(() => {
    const [isHovered, setIsHovered] = useState(false);
    const auth = authStore;

    const isLoggedIn = auth.isAuthenticated;
    const userLabel =
        auth.member?.firstname || auth.member?.email || "Dashboard";

    const handleClick = (e: React.MouseEvent) => {
        if (isLoggedIn) {
            e.preventDefault();
            auth.logout();
        }
    };

    return (
        <Link
            href={isLoggedIn ? "/" : "/login"}
            onClick={handleClick}
            className="group relative px-6 py-3 rounded-2xl bg-gradient-to-r from-champagne-gold via-golden-400 to-golden-500 text-white font-elegant font-semibold shadow-trophy-glow hover:shadow-golden-glow hover:scale-110 active:scale-95 transition-all duration-350 ease-bounce-in overflow-hidden animate-slide-left"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Button content */}
            <div className="relative z-10 flex items-center space-x-2">
                <span className="group-hover:animate-sparkle text-lg drop-shadow-lg transition-transform duration-300">
                    {isLoggedIn ? "👤" : "🔐"}
                </span>
                <span className="group-hover:drop-shadow-lg font-bold tracking-wide text-sm">
                    {isLoggedIn ? userLabel : "Login"}
                </span>
                <span
                    className={`text-sm transition-all duration-300 ${
                        isHovered
                            ? "translate-x-1 opacity-100"
                            : "translate-x-0 opacity-0"
                    }`}
                >
                    →
                </span>
            </div>

            {/* Enhanced shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        </Link>
    );
});

const MobileUserHighlight = observer(() => {
    const auth = authStore;
    const isLoggedIn = auth.isAuthenticated;

    const handleClick = (e: React.MouseEvent) => {
        if (isLoggedIn) {
            e.preventDefault();
            auth.logout();
            appToast.success("Logged out successfully");
        }
    };

    return (
        <Link
            href={isLoggedIn ? "/" : "/login"}
            onClick={handleClick}
            className="p-2 rounded-xl bg-gradient-to-r from-champagne-gold/20 to-golden-400/20 border border-champagne-gold/30 text-pearl-200 hover:bg-glass-gold transition-all duration-300"
        >
            <span className="text-lg">{isLoggedIn ? "👤" : "🔐"}</span>
        </Link>
    );
});
