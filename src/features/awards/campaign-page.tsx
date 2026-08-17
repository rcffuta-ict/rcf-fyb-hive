import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { facePortrait } from "@/lib/cloudinary";
import ShareRow from "./share-row";
import type { CampaignCard } from "@/types/awards.types";

/**
 * The page a campaign link opens.
 *
 * Built as a single portrait plaque rather than a landing page: whoever opened
 * this got it forwarded in a chat, is on a phone, and will decide in about two
 * seconds. Face, name, what they're standing for, one button.
 */

const CampaignPage = ({ card }: { card: CampaignCard }): React.JSX.Element => {
    const fullName = `${card.firstName} ${card.lastName}`;

    return (
        <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
            <div className="surface overflow-hidden">
                <div className="relative aspect-[4/5] w-full">
                    <Image
                        src={facePortrait(card.photoUrl, {
                            width: 896,
                            height: 1120,
                            zoom: 0.55,
                        })}
                        alt={fullName}
                        fill
                        priority
                        sizes="(min-width: 640px) 448px, 100vw"
                        className="object-cover"
                    />
                    <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/70 to-transparent"
                    />

                    <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
                            <Trophy size={12} />
                            {card.categoryTitle}
                        </span>
                        <h1 className="mt-3 font-luxury text-3xl leading-tight text-foreground">
                            {fullName}
                        </h1>
                        <span
                            aria-hidden
                            className="mx-auto mt-3 block h-px w-12 bg-metallic-gold"
                        />
                        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-primary">
                            {card.nickname}
                        </p>
                    </div>
                </div>

                <div className="p-6 text-center">
                    {card.categoryDescription && (
                        <p className="text-sm leading-relaxed text-foreground/70">
                            {card.categoryDescription}
                        </p>
                    )}

                    {card.votingOpen ? (
                        <>
                            <Button asChild size="lg" className="sheen mt-5 w-full">
                                <Link href={`/awards?pick=${card.shareCode}`}>
                                    Vote {card.firstName} <ArrowRight size={18} />
                                </Link>
                            </Button>
                            <p className="mt-2.5 text-xs text-muted-foreground">
                                Any RCF FUTA member can vote — any level. One vote per
                                category, and you can change it any time before voting closes.
                            </p>
                        </>
                    ) : (
                        <p className="mt-5 rounded-token border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                            Voting isn&apos;t open right now. Keep this link — it&apos;s the
                            same one when it opens.
                        </p>
                    )}
                </div>
            </div>

            <ShareRow
                name={fullName}
                firstName={card.firstName}
                nickname={card.nickname}
                categoryTitle={card.categoryTitle}
                shareCode={card.shareCode}
            />

            <p className="mt-8 text-center text-xs text-muted-foreground">
                {site.event.title} · {site.name}
            </p>
        </section>
    );
};

export default CampaignPage;
