import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "border-primary/40 bg-primary/15 text-primary",
                secondary: "border-secondary/50 bg-secondary/25 text-secondary-foreground",
                outline: "border-border text-foreground/80",
                success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
                warning: "border-amber-500/40 bg-amber-500/15 text-amber-300",
                destructive: "border-destructive/40 bg-destructive/15 text-destructive",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof badgeVariants>;

const Badge = ({ className, variant, ...props }: BadgeProps): React.JSX.Element => (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
