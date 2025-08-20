"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
    // const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    

    // const toggleDarkMode = () => {
    //     setIsDarkMode(!isDarkMode);
    //     document.documentElement.classList.toggle("dark");
    // };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10 shadow-glass animate-fade-in backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 relative">
                    {/* Enhanced ambient glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-golden-400/5 via-romance-400/10 to-luxury-400/5 animate-pulse-romantic"></div>
                    <div className="absolute top-0 left-1/3 w-32 h-16 bg-champagne-gold/10 blur-2xl animate-float-slow"></div>
                    <div className="absolute bottom-0 right-1/4 w-24 h-12 bg-romance-400/15 blur-xl animate-drift"></div>

                    {/* Logo + Branding - Enhanced */}
                    <Link
                        href="/"
                        className="flex flex-col group relative z-10 animate-slide-right hover:scale-105 transition-transform duration-400"
                    >
                        <div className="flex items-center space-x-3">
                            {/* More elegant icon */}
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-champagne-gold via-golden-400 to-golden-600 rounded-full flex items-center justify-center shadow-golden-glow animate-glow-pulse">
                                    <span className="text-white font-bold text-lg drop-shadow-lg">
                                        🌹
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-champagne-gold rounded-full animate-ping opacity-20"></div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-3xl font-luxury font-bold tracking-tight bg-gradient-to-r from-golden-300 via-champagne-gold to-golden-400 bg-clip-text text-transparent group-hover:animate-shimmer transition-all duration-400">
                                    FYB Hive
                                </span>
                                <span className="text-xs font-elegant text-pearl-300 group-hover:text-golden-300 transition-colors duration-300 tracking-wide">
                                    {"RCF FUTA Finalists' Dinner ✨"}
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Enhanced Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 relative z-10">
                        {[
                            {
                                href: "/register",
                                label: "Register",
                                icon: "💕",
                                glow: "rose",
                            },
                            {
                                href: "/awards",
                                label: "Awards",
                                icon: "🏆",
                                glow: "golden",
                            },
                            {
                                href: "/tables",
                                label: "Tables",
                                icon: "🍽️",
                                glow: "luxury",
                            },
                            {
                                href: "/about",
                                label: "About",
                                icon: "✨",
                                glow: "romance",
                            },
                        ].map((item, index) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group relative px-4 py-3 rounded-xl transition-all duration-350 hover:bg-glass-warm hover:shadow-rose-glow hover:scale-105 animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
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

                    <UserHighlight/>

                    

                    {/* Enhanced Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden relative z-10 p-3 rounded-xl glass-effect hover:bg-glass-warm transition-all duration-300 animate-scale-in group"
                    >
                        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
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

                    {/* Enhanced decorative elements */}
                    <div className="absolute top-2 right-20 w-2 h-2 bg-golden-400 rounded-full animate-twinkle opacity-70 shadow-golden-glow"></div>
                    <div
                        className="absolute bottom-3 left-32 w-1.5 h-1.5 bg-romance-400 rounded-full animate-sparkle opacity-50"
                        style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                        className="absolute top-4 left-1/2 w-1 h-1 bg-luxury-400 rounded-full animate-twinkle opacity-60"
                        style={{ animationDelay: "1.5s" }}
                    ></div>

                    {/* Additional sparkles for elegance */}
                    <div
                        className="absolute top-6 left-1/4 w-0.5 h-0.5 bg-champagne-gold rounded-full animate-sparkle opacity-40"
                        style={{ animationDelay: "2s" }}
                    ></div>
                    <div
                        className="absolute bottom-5 right-1/3 w-1 h-1 bg-romance-300 rounded-full animate-twinkle opacity-30"
                        style={{ animationDelay: "2.5s" }}
                    ></div>
                </div>

                {/* Enhanced bottom gradient border */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-gold to-transparent opacity-50 animate-pulse-romantic"></div>

                {/* Enhanced floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-4 left-1/4 w-1 h-1 bg-golden-300 rounded-full animate-float opacity-40 shadow-golden-glow"></div>
                    <div
                        className="absolute top-6 right-1/3 w-0.5 h-0.5 bg-romance-300 rounded-full animate-float-slow opacity-50"
                        style={{ animationDelay: "2s" }}
                    ></div>
                    <div
                        className="absolute bottom-4 left-2/3 w-1.5 h-1.5 bg-luxury-300 rounded-full animate-drift opacity-35"
                        style={{ animationDelay: "3s" }}
                    ></div>
                    <div
                        className="absolute top-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-champagne-gold/20 to-transparent animate-drift opacity-20"
                        style={{ animationDelay: "4s" }}
                    ></div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 md:hidden bg-glass-warm backdrop-blur-xl border-b border-white/10 animate-slide-down">
                        <div className="px-6 py-4 space-y-4">
                            {[
                                {
                                    href: "/register",
                                    label: "Register",
                                    icon: "💕",
                                },
                                {
                                    href: "/awards",
                                    label: "Awards",
                                    icon: "🏆",
                                },
                                {
                                    href: "/tables",
                                    label: "Tables",
                                    icon: "🍽️",
                                },
                                { href: "/about", label: "About", icon: "✨" },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-glass-gold transition-all duration-300"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-pearl-200 font-elegant">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/10">
                            <UserHighlight/>
                                {/* <button
                                    // onClick={toggleDarkMode}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-glass-gold transition-all duration-300 w-full"
                                >
                                    <span className="text-lg">
                                        {isDarkMode ? "🌙" : "☀️"}
                                    </span>
                                    <span className="text-pearl-200 font-elegant">
                                        {isDarkMode
                                            ? "Dark Mode"
                                            : "Light Mode"}
                                    </span>
                                </button> */}
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}



function UserHighlight() {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link
            href="/login"
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-champagne-gold via-golden-400 to-golden-500 text-white font-elegant font-semibold shadow-trophy-glow hover:shadow-golden-glow hover:scale-110 active:scale-95 transition-all duration-350 ease-bounce-in overflow-hidden animate-slide-left"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Button content */}
            <div className="relative z-10 flex items-center space-x-3">
                <span className="group-hover:animate-sparkle text-xl drop-shadow-lg transition-transform duration-300">
                    🔐
                </span>
                <span className="group-hover:drop-shadow-lg font-bold tracking-wide">
                    Login
                </span>
                <span
                    className={`text-lg transition-all duration-300 ${
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

            {/* Multiple pulse rings for extra elegance */}
            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 scale-100 group-hover:scale-125 group-hover:opacity-0 transition-all duration-800 ease-out"></div>
            <div
                className="absolute inset-0 rounded-2xl border border-white/20 scale-100 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1200 ease-out"
                style={{ transitionDelay: "200ms" }}
            ></div>
            <div
                className="absolute inset-0 rounded-2xl border border-champagne-gold/40 scale-100 group-hover:scale-175 group-hover:opacity-0 transition-all duration-1600 ease-out"
                style={{ transitionDelay: "400ms" }}
            ></div>

            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-golden-600/0 via-champagne-gold/20 to-golden-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm"></div>

            {/* Floating sparkles on hover */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div
                    className={`absolute top-2 left-4 w-1 h-1 bg-white rounded-full transition-all duration-500 ${
                        isHovered ? "opacity-100 animate-sparkle" : "opacity-0"
                    }`}
                ></div>
                <div
                    className={`absolute bottom-3 right-6 w-0.5 h-0.5 bg-white rounded-full transition-all duration-700 ${
                        isHovered ? "opacity-100 animate-twinkle" : "opacity-0"
                    }`}
                    style={{ animationDelay: "200ms" }}
                ></div>
                <div
                    className={`absolute top-4 right-4 w-0.5 h-0.5 bg-white rounded-full transition-all duration-600 ${
                        isHovered ? "opacity-100 animate-sparkle" : "opacity-0"
                    }`}
                    style={{ animationDelay: "400ms" }}
                ></div>
            </div>
        </Link>
    );
}