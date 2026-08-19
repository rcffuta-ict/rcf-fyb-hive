import Link from "next/link";
import { Trophy } from "lucide-react";

/**
 * The awards section of the guide.
 *
 * Two things people get wrong and this has to correct up front: that voting is
 * only for finalists (it isn't), and that a vote is final (it isn't, until
 * voting closes).
 */

const rules = [
    "Any RCF FUTA member can vote — any level, whether or not you're coming to the dinner. Finalists are who you vote for, not who votes.",
    "You get one vote in each category. Vote in as many or as few as you like.",
    "Changed your mind? Tap someone else. Only your last pick counts, right up until voting closes.",
    "Your picks are private. Nobody — not the other voters, not the candidates — sees who you chose.",
    "Results stay sealed until the organizers reveal them. Nobody is watching a live leaderboard.",
    "Nominees aren't picked by popularity. Every category has a published checklist, and a nominee who can't satisfy theirs doesn't reach the ballot at all.",
    "Standing for something? You get a campaign link and a poster — share them anywhere. Campaigning is fair game; buying votes is not.",
];

const AwardsGuide = (): React.JSX.Element => (
    <div className="surface mt-10 p-7">
        <div className="flex items-center gap-3">
            <Trophy size={20} className="shrink-0 text-primary" />
            <h2 className="font-luxury text-xl text-foreground">Awards & voting</h2>
        </div>
        <p className="mt-3 leading-relaxed text-foreground/70">
            The set gets crowned by the fellowship. When voting opens, head to Awards, enter
            the email or phone number on your RCF profile, and pick your winner in each
            category — the nickname under each face is what they&apos;re standing for.
        </p>
        <ul className="mt-4 space-y-2.5">
            {rules.map((rule) => (
                <li key={rule} className="flex gap-2.5 text-foreground/70">
                    <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{rule}</span>
                </li>
            ))}
        </ul>

        <Link
            href="/awards/standard"
            className="mt-5 inline-block text-sm font-medium text-primary hover:underline"
        >
            Read the full award standard →
        </Link>
    </div>
);

export default AwardsGuide;
