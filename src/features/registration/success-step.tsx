"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CalendarDays, MapPin, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRegistrationStore } from "@/store/registration.store";
import { site } from "@/config/site";

const eventDate = new Date(site.event.dateISO);
const dateLabel = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
}).format(eventDate);

const SuccessStep = (): React.JSX.Element => {
    const registration = useRegistrationStore((s) => s.registration);
    const member = useRegistrationStore((s) => s.member);

    const name = registration?.firstName ?? member?.firstName ?? "Finalist";
    const photo = registration?.photoUrl ?? member?.avatarUrl ?? "";

    useEffect(() => {
        const timer = setTimeout(() => {
            void confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.35 },
                colors: ["#e8c77b", "#b38841", "#550b18"],
                disableForReducedMotion: true,
            });
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="mx-auto max-w-md animate-scale-in text-center">
            <div className="surface p-8">
                <div className="relative mx-auto h-28 w-28">
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-2xl"
                    />
                    {photo ? (
                        <Image
                            src={photo}
                            alt={name}
                            width={112}
                            height={112}
                            className="h-28 w-28 rounded-full border-2 border-primary/40 object-cover shadow-gold-glow"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-primary">
                            <PartyPopper size={36} />
                        </div>
                    )}
                </div>

                <span className="eyebrow mt-6">You&apos;re on the list</span>
                <h2 className="mt-2 font-luxury text-3xl text-metallic-gold">
                    See you there, {name}!
                </h2>
                <p className="mt-3 text-sm text-foreground/70">
                    Your spot at the {site.event.title} is confirmed. Here are the details — keep
                    them handy.
                </p>

                <div className="mt-6 space-y-3 text-left">
                    <div className="flex items-center gap-3 rounded-token bg-accent/40 px-4 py-3">
                        <CalendarDays size={18} className="shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-token bg-accent/40 px-4 py-3">
                        <MapPin size={18} className="shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{site.event.venue}</span>
                    </div>
                </div>

                <Button asChild size="lg" className="mt-7 w-full sheen">
                    <Link href="/">Back to home</Link>
                </Button>
            </div>
        </div>
    );
};

export default SuccessStep;
