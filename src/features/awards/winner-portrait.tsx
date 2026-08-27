import Image from "next/image";

import { facePortrait } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import type { CandidateResult } from "@/types/awards.types";

/**
 * The winner's picture, at projector scale.
 *
 * Not `EntryAvatar`, despite covering the same three entry kinds. That one is a
 * mark in a list, sized in exact pixels because a row has to line up. This one
 * is the subject of a slide on a screen whose size is unknown until the night —
 * a phone in a hand, or a television across a hall — so it is sized in viewport
 * units and carries the ring and glow that make a face read as the point of the
 * screen rather than a bullet on it.
 *
 * `shared` is a tie: two winners, each shown smaller so both fit side by side
 * without either looking like the runner-up.
 */

const frameFor = (shared: boolean): string =>
    cn(
        "relative shrink-0 overflow-hidden",
        shared
            ? "h-[clamp(7rem,26vh,19rem)] w-[clamp(7rem,26vh,19rem)]"
            : "h-[clamp(11rem,50vh,36rem)] w-[clamp(11rem,50vh,36rem)]"
    );

const GLOW =
    "shadow-[0_0_140px_-20px_hsl(var(--primary)/0.9)] ring-[0.3vh] ring-primary/60 ring-offset-[0.6vh] ring-offset-background";

const WinnerPortrait = ({
    winner,
    shared,
}: {
    winner: CandidateResult;
    shared: boolean;
}): React.JSX.Element => {
    const frame = frameFor(shared);

    if (winner.entryKind === "brand") {
        return (
            <div
                className={cn(
                    frame,
                    GLOW,
                    "grid place-items-center rounded-token bg-muted/40 p-[6%]"
                )}
            >
                {winner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- reason: arbitrary logo host, see entry-avatar.tsx
                    <img
                        src={winner.imageUrl}
                        alt={winner.displayName}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <span className="font-luxury text-[clamp(0.9rem,2vw,2rem)] text-foreground/50">
                        {winner.displayName.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>
        );
    }

    if (winner.entryKind === "clique") {
        // Four at most, and three laid out as one large plus two stacked — the
        // same reasoning as the campaign hero: a friendship is not a line-up.
        const faces = winner.members.slice(0, 4);
        const feature = faces.length === 3;

        return (
            <div
                className={cn(
                    frame,
                    GLOW,
                    "grid grid-cols-2 gap-px rounded-full bg-border",
                    feature && "grid-rows-2"
                )}
                aria-label={winner.displayName}
            >
                {faces.map((member, index) => (
                    <div
                        key={member.registrationId}
                        className={cn(
                            "relative h-full w-full",
                            feature && index === 0 && "row-span-2"
                        )}
                    >
                        <Image
                            src={facePortrait(member.photoUrl, {
                                width: 640,
                                zoom: 0.8,
                            })}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 9rem, 20vw"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={cn(frame, GLOW, "rounded-3xl")}>
            <Image
                src={facePortrait(winner.imageUrl, { width: 1600, zoom: 0.7 })}
                alt={winner.displayName}
                fill
                priority
                sizes="(min-width: 1024px) 36rem, 80vw"
                className="object-cover"
            />
        </div>
    );
};

export default WinnerPortrait;
