import { Check, Quote, X } from "lucide-react";

import type { AwardStandardDoc } from "@/types/awards.types";

/**
 * The published standard, in full, for anyone who wants to check it.
 *
 * The reason this page exists rather than living only as a per-rail disclosure:
 * when someone disputes a result — and at least one person always does — the
 * useful reply is a link, not a paraphrase. Everything the Screening Committee
 * applied is here, in the same words they applied it in.
 *
 * A Server Component: the standard is read from disk and passed in, so the
 * parser and the raw file never reach the browser.
 */

const StandardPage = ({ doc }: { doc: AwardStandardDoc }): React.JSX.Element => (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="text-center">
            <span className="eyebrow">The Honours</span>
            <h1 className="mt-2 font-luxury text-4xl text-foreground sm:text-5xl">
                How the awards are decided
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-foreground/70">
                Every award below has a checklist, and every nominee cleared theirs before
                their name reached a ballot. This page is that standard in full — nothing on
                it is summarised or softened.
            </p>
        </header>

        <div className="surface mt-10 flex gap-4 p-6">
            <Quote size={20} className="mt-1 shrink-0 text-primary" />
            <p className="font-luxury text-lg leading-relaxed text-foreground">
                {doc.principle}
            </p>
        </div>

        <section className="mt-12">
            <h2 className="font-luxury text-2xl text-foreground">The three stages</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {doc.screeningStages.map((stage, index) => (
                    <li key={stage.title} className="surface p-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mt-1.5 font-luxury text-lg text-foreground">
                            {stage.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                            {stage.body}
                        </p>
                    </li>
                ))}
            </ol>
        </section>

        <section className="mt-12">
            <h2 className="font-luxury text-2xl text-foreground">Rules for every category</h2>
            <ul className="mt-4 space-y-2.5">
                {doc.generalRules.map((rule) => (
                    <li key={rule} className="flex gap-2.5 text-sm leading-relaxed text-foreground/70">
                        <span
                            aria-hidden
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span>{rule}</span>
                    </li>
                ))}
            </ul>
        </section>

        <section className="mt-12">
            <h2 className="font-luxury text-2xl text-foreground">The awards</h2>
            <div className="mt-4 space-y-4">
                {doc.categories.map((standard) => (
                    <article key={standard.key} className="surface p-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="font-luxury text-xl text-foreground">
                                {standard.title}
                            </h3>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {standard.entryKind === "individual"
                                    ? "one finalist"
                                    : standard.entryKind === "clique"
                                      ? "a group of friends"
                                      : "a business"}
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                            {standard.definition}
                        </p>

                        <div className="mt-5 grid gap-6 sm:grid-cols-2">
                            <div>
                                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                    Every nominee cleared
                                </h4>
                                <ul className="mt-2.5 space-y-1.5">
                                    {standard.checklist.map((item) => (
                                        <li
                                            key={item}
                                            className="flex gap-2 text-sm leading-relaxed text-foreground/70"
                                        >
                                            <Check size={14} className="mt-1 shrink-0 text-primary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Not enough on its own
                                </h4>
                                <ul className="mt-2.5 space-y-1.5">
                                    {standard.disqualifiers.map((item) => (
                                        <li
                                            key={item}
                                            className="flex gap-2 text-sm leading-relaxed text-foreground/55"
                                        >
                                            <X size={14} className="mt-1 shrink-0 opacity-60" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {standard.note && (
                            <div className="mt-5 rounded-token border border-primary/30 bg-primary/5 p-4">
                                <h4 className="font-luxury text-sm text-foreground">
                                    {standard.note.title}
                                </h4>
                                <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
                                    {standard.note.body}
                                </p>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>

        <section className="mt-12">
            <h2 className="font-luxury text-2xl text-foreground">Terms used above</h2>
            <dl className="mt-4 space-y-3">
                {doc.definitions.map((entry) => (
                    <div key={entry.term} className="surface p-4">
                        <dt className="text-sm font-medium text-foreground">{entry.term}</dt>
                        <dd className="mt-1 text-sm leading-relaxed text-foreground/70">
                            {entry.meaning}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    </section>
);

export default StandardPage;
