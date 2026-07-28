import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

import GuideFaq from "@/features/guide/guide-faq";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
    title: `How it works — ${site.name}`,
    description: `Everything you need to know about registering for the ${site.event.title}, your consent token, and pairing up.`,
};

const steps = [
    {
        icon: UserCheck,
        title: "Check you're on the list",
        body: "Enter the email or phone number attached to your RCF FUTA profile. We work out your level from your class set — the dinner is for the graduating class only, so 400 and 500 level finalists.",
    },
    {
        icon: Sparkles,
        title: "Add a clear photo",
        body: "Upload a recent, front-facing photo of yourself. It's how the team confirms it's you at the door, so no group shots and nothing covering your face. We check for exactly one clear face before you can continue.",
    },
    {
        icon: UserCheck,
        title: "Confirm your details",
        body: "Look over the name, unit and level we pulled from your RCF profile, then confirm. That's your registration in — no payment needed at this stage.",
    },
    {
        icon: Mail,
        title: "Watch your inbox",
        body: "We immediately email you a confirmation containing your consent token — four characters, like FYB-7K2M. Keep that email. It's the one thing you'll need when pairing opens.",
    },
];

const tokenRules = [
    "It only ever appears in your inbox — never on this site, and never on the organizers' dashboard.",
    "One token per finalist. Ask for a resend and you get the same one back — it never changes behind your back.",
    "Anyone holding it will be able to pair with you, so keep it out of group chats.",
    "No organizer can see it, and none will ever ask you for it. Anyone who does isn't an organizer.",
];

export default function GuidePage(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <div className="text-center">
                <span className="eyebrow">How it works</span>
                <h1 className="mt-2 font-luxury text-foreground">Registering for the dinner</h1>
                <p className="mx-auto mt-4 max-w-xl text-foreground/70">
                    Four steps and about two minutes. Here&apos;s everything you need to get your
                    spot at the {site.event.title}.
                </p>
            </div>

            <ol className="mt-12 space-y-4">
                {steps.map((step, index) => (
                    <li key={step.title} className="surface flex gap-4 p-6">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                            <step.icon size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                                Step {index + 1}
                            </span>
                            <h2 className="mt-1 font-luxury text-xl text-foreground">
                                {step.title}
                            </h2>
                            <p className="mt-1.5 leading-relaxed text-foreground/70">
                                {step.body}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className="surface mt-10 p-7">
                <div className="flex items-center gap-3">
                    <KeyRound size={20} className="shrink-0 text-primary" />
                    <h2 className="font-luxury text-xl text-foreground">
                        About your consent token
                    </h2>
                </div>
                <p className="mt-3 leading-relaxed text-foreground/70">
                    The dinner is a paired event, and your token is your consent in a form
                    someone else can carry. It exists so nobody can pair with you without you
                    actually agreeing to it — which is why we keep it out of everyone&apos;s
                    hands but yours. Hold on to that email; pairing opens later, and this is
                    what you&apos;ll use.
                </p>
                <ul className="mt-4 space-y-2.5">
                    {tokenRules.map((rule) => (
                        <li key={rule} className="flex gap-2.5 text-foreground/70">
                            <ShieldCheck size={17} className="mt-1 shrink-0 text-primary" />
                            <span>{rule}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <h2 className="mt-12 text-center font-luxury text-2xl text-foreground">
                Common questions
            </h2>
            <GuideFaq />

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Pairing and awards open later in the season — this guide grows as they do.
            </p>

            <div className="surface mt-6 p-8 text-center">
                <h2 className="font-luxury text-xl text-foreground">Ready when you are</h2>
                <p className="mx-auto mt-2 max-w-md text-foreground/70">
                    Registration takes about two minutes. Still stuck? Reach us at{" "}
                    <a
                        href={`mailto:${site.contact.email}`}
                        className="font-medium text-primary hover:underline"
                    >
                        {site.contact.email}
                    </a>
                    .
                </p>
                <Button asChild size="lg" className="sheen mt-6">
                    <Link href="/register">Register now</Link>
                </Button>
            </div>
        </section>
    );
}
