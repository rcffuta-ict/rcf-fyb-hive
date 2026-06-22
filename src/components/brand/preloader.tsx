import Image from "next/image";

import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type PreloaderProps = {
    /** Fill the viewport (route-level loading.tsx). Otherwise fills its container. */
    fullscreen?: boolean;
    label?: string;
    className?: string;
};

/**
 * Brand preloader — the crest pulsing inside a glowing hexagon with a sweeping
 * gold shine and an orbiting honeycomb ring. Used by route `loading.tsx` files
 * and inline loading states.
 */
const Preloader = ({
    fullscreen = false,
    label = "Preparing the Hive…",
    className,
}: PreloaderProps): React.JSX.Element => (
    <div
        className={cn(
            "flex flex-col items-center justify-center gap-6",
            fullscreen ? "min-h-[70vh] w-full" : "py-16",
            className
        )}
    >
        <div className="relative h-28 w-28">
            {/* Orbiting gold ring */}
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-accent/60 [animation-duration:2.5s]" />
            {/* Pulsing glow halo */}
            <span className="absolute inset-2 animate-glow-pulse rounded-full" />
            {/* Crest with sweeping shine */}
            <div className="absolute inset-3 flex animate-float items-center justify-center">
                <Image
                    src={site.branding.logos.fybHive}
                    alt={`${site.name} loading`}
                    width={88}
                    height={88}
                    priority
                    className="h-auto w-auto object-contain drop-shadow-[0_0_18px_rgba(232,199,123,0.5)]"
                />
            </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-luxury text-lg font-semibold tracking-wide text-metallic-gold">
                {site.name}
            </span>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    </div>
);

export default Preloader;
