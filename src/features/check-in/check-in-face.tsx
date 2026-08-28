import Image from "next/image";

import AssociateAvatar from "@/components/shared/associate-avatar";
import GenderBadge from "@/components/shared/gender-badge";
import FaceAvatar from "@/components/ui/face-avatar";
import { facePortrait } from "@/lib/cloudinary";
import type { CheckInPerson } from "@/types/fyb.types";

/**
 * One person, at two sizes.
 *
 * `portrait` is the door: the photograph is the whole point there, because what
 * the person on the gate is doing is comparing a face against a human standing
 * in front of them, at night, in a queue. A name proves nothing — anyone can
 * say a name — so the picture is given the space and the name sits under it as
 * the caption. Pulled at 640×800 and cropped head-and-shoulders, so it stays
 * sharp on a phone held at arm's length.
 *
 * `compact` is the seating plan, where the faces are only there to stop two
 * similar names being mixed up while the tables are laid out.
 */

/** Registration photos are 4:5, so the frame matches rather than crops twice. */
const PORTRAIT_WIDTH = 640;
const PORTRAIT_HEIGHT = 800;

type Props = {
    person: CheckInPerson;
    variant?: "compact" | "portrait";
};

const AssociateNote = ({ isAssociate }: { isAssociate: boolean }): React.JSX.Element | null =>
    isAssociate ? (
        <span className="ml-1.5 text-xs font-normal text-primary">associate</span>
    ) : null;

const PortraitFace = ({ person }: { person: CheckInPerson }): React.JSX.Element => (
    <div className="min-w-0">
        {person.photoUrl ? (
            <Image
                src={facePortrait(person.photoUrl, {
                    width: PORTRAIT_WIDTH,
                    height: PORTRAIT_HEIGHT,
                    // Wider than a headshot: hair, shoulders and outfit are half
                    // of how somebody is recognised on the night.
                    zoom: 0.55,
                })}
                alt={person.name}
                width={PORTRAIT_WIDTH}
                height={PORTRAIT_HEIGHT}
                priority
                sizes="(max-width: 640px) 45vw, 300px"
                className="aspect-[4/5] w-full rounded-token object-cover ring-1 ring-border"
            />
        ) : (
            <AssociateAvatar
                gender={person.gender ?? "female"}
                className="aspect-[4/5] w-full rounded-token"
            />
        )}

        <p className="mt-2 truncate text-center text-base font-semibold text-foreground sm:text-lg">
            {person.name}
            <AssociateNote isAssociate={person.isAssociate} />
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
            <GenderBadge gender={person.gender} className="px-1.5 py-0 text-[9px]" />
            <span className="truncate text-[11px] text-muted-foreground">
                {person.detail}
            </span>
        </div>
    </div>
);

const CompactFace = ({ person }: { person: CheckInPerson }): React.JSX.Element => (
    <div className="flex min-w-0 flex-1 items-center gap-3">
        {person.photoUrl ? (
            <FaceAvatar
                src={person.photoUrl}
                alt={person.name}
                size={56}
                className="h-14 w-14 ring-1 ring-border"
            />
        ) : (
            <AssociateAvatar
                gender={person.gender ?? "female"}
                className="h-14 w-14 shrink-0"
            />
        )}

        <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
                {person.name}
                <AssociateNote isAssociate={person.isAssociate} />
            </p>
            <p className="truncate text-xs text-muted-foreground">{person.detail}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <GenderBadge gender={person.gender} className="px-1.5 py-0 text-[9px]" />
                {person.phone && (
                    <span className="truncate text-[11px] text-muted-foreground">
                        {person.phone}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const CheckInFace = ({ person, variant = "compact" }: Props): React.JSX.Element =>
    variant === "portrait" ? (
        <PortraitFace person={person} />
    ) : (
        <CompactFace person={person} />
    );

export default CheckInFace;
