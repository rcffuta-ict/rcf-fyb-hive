"use client";

import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Maximize,
    Minimize,
    Pause,
    Play,
    RotateCcw,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { cn } from "@/lib/utils";
import type { RevealDeck } from "@/hooks/use-reveal-deck";

/**
 * The driver's controls, which fade out when nobody is driving.
 *
 * A row of buttons burnt into the bottom of a projected screen for the whole
 * ceremony is chrome the audience has to look past, so they go after a few
 * seconds of stillness and come back on the first movement or keypress. They
 * are also, while hidden, `pointer-events-none`, so the tap that brings them
 * back still lands on the slide and advances it — which is what a tap means
 * here, and is how the screen is driven on a phone.
 */
const RevealControls = ({
    deck,
    total,
}: {
    deck: RevealDeck;
    total: number;
}): React.JSX.Element => {
    const { isFullscreen, supported, toggle } = useFullscreen();

    return (
        <div
            className={cn(
                "absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 transition-opacity duration-500",
                deck.idle ? "pointer-events-none opacity-0" : "opacity-100"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                aria-label="Previous award"
                onClick={deck.previous}
                disabled={deck.index === 0 && !deck.revealed}
            >
                <ChevronLeft />
            </Button>

            <span className="min-w-[4.5rem] text-center font-elegant text-sm tabular-nums text-foreground/60">
                {deck.index + 1} / {total}
            </span>

            <Button
                variant="ghost"
                size="icon"
                aria-label={deck.revealed ? "Next award" : "Reveal the winner"}
                onClick={deck.next}
                disabled={deck.atEnd}
            >
                <ChevronRight />
            </Button>

            <span className="mx-1 h-6 w-px bg-border" aria-hidden />

            <Button
                variant="ghost"
                size="icon"
                aria-label={deck.autoplay ? "Stop the loop" : "Loop through every award"}
                title={deck.autoplay ? "Stop the loop" : "Loop through every award"}
                onClick={deck.toggleAutoplay}
            >
                {deck.autoplay ? <Pause /> : <Play />}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                aria-label="Start again from the first award"
                title="Start again"
                onClick={deck.restart}
            >
                <RotateCcw />
            </Button>

            {supported && (
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={isFullscreen ? "Leave fullscreen" : "Fullscreen"}
                    title={isFullscreen ? "Leave fullscreen" : "Fullscreen"}
                    onClick={toggle}
                >
                    {isFullscreen ? <Minimize /> : <Maximize />}
                </Button>
            )}

            <Button variant="ghost" size="icon" aria-label="Leave the winners screen" asChild>
                <Link href="/awards">
                    <X />
                </Link>
            </Button>
        </div>
    );
};

export default RevealControls;
