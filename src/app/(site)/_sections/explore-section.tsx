import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { featureCards } from "@/constants/navigation";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const ExploreSection = (): React.JSX.Element => {
    return (
        <section className="py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="eyebrow mb-4">{site.copy.exploreEyebrow}</span>
                    <h2 className="font-luxury text-foreground">{site.copy.exploreTitle}</h2>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {featureCards.map((card, i) => {
                        const Icon = card.icon;
                        const className = cn(
                            "group flex animate-slide-up flex-col gap-4 p-7",
                            card.enabled ? "surface-interactive sheen" : "surface opacity-70"
                        );
                        const style = { animationDelay: `${i * 90}ms` };

                        const inner = (
                            <>
                                <span className="flex h-12 w-12 items-center justify-center rounded-token bg-accent text-primary">
                                    <Icon size={22} />
                                </span>

                                <div className="flex-1">
                                    <h3 className="font-luxury text-xl text-foreground">
                                        {card.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                                        {card.description}
                                    </p>
                                </div>

                                {card.enabled ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                                        Open
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                                        <Clock size={15} />
                                        Coming soon
                                    </span>
                                )}
                            </>
                        );

                        return card.enabled ? (
                            <Link
                                key={card.feature}
                                href={card.href}
                                className={className}
                                style={style}
                            >
                                {inner}
                            </Link>
                        ) : (
                            <div key={card.feature} className={className} style={style}>
                                {inner}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ExploreSection;
