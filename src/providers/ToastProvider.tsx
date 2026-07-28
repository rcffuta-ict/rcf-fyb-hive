"use client";

import React from "react";
import { Renderable, Toaster, toast as hotToast } from "react-hot-toast";
import {
    CheckCircle2,
    Clock,
    Coffee,
    Construction,
    Heart,
    Info,
    Loader2,
    Sparkles,
    Utensils,
    Wine,
    XCircle,
} from "lucide-react";

import { slugify } from "@/lib/function";

/**
 * App-wide toasts.
 *
 * Styling is derived entirely from the theme tokens in `config/themes.ts` — the
 * same card/border/shadow language as the `.surface` utility — so a toast reads
 * as part of the app rather than a floating third-party widget, and a change of
 * palette carries through automatically. No hardcoded colors.
 *
 * react-hot-toast writes inline styles, so these have to be inline too; the
 * values are `hsl(var(--token))` rather than literals.
 */

type ToastAccent = "primary" | "destructive" | "muted";

const ACCENT_TEXT: Record<ToastAccent, string> = {
    primary: "text-primary",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
};

/**
 * One surface for every toast — elevation and shape stay constant, only the
 * icon carries the meaning. Variants that each restyled the whole card made
 * consecutive toasts look like they came from different apps.
 */
const surface: React.CSSProperties = {
    background: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "var(--radius)",
    padding: "0.85rem 1.1rem",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: "0.9rem",
    fontWeight: 500,
    lineHeight: 1.45,
    maxWidth: "26rem",
    boxShadow:
        "0 1px 2px hsl(var(--secondary) / 0.08), 0 12px 32px -12px hsl(var(--secondary) / 0.28)",
};

const icon = (node: React.ReactNode): { icon: Renderable } => ({
    icon: node as Renderable,
});

export const GlobalToastProvider = ({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element => (
    <>
        {children}
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 4000,
                style: surface,
                success: icon(<CheckCircle2 size={20} className={ACCENT_TEXT.primary} />),
                error: icon(<XCircle size={20} className={ACCENT_TEXT.destructive} />),
                loading: icon(
                    <Loader2 size={20} className={`animate-spin ${ACCENT_TEXT.primary}`} />
                ),
            }}
        />
    </>
);

const withIcon = (
    node: React.ReactNode,
    message: string,
    id?: string,
    duration?: number
): void => {
    hotToast(message, {
        icon: node as Renderable,
        id: id ?? slugify(message),
        ...(duration ? { duration } : {}),
    });
};

/** Toast helpers. All share one surface; the icon carries the meaning. */
export const appToast = {
    success: (message: string, id?: string) =>
        hotToast.success(message, { id: id ?? message }),
    error: (message: string, id?: string) => hotToast.error(message, { id: id ?? message }),
    loading: (message: string, id?: string) =>
        hotToast.loading(message, { id: id ?? message }),
    dismiss: (id?: string) => hotToast.dismiss(id),

    info: (message: string, id?: string) =>
        withIcon(<Info size={20} className={ACCENT_TEXT.primary} />, message, id),

    romantic: (message: string, id?: string) =>
        withIcon(<Heart size={20} className={ACCENT_TEXT.primary} />, message, id),

    celebration: (message: string, id?: string) =>
        withIcon(<Sparkles size={20} className={ACCENT_TEXT.primary} />, message, id),

    dining: (message: string, id?: string) =>
        withIcon(<Utensils size={20} className={ACCENT_TEXT.primary} />, message, id),

    reservation: (message: string, id?: string) =>
        withIcon(<Wine size={20} className={ACCENT_TEXT.primary} />, message, id),

    comingSoon: (message = "This feature is coming soon!", id?: string) =>
        withIcon(<Clock size={20} className={ACCENT_TEXT.muted} />, message, id, 3000),

    notImplemented: (message = "This feature is not yet implemented", id?: string) =>
        withIcon(<Construction size={20} className={ACCENT_TEXT.muted} />, message, id, 3000),

    inProgress: (message = "We're still working on this!", id?: string) =>
        withIcon(<Coffee size={20} className={ACCENT_TEXT.muted} />, message, id, 3000),

    elegant: (
        message: string,
        node: React.ReactNode = <Sparkles size={20} className={ACCENT_TEXT.primary} />,
        id?: string
    ) => withIcon(node, message, id),

    minimal: (message: string, id?: string) =>
        hotToast(message, { id: id ?? slugify(message), duration: 2000 }),

    promise: (
        promise: Promise<unknown>,
        messages: { loading: string; success: string; error: string }
    ) => hotToast.promise(promise, messages),
};
