import { cn } from "@/lib/utils";
import WinnerPortrait from "./winner-portrait";
import type { AwardWinner } from "@/types/awards.types";

/**
 * The revealed half of a slide: who won, and the count behind it.
 *
 * The count is on the screen on purpose. This app's answer to a disputed result
 * has always been "here is the standard, and here are the numbers" — a winner
 * announced without a tally is exactly the kind of result people are entitled
 * to be suspicious of, and the number costs one small line.
 *
 * Two things it will not do: crown anybody in a tie, and invent a winner for a
 * category nobody voted in. Both say so plainly instead.
 */

const plural = (count: number, word: string): string =>
    `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

const WinnerStand = ({ award }: { award: AwardWinner }): React.JSX.Element => {
    if (award.winners.length === 0) {
        return (
            <p className="mt-[6vh] font-elegant text-[clamp(1rem,2.2vw,2.2rem)] italic text-foreground/50">
                No votes were cast in this category.
            </p>
        );
    }

    const shared = award.winners.length > 1;
    const [first] = award.winners;

    return (
        <div className="mt-[4vh] w-full animate-scale-in">
            {shared && (
                <p className="eyebrow mb-[2vh] justify-center text-[clamp(0.6rem,1.1vw,1.05rem)]">
                    It&apos;s a tie
                </p>
            )}

            <div className="flex flex-wrap items-start justify-center gap-x-[5vw] gap-y-[4vh]">
                {award.winners.map((winner) => (
                    <figure
                        key={winner.candidateId}
                        className="flex max-w-[min(90vw,34rem)] flex-col items-center"
                    >
                        <WinnerPortrait winner={winner} shared={shared} />

                        <figcaption className="mt-[2.5vh]">
                            <p
                                className={cn(
                                    "font-luxury leading-tight text-primary drop-shadow-[0_0_36px_hsl(var(--primary)/0.45)]",
                                    shared
                                        ? "text-[clamp(1.25rem,3.4vw,3rem)]"
                                        : "text-[clamp(1.75rem,5.5vw,5rem)]"
                                )}
                            >
                                {winner.displayName}
                            </p>

                            {winner.nickname && (
                                <p className="mt-[0.8vh] font-elegant text-[clamp(0.95rem,2vw,2rem)] italic text-foreground/70">
                                    &ldquo;{winner.nickname}&rdquo;
                                </p>
                            )}

                            {winner.members.length > 0 && (
                                <p className="mt-[1.2vh] text-[clamp(0.7rem,1.2vw,1.15rem)] leading-relaxed text-foreground/55">
                                    {winner.members
                                        .map((member) => `${member.firstName} ${member.lastName}`)
                                        .join(" · ")}
                                </p>
                            )}
                        </figcaption>
                    </figure>
                ))}
            </div>

            <p className="mt-[3.5vh] text-[clamp(0.62rem,1.05vw,1.05rem)] uppercase tracking-[0.22em] text-foreground/45">
                {plural(first.votes, "vote")}
                {shared && " each"} · {first.share}% of the{" "}
                {plural(award.votesCast, "vote")} cast in this category
            </p>
        </div>
    );
};

export default WinnerStand;
