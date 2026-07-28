"use client";

import Link from "next/link";
import { ArrowRight, Clock, Flame, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import PairingBadge from "@/components/shared/pairing-badge";
import type { Gender, PairingVibe } from "@/types/fyb.types";

/**
 * The cook.
 *
 * Someone who is already registered gets told so — and then gets told where
 * they stand. The numbers are real (see `getPairingVibe`), because the whole
 * point is the pressure, and made-up pressure stops working the moment one
 * person compares notes with another.
 *
 * Rendered only while pairing is live; before that there's nothing to nudge
 * anyone towards.
 */

/** Church register, and plural — the pool they're looking at. */
const poolTerm = (gender: Gender | null, count: number): string => {
    if (gender === "male") return count === 1 ? "sister" : "sisters";
    if (gender === "female") return count === 1 ? "brother" : "brothers";
    return count === 1 ? "person" : "people";
};

type Line = { Icon: typeof Flame; headline: string; body: string };

const buildLine = (vibe: PairingVibe, gender: Gender | null): Line => {
    const { availableOpposite: left, inBetween } = vibe;
    const pool = poolTerm(gender, left);

    if (vibe.status === "taken") {
        return {
            Icon: PartyPopper,
            headline: "And you're locked in. 🔒",
            body:
                inBetween > 0
                    ? `Certified serious. Meanwhile ${inBetween} ${inBetween === 1 ? "person is" : "people are"} still in-between, hoping their transfer lands before somebody else's. Not your problem anymore — go and sort your fit.`
                    : "Certified serious. Payment confirmed, date confirmed, nothing left to worry about. Go and sort your fit.",
        };
    }

    if (vibe.status === "in_between") {
        return {
            Icon: Clock,
            headline: "But you're still in-between. ⏳",
            body:
                inBetween > 0
                    ? `You've made a move — it just isn't yours yet. Nothing is locked until the money lands, and ${inBetween} other ${inBetween === 1 ? "person is" : "people are"} in exactly the same place. Decide fast, with money, or be disappointed.`
                    : "You've made a move — it just isn't yours yet. Nothing is locked until the money lands. Decide fast, with money, or someone else will decide for you.",
        };
    }

    if (left === 0) {
        return {
            Icon: Flame,
            headline: "But you're still single. 👀",
            body: `Every single ${poolTerm(gender, 1)} on the list is already spoken for. Ouch. Not all of them have paid though — and until payment lands, nothing is locked. Go and shoot your shot.`,
        };
    }

    return {
        Icon: Flame,
        headline: "But you're still single. 👀",
        body: `${left} ${pool} ${left === 1 ? "hasn't" : "haven't"} paired with anybody yet — and that number only goes down. Go and get a consent token from the one you have in mind.`,
    };
};

const RegisteredVibe = ({
    firstName,
    gender,
    vibe,
}: {
    firstName: string;
    gender: Gender | null;
    vibe: PairingVibe;
}): React.JSX.Element => {
    const { Icon, headline, body } = buildLine(vibe, gender);
    const done = vibe.status === "taken";

    return (
        <div className="surface mt-3 animate-scale-in p-6">
            <div className="flex items-start gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-luxury text-lg text-foreground">{headline}</p>
                        <PairingBadge status={vibe.status} />
                    </div>
                    <p className="mt-1.5 text-sm text-foreground/80">{body}</p>
                </div>
            </div>

            {!done && (
                <Button asChild className="sheen mt-5 w-full">
                    <Link href="/pairing">
                        {vibe.status === "in_between"
                            ? `Finish it, ${firstName}`
                            : "Go and pair"}{" "}
                        <ArrowRight size={16} />
                    </Link>
                </Button>
            )}
        </div>
    );
};

export default RegisteredVibe;
