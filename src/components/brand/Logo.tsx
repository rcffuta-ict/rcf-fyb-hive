import Image from "next/image";
import Link from "next/link";

import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
    size?: number;
    withWordmark?: boolean;
    href?: string | null;
    className?: string;
    glow?: boolean;
};

/**
 * The fyb-hive crest. Optionally paired with the wordmark and linked home.
 * Pulls source + names from site config so branding stays editable.
 */
const Logo = ({
    size = 44,
    withWordmark = false,
    href = "/",
    className,
    glow = true,
}: LogoProps): React.JSX.Element => {
    const mark = (
        <span className="flex items-center gap-3">
            <Image
                src={site.branding.logos.fybHive}
                alt={`${site.name} logo`}
                width={size}
                height={size}
                priority
                className={cn(
                    "h-auto w-auto select-none object-contain",
                    glow && "drop-shadow-[0_0_14px_rgba(232,199,123,0.35)]"
                )}
                style={{ width: size, height: size }}
            />
            {withWordmark && (
                <span className="flex flex-col leading-none">
                    <span className="font-luxury text-lg font-bold tracking-wide text-metallic-gold">
                        {site.name}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {site.tagline}
                    </span>
                </span>
            )}
        </span>
    );

    if (href) {
        return (
            <Link href={href} className={cn("inline-flex items-center", className)}>
                {mark}
            </Link>
        );
    }

    return <span className={cn("inline-flex items-center", className)}>{mark}</span>;
};

export default Logo;
