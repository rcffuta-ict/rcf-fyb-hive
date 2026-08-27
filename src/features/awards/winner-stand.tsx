import { Users } from "lucide-react";

import { cn } from "@/lib/utils";
import SealedEnvelope from "./sealed-envelope";
import WinnerPortrait from "./winner-portrait";
import type { AwardWinner, CandidateResult } from "@/types/awards.types";

/**
 * The revealed half of a slide: who won, and the count behind it.
 *
 * The count is on the screen on purpose. This app's answer to a disputed result
 * has always been "here is the standard, and here are the numbers" — a winner
 * announced without a tally is exactly the kind of result people are entitled
 * to be suspicious of, and the number costs one small line.
 *
 * A dead heat is named rather than hidden. An award has one winner and the
 * committee's ballot decides which, but the people the room put level with them
 * are on the screen too: "this came down to a coin's edge" is true, and saying
 * it is fairer to everyone standing than a silent single name would be.
 */

const plural = (count: number, word: string): string =>
    `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

const roster = (winner: CandidateResult): string =>
    winner.members.map((member) => `${member.firstName} ${member.lastName}`).join(" · ");

const WinnerStand = ({ award }: { award: AwardWinner }): React.JSX.Element => {
    if (award.sealed) {
        return (
            <div className="mt-[4vh] w-full animate-scale-in">
                <SealedEnvelope nominees={award.nominees} />
            </div>
        );
    }

    if (!award.winner) {
        return (
            <p className="mt-[6vh] font-elegant text-[clamp(1rem,2.2vw,2.2rem)] italic text-foreground/50">
                {award.contenders.length > 0
                    ? "Still being decided."
                    : "No votes were cast in this category."}
            </p>
        );
    }

    const { winner } = award;

    return (
        <div className="mt-[4vh] w-full animate-scale-in">
            <figure className="flex flex-col items-center">
                <WinnerPortrait winner={winner} shared={false} />

                <figcaption className="mt-[2.5vh] max-w-[min(90vw,40rem)]">
                    <p className="font-luxury text-[clamp(1.75rem,5.5vw,5rem)] leading-tight text-primary drop-shadow-[0_0_36px_hsl(var(--primary)/0.45)]">
                        {winner.displayName}
                    </p>

                    {winner.nickname && (
                        <p className="mt-[0.8vh] font-elegant text-[clamp(0.95rem,2vw,2rem)] italic text-foreground/70">
                            &ldquo;{winner.nickname}&rdquo;
                        </p>
                    )}

                    {winner.members.length > 0 && (
                        <p className="mt-[1.2vh] flex items-center justify-center gap-2 text-[clamp(0.7rem,1.2vw,1.15rem)] leading-relaxed text-foreground/55">
                            <Users size={14} className="shrink-0" />
                            {roster(winner)}
                        </p>
                    )}
                </figcaption>
            </figure>

            <p className="mt-[3.5vh] text-[clamp(0.62rem,1.05vw,1.05rem)] uppercase tracking-[0.22em] text-foreground/45">
                {plural(winner.votes, "vote")} · {winner.share}% of the{" "}
                {plural(award.votesCast, "vote")} cast in this category
            </p>

            {award.decidedByCommittee && (
                <div
                    className={cn(
                        "mx-auto mt-[2.5vh] max-w-[min(92vw,46rem)] rounded-token border border-primary/25 bg-primary/5",
                        "px-[3vw] py-[2vh]"
                    )}
                >
                    <p className="font-elegant text-[clamp(0.85rem,1.5vw,1.5rem)] italic leading-relaxed text-foreground/70">
                        A dead heat at {plural(winner.votes, "vote")} — level with{" "}
                        {award.contenders.map((c) => c.displayName).join(" and ")}, and
                        settled by the awards committee.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WinnerStand;
