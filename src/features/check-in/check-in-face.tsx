import AssociateAvatar from "@/components/shared/associate-avatar";
import GenderBadge from "@/components/shared/gender-badge";
import FaceAvatar from "@/components/ui/face-avatar";
import type { CheckInPerson } from "@/types/fyb.types";

/**
 * One person on a check-in card.
 *
 * Bigger than the same face in the admin table on purpose: this one is being
 * compared against a human standing in front of you, in the dark, at a door.
 */
const CheckInFace = ({ person }: { person: CheckInPerson }): React.JSX.Element => (
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
                {person.isAssociate && (
                    <span className="ml-1.5 text-xs font-normal text-primary">
                        associate
                    </span>
                )}
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

export default CheckInFace;
