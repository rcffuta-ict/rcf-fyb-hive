import Image from "next/image";

import { facePortrait } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import type { SealedNominee } from "@/types/awards.types";

/**
 * An award before the unveiling: its nominees, fanned out and blurred.
 *
 * The blur is decoration over public information, never a lock over a secret.
 * A CSS filter is one devtools click away from being removed, so what sits
 * under it is the nominee list the ballot has shown for weeks — no names, no
 * counts, and no winner, because the winner is not in the page at all until the
 * organizers publish. Anyone who unblurs this learns nothing they could not
 * already have read on `/awards`.
 *
 * Fanned rather than shown in a row for the same reason it carries no names: a
 * single blurred face reads as an answer, and a screenshot of it with the
 * filter stripped off is a rumour. An overlapping pile of every nominee cannot
 * be mistaken for one.
 */

/** Enough to read as a crowd; past this the fan is just a smear. */
const FANNED = 5;
const FANNED_COMPACT = 3;

const NomineeFace = ({ nominee }: { nominee: SealedNominee }): React.JSX.Element => {
    // A clique has no photo of its own, and a brand's logo is not a face — both
    // fall back to their first member so the fan stays a fan of people.
    const photo = nominee.imageUrl || nominee.members[0]?.photoUrl || "";

    if (!photo) {
        return <div className="h-full w-full bg-muted" />;
    }

    return (
        <Image
            src={facePortrait(photo, { width: 400, zoom: 0.8 })}
            alt=""
            fill
            sizes="10rem"
            className="object-cover"
        />
    );
};

const SealedEnvelope = ({
    nominees,
    compact = false,
}: {
    nominees: SealedNominee[];
    /** For a card in a grid rather than a slide on a projector. */
    compact?: boolean;
}): React.JSX.Element => {
    const fan = nominees.slice(0, compact ? FANNED_COMPACT : FANNED);

    return (
        <div className="flex flex-col items-center">
            <div
                className="flex items-center justify-center"
                role="img"
                aria-label={`${nominees.length} nominees, sealed until the unveiling`}
            >
                {fan.map((nominee, index) => (
                    <div
                        key={nominee.candidateId}
                        className={cn(
                            "relative shrink-0 overflow-hidden rounded-full",
                            "blur-2xl ring-2 ring-primary/25 saturate-[0.6] brightness-90",
                            compact
                                ? "h-16 w-16"
                                : "h-[clamp(4.5rem,15vh,10rem)] w-[clamp(4.5rem,15vh,10rem)]",
                            index > 0 &&
                                (compact ? "-ml-6" : "-ml-[clamp(1.75rem,6vh,4rem)]")
                        )}
                    >
                        <NomineeFace nominee={nominee} />
                    </div>
                ))}
            </div>

            {nominees.length > 0 && (
                <p
                    className={cn(
                        "uppercase tracking-[0.22em] text-foreground/45",
                        compact
                            ? "mt-4 text-[0.6rem]"
                            : "mt-[3vh] text-[clamp(0.62rem,1.05vw,1.05rem)]"
                    )}
                >
                    {nominees.length} nominated
                    {!compact && " · one envelope, still sealed"}
                </p>
            )}
        </div>
    );
};

export default SealedEnvelope;
