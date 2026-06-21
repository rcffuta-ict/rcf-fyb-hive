import { cn } from "@/lib/utils";

type HoneycombBackgroundProps = {
    className?: string;
};

/**
 * Decorative honeycomb pattern (the "Hive") rendered as a tiled SVG.
 * Pointer-events-none, low opacity — layer behind hero/section content.
 */
const HoneycombBackground = ({ className }: HoneycombBackgroundProps): React.JSX.Element => (
    <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern
                    id="honeycomb"
                    width="56"
                    height="100"
                    patternUnits="userSpaceOnUse"
                    patternTransform="scale(0.6)"
                >
                    <path
                        d="M28 0 L56 16 L56 50 L28 66 L0 50 L0 16 Z M28 66 L56 82 L56 100 M28 66 L0 82 L0 100 M28 0 L28 -16"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeOpacity="0.12"
                        strokeWidth="1.5"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#honeycomb)" />
        </svg>
    </div>
);

export default HoneycombBackground;
