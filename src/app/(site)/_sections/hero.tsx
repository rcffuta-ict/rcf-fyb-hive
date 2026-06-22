import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site, isFeatureEnabled } from "@/config/site";

const Hero = (): React.JSX.Element => {
    return (
        <section className="hero-aurora relative isolate overflow-hidden">
            {/* Layered texture over warm ivory — honeycomb weave + soft gold light */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-70 bg-honeycomb"
            />
            <div
                aria-hidden
                className="absolute -left-24 top-4 -z-10 h-72 w-72 animate-float-slow rounded-full bg-primary/15 blur-3xl"
            />
            <div
                aria-hidden
                className="absolute -right-20 top-1/3 -z-10 h-80 w-80 animate-drift rounded-full bg-accent/40 blur-3xl"
            />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-28 text-center md:pb-32 md:pt-32">
                <span
                    className="eyebrow mb-10 animate-fade-in rounded-full border border-primary/25 bg-card/60 px-4 py-1.5 shadow-sm backdrop-blur-sm"
                    style={{ animationDelay: "60ms" }}
                >
                    <Sparkles size={14} />
                    {site.copy.heroEyebrow}
                </span>

                {/* Co-brand lockup: fyb-hive crest × RCF FUTA */}
                <div
                    className="mb-5 flex animate-scale-in flex-wrap items-center justify-center gap-5 sm:gap-7"
                    style={{ animationDelay: "120ms" }}
                >
                    <div className="relative">
                        <div
                            aria-hidden
                            className="absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
                        />
                        <Image
                            src={site.branding.logos.fybHive}
                            alt={`${site.name} crest`}
                            width={120}
                            height={120}
                            priority
                            className="h-24 w-24 animate-float object-contain drop-shadow-[0_8px_24px_hsl(var(--primary)/0.4)]"
                        />
                    </div>

                    <span
                        aria-hidden
                        className="font-luxury text-2xl text-primary/60"
                    >
                        &times;
                    </span>

                    <div className="overflow-hidden">
                        <Image
                            src={site.branding.logos.rcffuta}
                            alt="RCF FUTA"
                            width={130}
                            height={64}
                            className="h-12 w-auto object-cover"
                        />
                    </div>
                </div>

                <p
                    className="mb-9 animate-fade-in text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
                    style={{ animationDelay: "180ms" }}
                >
                    {site.copy.poweredBy}
                </p>

                <h1
                    className="animate-slide-up text-balance font-luxury text-foreground"
                    style={{ animationDelay: "240ms" }}
                >
                    {site.copy.heroTitle}
                </h1>

                <div
                    className="divider-gold my-8 max-w-[14rem] animate-fade-in"
                    style={{ animationDelay: "340ms" }}
                />

                <p
                    className="max-w-2xl animate-slide-up text-balance font-elegant text-lg leading-relaxed text-foreground/75 md:text-xl"
                    style={{ animationDelay: "400ms" }}
                >
                    {site.copy.heroSubtitle}
                </p>

                <div
                    className="mt-12 flex animate-slide-up flex-col gap-3 sm:flex-row"
                    style={{ animationDelay: "500ms" }}
                >
                    {isFeatureEnabled("registration") && (
                        <Button asChild size="lg" className="sheen">
                            <Link href="/register">
                                {site.copy.heroCtaPrimary}
                                <ArrowRight size={18} />
                            </Link>
                        </Button>
                    )}
                    <Button asChild size="lg" variant="outline">
                        <Link href="#event">{site.copy.heroCtaSecondary}</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
