/**
 * Client-side image downscaling.
 *
 * Registrant photos only need enough resolution for face detection and a door
 * check — not the original 5MB camera capture. Shrinking before upload keeps the
 * (transient) face-verify upload and the final upload small and fast, which is
 * the main defence against Cloudinary upload timeouts on slow connections.
 */

type DownscaleOptions = {
    /** Longest edge of the output, in pixels. */
    maxEdge?: number;
    /** JPEG quality, 0–1. */
    quality?: number;
};

/**
 * Downscale an image File to a JPEG no larger than `maxEdge` on its longest side.
 * Returns the original file unchanged if it's already small enough or if the
 * browser can't decode it (so we never block the upload on a best-effort step).
 */
export const downscaleImage = async (
    file: File,
    { maxEdge = 1024, quality = 0.85 }: DownscaleOptions = {}
): Promise<File> => {
    if (typeof window === "undefined" || typeof createImageBitmap !== "function") {
        return file;
    }

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) return file;

    const { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    if (scale >= 1) {
        bitmap.close?.();
        return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        bitmap.close?.();
        return file;
    }

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.\w+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
};
