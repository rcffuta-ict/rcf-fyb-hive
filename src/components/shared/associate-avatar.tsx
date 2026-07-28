import { cn } from "@/lib/utils";
import type { Gender } from "@/types/fyb.types";

/**
 * Stand-in portrait for an associate.
 *
 * Associates are outside the fellowship, so there is no registration photo to
 * show and we deliberately don't collect one. This draws a gendered silhouette
 * on the brand gold instead — inline SVG rather than an asset, so it needs no
 * upload, no CDN round trip, and scales cleanly at any size.
 */

const Silhouette = ({ gender }: { gender: Gender }): React.JSX.Element => (
    <svg viewBox="0 0 64 64" className="h-1/2 w-1/2" aria-hidden focusable="false">
        <circle cx="32" cy="22" r="12" fill="currentColor" opacity="0.9" />
        {gender === "female" ? (
            // Shoulders flare into a skirt line — readable at 40px.
            <path
                d="M32 36c-9 0-15 5-17 13l-3 12h40l-3-12c-2-8-8-13-17-13z"
                fill="currentColor"
                opacity="0.9"
            />
        ) : (
            <path
                d="M32 36c-10 0-18 6-18 15v10h36V51c0-9-8-15-18-15z"
                fill="currentColor"
                opacity="0.9"
            />
        )}
    </svg>
);

const AssociateAvatar = ({
    gender,
    className,
}: {
    gender: Gender;
    className?: string;
}): React.JSX.Element => (
    <div
        className={cn(
            "flex items-center justify-center overflow-hidden rounded-full bg-accent text-primary ring-1 ring-primary/30",
            className
        )}
        role="img"
        aria-label={gender === "female" ? "Associate (sister)" : "Associate (brother)"}
    >
        <Silhouette gender={gender} />
    </div>
);

export default AssociateAvatar;
