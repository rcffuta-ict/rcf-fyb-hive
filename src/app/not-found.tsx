import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site, isFeatureEnabled } from "@/config/site";

export default function NotFound(): React.JSX.Element {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center px-4 pt-16 text-center">
            <div className="surface w-full max-w-md animate-scale-in p-10">
                <div className="relative mx-auto mb-6 h-24 w-24">
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl"
                    />
                    <Image
                        src={site.branding.logos.fybHive}
                        alt={`${site.name} crest`}
                        width={96}
                        height={96}
                        className="h-24 w-24 animate-float object-contain"
                    />
                </div>

                <p className="font-luxury text-5xl text-metallic-gold">404</p>
                <h1 className="mt-2 font-luxury text-2xl text-foreground">Page not found</h1>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-foreground/70">
                    This page wandered off the honeycomb. Let&apos;s get you back to the
                    celebration.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/">
                            <ArrowLeft size={18} /> Back to home
                        </Link>
                    </Button>
                    {isFeatureEnabled("registration") && (
                        <Button asChild size="lg" className="sheen">
                            <Link href="/register">{site.copy.heroCtaPrimary}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
