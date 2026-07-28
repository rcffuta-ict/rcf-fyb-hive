import { HelpCircle, Mars, Venus } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Gender } from "@/types/fyb.types";

/**
 * Brother / Sister, in the register the fellowship actually uses.
 *
 * Shown wherever a person is shown, alongside their pairing status. The dinner
 * pairs a brother with a sister, so gender isn't decoration here — it's the
 * rule, and seeing it up front stops people getting all the way to a lookup
 * before discovering they've asked the wrong person for a token.
 *
 * A missing gender is surfaced rather than hidden: it blocks pairing, so
 * whoever sees it needs to get it fixed.
 */

const CONFIG: Record<
    "male" | "female" | "unknown",
    { label: string; variant: BadgeProps["variant"]; Icon: typeof Mars }
> = {
    male: { label: "Brother", variant: "secondary", Icon: Mars },
    female: { label: "Sister", variant: "default", Icon: Venus },
    unknown: { label: "No gender set", variant: "destructive", Icon: HelpCircle },
};

const GenderBadge = ({
    gender,
    className,
}: {
    gender: Gender | null;
    className?: string;
}): React.JSX.Element => {
    const { label, variant, Icon } = CONFIG[gender ?? "unknown"];

    return (
        <Badge variant={variant} className={className}>
            <Icon size={12} />
            {label}
        </Badge>
    );
};

export default GenderBadge;
