"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AwardCandidate } from "@/types/awards.types";

/**
 * One candidate on a rail: portrait, full name, nickname. Nothing else.
 *
 * Read as a plaque — a framed portrait above an engraved caption, with a
 * hairline rule separating the person from what they are known for. Level and
 * unit were on here early on and pulled: they turned a tribute into a database
 * row, and nobody votes on a unit.
 *
 * The selected state is carried by a `layoutId` halo that physically travels
 * from the old pick to the new one, so changing your mind reads as a movement
 * rather than as two cards quietly changing colour.
 */

const CandidateCard = ({
    candidate,
    selected,
    spotlit = false,
    disabled,
    railId,
    onSelect,
}: {
    candidate: AwardCandidate;
    selected: boolean;
    /**
     * Came in on this person's campaign link. Marks the card and nothing more —
     * it is a "here they are", never a vote.
     */
    spotlit?: boolean;
    disabled: boolean;
    /** Scopes the travelling halo to this rail, so picks don't fly between categories. */
    railId: string;
    onSelect: () => void;
}): React.JSX.Element => (
    <button
        id={`candidate-${candidate.id}`}
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={onSelect}
        tabIndex={selected || spotlit ? 0 : -1}
        className={cn(
            "group relative w-40 shrink-0 snap-center rounded-token p-2.5 text-center transition-all duration-300 sm:w-48",
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
            <Image
                src={candidate.photoUrl}
                alt={`${candidate.firstName} ${candidate.lastName}`}
                fill
                sizes="(min-width: 640px) 192px, 160px"
                className={cn(
                    "object-cover object-top transition-all duration-500",
                    selected
                        ? "scale-105 saturate-110"
                        : "saturate-[0.8] group-hover:scale-105 group-hover:saturate-100"
                )}
            />
            {/* A whisper of a scrim, so a bright photo doesn't fight the gold. */}
            <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent"
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
            {candidate.firstName} {candidate.lastName}
        </p>

        <span
            aria-hidden
            className={cn(
                "mx-auto mt-2 block h-px w-8 transition-all duration-300",
                selected ? "w-12 bg-metallic-gold" : "bg-border group-hover:w-12"
            )}
        />

        <p className="mt-2 line-clamp-2 text-[11px] uppercase leading-relaxed tracking-[0.18em] text-primary">
            {candidate.nickname}
        </p>
    </button>
);

export default CandidateCard;
