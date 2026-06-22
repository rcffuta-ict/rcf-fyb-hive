import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site, isFeatureEnabled } from "@/config/site";

const CtaBand = (): React.JSX.Element | null => {
    if (!isFeatureEnabled("registration")) return null;

    return (
        <section className="px-4 py-16 sm:px-6 md:py-20">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-8 py-14 text-center shadow-gold-glow-lg bg-metallic-gold">
                {/* Rough tactile grain + honeycomb weave over the gold */}
                <div
                    aria-hidden
                    className="texture-grain absolute inset-0 opacity-[0.18] mix-blend-overlay"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-40 mix-blend-overlay bg-honeycomb"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15"
                />
                <div
                    aria-hidden
                    className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white/30 blur-3xl"
                />

                <div className="relative">
                    <h2 className="font-luxury text-primary-foreground">
                        {site.copy.ctaTitle}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
                        {site.copy.ctaSubtitle}
                    </p>
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="sheen mt-8"
                    >
                        <Link href="/register">
                            {site.copy.ctaButton}
                            <ArrowRight size={18} />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CtaBand;
