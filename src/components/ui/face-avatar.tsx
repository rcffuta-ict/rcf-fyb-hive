import Image from "next/image";

import { facePortrait } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

/**
 * A small round portrait, cropped to the face.
 *
 * Registration photos are 4:5 and framed head-to-chest. Squeezing one into a
 * 32px circle by centre-cropping lands on a collar — recognisable to nobody,
 * which defeats the point of showing a face at all. Cloudinary crops around the
 * detected face instead, so these read as people even at this size.
 */
const FaceAvatar = ({
    src,
    alt = "",
    size,
    className,
}: {
    src: string;
    alt?: string;
    /** Rendered size in CSS pixels. Twice that is requested, for retina. */
    size: number;
    className?: string;
}): React.JSX.Element => (
    <Image
        src={facePortrait(src, { width: size * 2, zoom: 0.8 })}
        alt={alt}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
    />
);

export default FaceAvatar;
