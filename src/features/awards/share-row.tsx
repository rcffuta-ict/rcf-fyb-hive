"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";

/**
 * Share controls for a campaign page.
 *
 * WhatsApp gets its own button rather than hiding behind the native sheet,
 * because that is where this link will actually travel. The native share sheet
 * is offered when the browser has one, and copy is the fallback that always
 * works — including in the in-app browsers where neither of the other two do.
 */

const ShareRow = ({
    name,
    firstName,
    nickname,
    categoryTitle,
    shareCode,
}: {
    name: string;
    firstName: string;
    nickname: string;
    categoryTitle: string;
    shareCode: string;
}): React.JSX.Element => {
    const [copied, setCopied] = useState(false);

    // Read at click time, not render: this component is server-rendered first,
    // and `window` doesn't exist then.
    const url = (): string =>
        typeof window === "undefined" ? "" : window.location.href;

    const message = `${name} — “${nickname}” — is up for ${categoryTitle} at the FYB Dinner. Vote ${firstName} here:`;

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(`${message} ${url()}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            appToast.error("Couldn't copy — long-press the address bar instead.");
        }
    };

    const handleShare = async (): Promise<void> => {
        if (!navigator.share) {
            void handleCopy();
            return;
        }
        try {
            await navigator.share({ title: name, text: message, url: url() });
        } catch {
            // A dismissed share sheet throws. Nothing went wrong, so say nothing.
        }
    };

    return (
        <div className="mt-5">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Campaign for {firstName}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild variant="secondary">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url()}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Share2 size={16} /> WhatsApp
                    </a>
                </Button>

                <Button variant="outline" onClick={() => void handleCopy()}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy link"}
                </Button>

                <Button variant="outline" onClick={() => void handleShare()}>
                    <Share2 size={16} /> Share…
                </Button>

                <Button asChild variant="outline">
                    <a href={`/awards/c/${shareCode}/poster`} download>
                        <Download size={16} /> Poster
                    </a>
                </Button>
            </div>

            <p className="mt-2.5 text-center text-xs text-muted-foreground">
                The poster is sized for WhatsApp Status and IG Stories.
            </p>
        </div>
    );
};

export default ShareRow;
