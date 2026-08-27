import { Lock, Trophy } from "lucide-react";

import WinnerStand from "./winner-stand";
import type { AwardWinner } from "@/types/awards.types";

/**
 * One award, in its two beats.
 *
 * Before the reveal the screen carries the award and its blurb and nothing
 * else — the room is being told what is about to be given, and the point is
 * that nobody in it can read the answer off the wall early.
 *
 * Before the organizers publish, the second beat is a sealed envelope rather
 * than a winner: the same slide, the same award, a blurred fan of the nominees.
 * The screen is worth walking past for weeks that way, and there is nothing in
 * it to leak.
 *
 * Everything is sized in viewport units rather than at breakpoints, because the
 * two screens this has to work on are a phone held in a hand and a television
 * across a hall being driven from a laptop. A `text-6xl` that suits the laptop
 * is a whisper on the television; `clamp` with a `vw` middle term is the same
 * proportion of whatever it is projected onto.
 */
const WinnerSlide = ({
    award,
    position,
    total,
    revealed,
}: {
    award: AwardWinner;
    /** 1-based, for the "Award 3 of 14" line. */
    position: number;
    total: number;
    revealed: boolean;
}): React.JSX.Element => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto px-[6vw] py-[7vh] text-center">
            <p className="eyebrow justify-center text-[clamp(0.58rem,1vw,1rem)]">
                Award {position} of {total}
            </p>

            <h1 className="mt-[2vh] max-w-[22ch] font-luxury text-[clamp(1.5rem,4.4vw,4.5rem)] leading-tight text-foreground">
                {award.title}
            </h1>

            <div className="divider-gold my-[2.5vh] w-[min(80vw,44rem)]" />

            <p className="max-w-[46ch] font-elegant text-[clamp(0.95rem,1.9vw,2rem)] italic leading-relaxed text-foreground/65">
                {award.blurb}
            </p>

            {revealed ? (
                <WinnerStand award={award} />
            ) : (
                <div className="mt-[7vh] flex flex-col items-center text-foreground/40">
                    {award.sealed ? (
                        <Lock className="animate-float text-primary/60" strokeWidth={1.25} size={44} />
                    ) : (
                        <Trophy className="animate-float text-primary/70" strokeWidth={1.25} size={48} />
                    )}
                    <p className="mt-[2.5vh] text-[clamp(0.62rem,1.05vw,1.05rem)] uppercase tracking-[0.22em]">
                        {award.sealed ? "Tap to see who's in the running" : "Tap or press space to reveal"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default WinnerSlide;
