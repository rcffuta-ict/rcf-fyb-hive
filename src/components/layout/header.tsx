"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { liveNavLinks } from "@/constants/navigation";
import { isFeatureEnabled } from "@/config/site";
import { cn } from "@/lib/utils";

const Header = (): React.JSX.Element => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (): void => setScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const canRegister = isFeatureEnabled("registration");

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-300",
                scrolled
                    ? "border-b border-border bg-background/85 backdrop-blur-xl"
                    : "border-b border-transparent"
            )}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Logo size={40} withWordmark href="/" />

                <nav className="hidden items-center gap-1 md:flex">
                    {liveNavLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "rounded-token px-4 py-2 text-sm font-medium transition-colors",
                                    active
                                        ? "text-primary"
                                        : "text-foreground/70 hover:text-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:block">
                    {canRegister && (
                        <Button asChild size="sm">
                            <Link href="/register">Register</Link>
                        </Button>
                    )}
                </div>

                <button
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-token text-foreground/80 hover:bg-foreground/5 md:hidden"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {open && (
                <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
                    <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
                        {liveNavLinks.map((link) => {
                            const Icon = link.icon;
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-token px-3 py-3 text-sm font-medium transition-colors",
                                        active
                                            ? "bg-accent text-accent-foreground"
                                            : "text-foreground/80 hover:bg-foreground/5"
                                    )}
                                >
                                    <Icon size={18} className="text-primary" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        {canRegister && (
                            <Button asChild className="mt-2">
                                <Link href="/register" onClick={() => setOpen(false)}>
                                    Register for the Dinner
                                </Link>
                            </Button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
