import { cn } from "@/lib/utils";

type HexagonProps = {
    children?: React.ReactNode;
    className?: string;
    /** Render a metallic-gold border frame around the hex (logo/avatar framing). */
    framed?: boolean;
};

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

/**
 * Hexagon-clipped container — the core "Hive" shape from the logo.
 * Use to frame avatars, logos, icons and stat tiles.
 */
const Hexagon = ({ children, className, framed = false }: HexagonProps): React.JSX.Element => {
    if (framed) {
        return (
            <div
                className={cn("bg-metallic-gold p-[2px] shadow-gold-glow", className)}
                style={{ clipPath: HEX_CLIP }}
            >
                <div
                    className="flex h-full w-full items-center justify-center overflow-hidden bg-card"
                    style={{ clipPath: HEX_CLIP }}
                >
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn("flex items-center justify-center overflow-hidden", className)}
            style={{ clipPath: HEX_CLIP }}
        >
            {children}
        </div>
    );
};

export default Hexagon;
