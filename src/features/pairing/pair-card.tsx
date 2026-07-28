"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import GenderBadge from "@/components/shared/gender-badge";
import PairingBadge from "@/components/shared/pairing-badge";
import type { PairCard as PairCardData } from "@/types/fyb.types";

/**
 * The profile card a consent token resolves to.
 *
 * This is the payoff moment of the whole flow — you type four characters and a
 * person appears — so it flips in rather than just existing. Everything shown
 * here is what sharing a token consents to: face, name, level, unit, status.
 */

const PairCard = ({
    card,
    caption,
    delay = 0,
}: {
    card: PairCardData;
    caption?: string;
    delay?: number;
}): React.JSX.Element => (
    <motion.div
        initial={{ opacity: 0, rotateY: -12, y: 12 }}
        animate={{ opacity: 1, rotateY: 0, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
        className="surface flex items-center gap-4 p-5"
    >
        <div className="relative h-16 w-16 shrink-0">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-lg"
            />
            <Image
                src={card.photoUrl}
                alt={`${card.firstName} ${card.lastName}`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-primary/40 object-cover"
            />
        </div>

        <div className="min-w-0 flex-1">
            {caption && (
                <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                    {caption}
                </span>
            )}
            <p className="truncate font-luxury text-lg text-foreground">
                {card.firstName} {card.lastName}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {card.level}
                {card.unit ? ` · ${card.unit}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <GenderBadge gender={card.gender} className="px-2 py-0 text-[10px]" />
                <PairingBadge status={card.pairingStatus} className="px-2 py-0 text-[10px]" />
            </div>
        </div>
    </motion.div>
);

export default PairCard;
