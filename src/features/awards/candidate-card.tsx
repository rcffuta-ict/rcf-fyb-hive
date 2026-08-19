"use client";

import Image from "next/image";

import { facePortrait } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import BallotFrame from "./ballot-frame";
import type { AwardCandidate, CandidateMember } from "@/types/awards.types";

/**
 * One entry on a rail. Three visuals, one frame — see `ballot-frame.tsx`.
 *
 * **Individual** reads as a plaque: a framed portrait above an engraved
 * caption. Level and unit were on here early on and pulled — they turned a
 * tribute into a database row, and nobody votes on a unit. The portrait is
 * cropped around the detected face rather than pinned with `object-top`;
 * top-pinning is a guess that a face lives near the top of the frame, and it was
 * wrong for anyone who uploaded a full-length photo.
 *
 * **Clique** is deliberately the odd one out. It is wider, and its picture is a
 * mosaic of every member's face rather than one portrait, because the thing
 * being voted for is the group — a clique rendered as one person's face with a
 * group name under it would misrepresent the entry and quietly advantage
 * whoever's face got picked.
 *
 * **Brand** shows the mark, contained and uncropped, on a neutral tile. The
 * founders are named underneath in small type: the voter is choosing the
 * business, but they are entitled to know whose business it is.
 */

/** Names for the caption line, trimmed before the card turns into a directory. */
const roster = (members: CandidateMember[], limit: number): string => {
    const names = members.map((member) => member.firstName);
    if (names.length <= limit) return names.join(" · ");
    return `${names.slice(0, limit).join(" · ")} +${names.length - limit}`;
};

const CliqueMosaic = ({ members }: { members: CandidateMember[] }): React.JSX.Element => {
    // Four at most. A fifth face on a 192px card is a thumbnail of a thumbnail,
    // and the roster underneath already names everyone.
    const faces = members.slice(0, 4);
    const feature = faces.length === 3;

    if (faces.length === 0) {
        return <span className="grid h-full w-full place-items-center bg-muted/50" />;
    }

    return (
        <div
            className={cn(
                "grid h-full w-full gap-px bg-border",
                faces.length === 1 ? "grid-cols-1" : "grid-cols-2",
                faces.length > 2 && "grid-rows-2"
            )}
        >
            {faces.map((member, index) => (
                <div
                    key={member.registrationId}
                    className={cn("relative", feature && index === 0 && "row-span-2")}
                >
                    <Image
                        src={facePortrait(member.photoUrl, { width: 320, height: 400, zoom: 0.8 })}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                    />
                </div>
            ))}
        </div>
    );
};

const CandidateCard = ({
    candidate,
    selected,
    spotlit = false,
    disabled,
    railId,
    onSelect,
}: {
    candidate: AwardCandidate;
    selected: boolean;
    spotlit?: boolean;
    disabled: boolean;
    railId: string;
    onSelect: () => void;
}): React.JSX.Element => {
    const shared = {
        id: candidate.id,
        selected,
        spotlit,
        disabled,
        railId,
        caption: candidate.displayName,
        nickname: candidate.nickname,
        onSelect,
    };

    if (candidate.entryKind === "clique") {
        const names = roster(candidate.members, 4);
        return (
            <BallotFrame
                {...shared}
                width="w-52 sm:w-60"
                label={`${candidate.displayName} — ${candidate.members.length} members`}
                footnote={names}
            >
                <CliqueMosaic members={candidate.members} />
            </BallotFrame>
        );
    }

    if (candidate.entryKind === "brand") {
        return (
            <BallotFrame
                {...shared}
                width="w-44 sm:w-52"
                label={candidate.displayName}
                footnote={
                    candidate.members.length > 0
                        ? `by ${roster(candidate.members, 3)}`
                        : undefined
                }
            >
                <span className="grid h-full w-full place-items-center bg-muted/50 p-5">
                    {candidate.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- reason: logos come from arbitrary hosts; see entry-avatar.tsx
                        <img
                            src={candidate.imageUrl}
                            alt=""
                            loading="lazy"
                            className={cn(
                                "max-h-full max-w-full object-contain transition-transform duration-500",
                                !disabled && "group-hover:scale-105"
                            )}
                        />
                    ) : (
                        <span className="font-luxury text-xl text-foreground/40">
                            {candidate.displayName}
                        </span>
                    )}
                </span>
            </BallotFrame>
        );
    }

    return (
        <BallotFrame {...shared} width="w-40 sm:w-48" label={candidate.displayName}>
            <Image
                src={facePortrait(candidate.imageUrl, { width: 384, height: 480, zoom: 0.6 })}
                alt=""
                fill
                sizes="(min-width: 640px) 192px, 160px"
                className={cn(
                    "object-cover transition-all duration-500",
                    selected
                        ? "scale-105 saturate-110"
                        : "saturate-[0.8] group-hover:scale-105 group-hover:saturate-100"
                )}
            />
        </BallotFrame>
    );
};

export default CandidateCard;
