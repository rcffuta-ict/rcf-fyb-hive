import Link from "next/link";
import { ArrowRight, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import SealedEnvelope from "./sealed-envelope";
import type { AwardsReveal } from "@/types/awards.types";

/**
 * `/awards` once the ballot has shut.
 *
 * The old behaviour here was a "coming soon" panel, which is the right answer
 * for an award season that hasn't started and the wrong one for a season that
 * has just finished voting. By this point there are categories, criteria and a
 * full slate of nominees; telling somebody who came to see them that the
 * feature is on its way is both untrue and a waste of the most interested
 * traffic the awards page will ever get.
 *
 * So it points at the thing that is actually happening. Before the organizers
 * publish, that is a wall of sealed envelopes; after, it is the winners. Either
 * way the page's job is to send people one click onward.
 */
const VotingClosed = ({ reveal }: { reveal: AwardsReveal }): React.JSX.Element => {
    const { published } = reveal;
    const decided = reveal.categories.filter((category) => category.winner).length;

    return (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="text-center">
                <p className="eyebrow justify-center">
                    {published ? <Sparkles size={14} /> : <Lock size={14} />}
                    {published ? "The results are in" : "Voting has closed"}
                </p>

                <h1 className="mt-4 font-luxury text-3xl text-foreground sm:text-5xl">
                    {published
                        ? `${decided} award${decided === 1 ? "" : "s"}, decided`
                        : "Every envelope is sealed"}
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">
                    {published
                        ? "The ballot is shut and the counting is done. Every winner, with the votes behind them, is on the winners screen."
                        : "Thank you for voting — the ballot is shut and the count is sealed. Nothing is decided in public until the organizers unveil it on the night."}
                </p>

                <Button asChild size="lg" className="mt-8">
                    <Link href="/awards/winners">
                        {published ? "See the winners" : "See the sealed envelopes"}
                        <ArrowRight size={16} />
                    </Link>
                </Button>

                <p className="mt-4 text-xs text-muted-foreground">
                    Every award&apos;s criteria stay public at{" "}
                    <Link href="/awards/standard" className="text-primary hover:underline">
                        the published standard
                    </Link>
                    .
                </p>
            </div>

            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reveal.categories.map((category) => (
                    <li key={category.categoryId} className="surface flex flex-col p-6 text-center">
                        <h2 className="font-luxury text-lg leading-snug text-foreground">
                            {category.title}
                        </h2>
                        <p className="mt-2 line-clamp-3 font-elegant text-sm italic leading-relaxed text-foreground/60">
                            {category.blurb}
                        </p>

                        <div className="mt-6 flex flex-1 flex-col items-center justify-end">
                            {category.winner ? (
                                <>
                                    <p className="font-luxury text-xl leading-tight text-primary">
                                        {category.winner.displayName}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        {category.winner.votes.toLocaleString()} votes
                                    </p>
                                </>
                            ) : published ? (
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    No votes cast
                                </p>
                            ) : (
                                <SealedEnvelope nominees={category.nominees} compact />
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default VotingClosed;
