"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The shell every ballot entry sits in, whatever kind of thing it is.
 *
 * A person, a clique and a brand look nothing alike inside the frame — that is
 * the point of having three — but they must behave identically as *choices*:
 * the same radio semantics, the same travelling halo, the same caption
 * structure underneath. Pulling the shell out is what keeps a clique from
 * accidentally feeling like a heavier or lighter vote than a person.
 *
 * The selected state is carried by a `layoutId` halo that physically travels
 * from the old pick to the new one, so changing your mind reads as a movement
 * rather than as two cards quietly changing colour.
 */

const BallotFrame = ({
    id,
    selected,
    spotlit = false,
    disabled,
    railId,
    width,
    label,
    caption,
    nickname,
    footnote,
    onSelect,
    children,
}: {
    id: string;
    selected: boolean;
    /**
     * Came in on this entry's campaign link. Marks the card and nothing more —
     * it is a "here they are", never a vote.
     */
    spotlit?: boolean;
    disabled: boolean;
    /** Scopes the travelling halo to this rail, so picks don't fly between categories. */
    railId: string;
    /** Tailwind width classes — a clique needs more room than a face. */
    width: string;
    /** Accessible name for the radio, since the visual may be several images. */
    label: string;
    /** The name under the frame: a person, a clique, or a brand. */
    caption: string;
    nickname: string;
    /** Small line under the nickname — a clique's roster, a brand's founders. */
    footnote?: string;
    onSelect: () => void;
    children: React.ReactNode;
}): React.JSX.Element => (
    <button
        id={`candidate-${id}`}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={label}
        disabled={disabled}
        onClick={onSelect}
        tabIndex={selected || spotlit ? 0 : -1}
        className={cn(
            "group relative shrink-0 snap-center rounded-token p-2.5 text-center transition-all duration-300",
            width,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            disabled ? "cursor-default" : "hover:-translate-y-1.5"
        )}
    >
        {selected && (
            <motion.span
                layoutId={`pick-${railId}`}
                aria-hidden
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-token border border-primary/60 bg-primary/10 shadow-gold-glow"
            />
        )}

        {spotlit && !selected && (
            <span
                aria-hidden
                className="absolute inset-0 -z-10 animate-pulse rounded-token border border-dashed border-primary/70"
            />
        )}

        <div
            className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-token border transition-colors duration-300",
                selected ? "border-primary/60" : "border-border/70 group-hover:border-primary/40"
            )}
        >
            {children}

            {/* A whisper of a scrim, so a bright image doesn't fight the gold. */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent"
            />

            {selected && (
                <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-metallic-gold text-primary-foreground shadow-gold-glow"
                >
                    <Crown size={14} />
                </motion.span>
            )}
        </div>

        <p className="mt-3 line-clamp-2 font-luxury text-[15px] leading-snug text-foreground sm:text-base">
            {caption}
        </p>

        <span
            aria-hidden
            className={cn(
                "mx-auto mt-2 block h-px w-8 transition-all duration-300",
                selected ? "w-12 bg-metallic-gold" : "bg-border group-hover:w-12"
            )}
        />

        <p className="mt-2 line-clamp-2 text-[11px] uppercase leading-relaxed tracking-[0.18em] text-primary">
            {nickname}
        </p>

        {footnote && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-foreground/55">
                {footnote}
            </p>
        )}
    </button>
);

export default BallotFrame;
