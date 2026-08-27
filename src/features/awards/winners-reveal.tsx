"use client";

import Image from "next/image";

import { site } from "@/config/site";
import { useRevealDeck } from "@/hooks/use-reveal-deck";
import { cn } from "@/lib/utils";
import RevealControls from "./reveal-controls";
import WinnerSlide from "./winner-slide";
import type { AwardsReveal } from "@/types/awards.types";

/**
 * The winners screen, for the night itself.
 *
 * It runs in two states off one payload. Before the organizers publish, every
 * slide is a sealed envelope — the award, its criteria, and a blurred fan of
 * its nominees — which is a screen worth leaving up in the hall for weeks. On
 * publication the same deck becomes the results. The server decides which;
 * nothing here can unseal anything, because a sealed payload has no winner in
 * it to unseal.
 *
 * It is a fixed overlay rather than an ordinary page because it has to hold the
 * whole screen: the site's header and footer are the right frame for a ballot
 * and the wrong one for something projected onto a wall in front of a hall.
 * Covering them costs one `z-index` and no layout surgery, and the browser's
 * own chrome goes with the fullscreen button in the controls.
 *
 * The whole slide is the advance target. Whoever is driving is holding a
 * clicker or a phone, not aiming at anything, so a tap anywhere moves the
 * ceremony on — with the controls floating above at a higher stacking level for
 * the few things a tap can't say. Keyboard and screen-reader users are served
 * by the labelled buttons in those controls and by the global key handling in
 * `useRevealDeck`, which is why the slide itself carries no role: making it a
 * button would hand a screen reader the entire award as one label.
 */
const WinnersReveal = ({ reveal }: { reveal: AwardsReveal }): React.JSX.Element => {
    const total = reveal.categories.length;
    const deck = useRevealDeck(total);
    const award = reveal.categories[deck.index];

    // Two beats per award, so the bar moves on a reveal as well as on a change
    // of category — otherwise it sits still through half the ceremony.
    const progress = ((deck.index * 2 + (deck.revealed ? 2 : 1)) / (total * 2)) * 100;

    return (
        <section
            aria-label="Award winners"
            className="fixed inset-0 z-[60] overflow-hidden bg-background text-foreground"
        >
            <div aria-hidden className="hero-aurora absolute inset-0" />
            <div
                aria-hidden
                className="texture-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            />

            {/* The crest, huge and faint, behind everything — a TV screen left idle
                on this slide should still read as fyb-hive from across the hall. */}
            <Image
                aria-hidden
                src={site.branding.logos.fybHive}
                alt=""
                width={800}
                height={800}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(85vh,85vw)] w-[min(85vh,85vw)] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.05]"
            />

            <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-0.5 bg-border/50">
                <div
                    className="h-full bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <header
                className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-[4vw] pt-[3vh] text-[clamp(0.55rem,0.95vw,0.95rem)] uppercase tracking-[0.22em] text-foreground/40 transition-opacity duration-500",
                    deck.idle && "opacity-0"
                )}
            >
                <span className="flex items-center gap-[0.8vw]">
                    <Image
                        src={site.branding.logos.fybHive}
                        alt=""
                        width={32}
                        height={32}
                        className="h-[clamp(1rem,2vw,1.75rem)] w-[clamp(1rem,2vw,1.75rem)] select-none object-contain opacity-90 drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                    />
                    {site.event.title}
                </span>
                <span className={cn("tabular-nums", !reveal.published && "text-primary/60")}>
                    {reveal.published
                        ? `${reveal.totalVotes.toLocaleString()} votes · ${reveal.voters.toLocaleString()} voters`
                        : "Sealed until the unveiling"}
                </span>
            </header>

            <div
                key={award.categoryId}
                onClick={deck.next}
                className="relative z-10 h-full animate-fade-in cursor-pointer"
            >
                <WinnerSlide
                    award={award}
                    position={deck.index + 1}
                    total={total}
                    revealed={deck.revealed}
                />
            </div>

            <RevealControls deck={deck} total={total} />
        </section>
    );
};

export default WinnersReveal;
