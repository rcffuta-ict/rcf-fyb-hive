import Image from "next/image";

import { facePortrait } from "@/lib/cloudinary";
import type { CampaignCard } from "@/types/awards.types";

/**
 * The image at the top of a campaign page, per entry kind.
 *
 * Kept apart from `campaign-page` because the three treatments have nothing in
 * common beyond their box: a person is a cropped portrait, a brand is a logo
 * that must not be cropped at all, and a clique is several faces that only mean
 * something together.
 */

/** Up to four faces, laid out so each stays big enough to recognise. */
const CliqueMosaic = ({ card }: { card: CampaignCard }): React.JSX.Element => {
    const faces = card.members.slice(0, 4);
    // Three faces read better as one large plus two stacked than as a row of
    // thirds — a friendship is not a police line-up.
    const feature = faces.length === 3;

    return (
        <div
            className={
                feature
                    ? "grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5"
                    : "grid h-full w-full grid-cols-2 gap-0.5"
            }
        >
            {faces.map((member, index) => (
                <div
                    key={member.registrationId}
                    className={`relative ${feature && index === 0 ? "row-span-2" : ""}`}
                >
                    <Image
                        src={facePortrait(member.photoUrl, {
                            width: 560,
                            height: 700,
                            zoom: 0.7,
                        })}
                        alt={`${member.firstName} ${member.lastName}`}
                        fill
                        sizes="(min-width: 640px) 224px, 50vw"
                        className="object-cover"
                    />
                </div>
            ))}
        </div>
    );
};

const CampaignHero = ({ card }: { card: CampaignCard }): React.JSX.Element => {
    if (card.entryKind === "clique") {
        return <CliqueMosaic card={card} />;
    }

    if (card.entryKind === "brand") {
        return (
            <div className="grid h-full w-full place-items-center bg-muted/50 p-10">
                {card.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- reason: logos come from arbitrary hosts; see entry-avatar.tsx
                    <img
                        src={card.imageUrl}
                        alt={card.displayName}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <span className="font-luxury text-3xl text-foreground/40">
                        {card.displayName}
                    </span>
                )}
            </div>
        );
    }

    return (
        <Image
            src={facePortrait(card.imageUrl, { width: 896, height: 1120, zoom: 0.55 })}
            alt={card.displayName}
            fill
            priority
            sizes="(min-width: 640px) 448px, 100vw"
            className="object-cover"
        />
    );
};

export default CampaignHero;
