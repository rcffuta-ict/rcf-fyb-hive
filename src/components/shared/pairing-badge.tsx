import { Heart, HeartHandshake, Sparkles } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { PairingStatus } from "@/types/fyb.types";

/**
 * The relationship-status badge. Lives here rather than in the admin feature
 * because it shows up wherever a registration does — one component means the
 * vibe reads identically on every surface.
 */

const STATUS: Record<
    PairingStatus,
    { label: string; variant: BadgeProps["variant"]; Icon: typeof Heart }
> = {
    single: { label: "Single", variant: "outline", Icon: Sparkles },
    in_between: { label: "In-between", variant: "warning", Icon: HeartHandshake },
    taken: { label: "Taken", variant: "default", Icon: Heart },
};

const PairingBadge = ({
    status = "single",
    className,
}: {
    status?: PairingStatus;
    className?: string;
}): React.JSX.Element => {
    const { label, variant, Icon } = STATUS[status];

    return (
        <Badge variant={variant} className={className}>
            <Icon size={12} />
            {label}
        </Badge>
    );
};

export default PairingBadge;
