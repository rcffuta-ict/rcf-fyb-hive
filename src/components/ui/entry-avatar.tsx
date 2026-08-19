import Image from "next/image";

import { facePortrait } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import type { CandidateMember, EntryKind } from "@/types/awards.types";

/**
 * The small mark for one ballot entry, whatever kind of thing it is.
 *
 * Three kinds, three honest treatments:
 *
 *   • **individual** — a face, cropped to the face. Same as `FaceAvatar`.
 *   • **brand** — the logo, `object-contain` on a neutral tile. A logo cropped
 *     to fill a circle is a logo with its edges cut off, and a business whose
 *     mark is mangled on the ballot has been quietly disadvantaged.
 *   • **clique** — a mosaic of its members' faces. There is no group photo to
 *     use and there shouldn't be: the entry is the friendship, and the honest
 *     picture of a friendship is several faces at once.
 *
 * Brand logos come from arbitrary hosts, so they render through a plain `img`
 * rather than `next/image` — the optimizer only accepts hosts named in
 * `next.config.mjs`, and opening it to every host to display a logo would be a
 * poor trade. Member and individual photos are ours, so they get the optimizer.
 */

const EntryAvatar = ({
    entryKind,
    imageUrl,
    members,
    alt,
    size,
    className,
}: {
    entryKind: EntryKind;
    /** Portrait for a person, logo for a brand, empty for a clique. */
    imageUrl: string;
    members: CandidateMember[];
    alt: string;
    /** Rendered size in CSS pixels. Twice that is requested, for retina. */
    size: number;
    className?: string;
}): React.JSX.Element => {
    const box = cn("shrink-0 overflow-hidden", className);

    if (entryKind === "brand") {
        return (
            <span
                className={cn(box, "grid place-items-center rounded-token bg-muted/60 p-1")}
                style={{ width: size, height: size }}
            >
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- reason: arbitrary logo host, see note above
                    <img
                        src={imageUrl}
                        alt={alt}
                        width={size}
                        height={size}
                        loading="lazy"
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {alt.slice(0, 2)}
                    </span>
                )}
            </span>
        );
    }

    if (entryKind === "clique") {
        // Four at most: past that the faces are too small to recognise, which
        // defeats the only reason to show them.
        const faces = members.slice(0, 4);
        return (
            <span
                className={cn(box, "grid grid-cols-2 gap-px rounded-full bg-border")}
                style={{ width: size, height: size }}
                aria-label={alt}
            >
                {faces.map((member) => (
                    <Image
                        key={member.registrationId}
                        src={facePortrait(member.photoUrl, { width: size, zoom: 0.85 })}
                        alt=""
                        width={size / 2}
                        height={size / 2}
                        className="h-full w-full object-cover"
                    />
                ))}
            </span>
        );
    }

    return (
        <Image
            src={facePortrait(imageUrl, { width: size * 2, zoom: 0.8 })}
            alt={alt}
            width={size}
            height={size}
            className={cn(box, "rounded-full object-cover")}
        />
    );
};

export default EntryAvatar;
