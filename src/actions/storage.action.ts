"use server";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { BRAND_LOGO, checkLogoDimensions } from "@/constants/brand-logo";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Every action here RETURNS its failures rather than throwing them.
 *
 * A thrown error in a Server Action is redacted by Next.js in production — the
 * user gets "An error occurred in the server components render. The specific
 * message is omitted in production builds…", which tells them nothing and tells
 * us nothing either. Returning a typed result means the real reason reaches the
 * screen, and anything we genuinely can't explain arrives with a reference code
 * that is also in the server log.
 */

export type UploadFailure = {
    ok: false;
    /** Shown to the user. Always plain language, never a stack trace. */
    message: string;
    /** Present only for unexplained failures — matches a server log line. */
    reference?: string;
};

export type UploadResult = { url: string; publicId: string };
export type UploadResponse = ({ ok: true } & UploadResult) | UploadFailure;
export type VerifyResponse = { ok: true } | UploadFailure;

/**
 * Short, readable reference for an error we couldn't classify. Logged
 * server-side with the underlying cause so a screenshot from a registrant can
 * be traced to the actual exception.
 */
const logUnexpected = (scope: string, err: unknown): UploadFailure => {
    const reference = Math.random().toString(36).slice(2, 8).toUpperCase();
    console.error(`[${scope}] unexpected failure ref=${reference}:`, err);

    return {
        ok: false,
        reference,
        message:
            "Something went wrong on our side and we couldn't work out what. " +
            "Please screenshot this and send it to the ICT Coordinator so we can fix it for you.",
    };
};

/** Cloudinary built-in face box: [x, y, width, height] in pixels. */
type FaceBox = [number, number, number, number];

/**
 * The detected face must span at least this fraction of the image's longest edge.
 * Filters out faces that are too small/far to be a usable, clear portrait.
 */
const MIN_FACE_RATIO = 0.12;

/**
 * Upload timeout (ms). Generous on purpose so registrants on poor connections
 * still get through — the client downscales before upload, so payloads are small.
 */
const UPLOAD_TIMEOUT_MS = 120000;

const parseFaces = (raw: unknown): FaceBox[] => {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
        (box): box is FaceBox =>
            Array.isArray(box) && box.length === 4 && box.every((n) => typeof n === "number")
    );
};

/**
 * Validate that an uploaded asset contains exactly one, clear face. Returns a
 * user-facing error message, or `null` when the photo passes. Uses Cloudinary's
 * built-in face detection (`faces: true`, no paid add-on): the response carries a
 * bounding box per face, so we can require a single, prominent face.
 */
const faceCheckError = (result: UploadApiResponse): string | null => {
    const faces = parseFaces(result.faces);

    if (faces.length === 0) {
        return "We couldn't detect a face. Please upload a clear, front-facing photo of yourself.";
    }
    if (faces.length > 1) {
        return "We detected more than one face. Please upload a photo with only you in it.";
    }

    const [, , faceWidth, faceHeight] = faces[0];
    const longestEdge = Math.max(result.width ?? 0, result.height ?? 0);
    const faceSpan = Math.max(faceWidth, faceHeight);
    if (longestEdge > 0 && faceSpan / longestEdge < MIN_FACE_RATIO) {
        return "Your face is too small in the frame. Move closer so your face is clear and centered.";
    }

    return null;
};

/**
 * Map a raw Cloudinary/network failure to something a registrant can act on.
 * Returns null when the cause isn't recognised, so the caller falls back to the
 * referenced "contact the ICT Coordinator" message rather than inventing a
 * reason.
 */
const friendlyUploadError = (err: unknown): string | null => {
    const e = err as { http_code?: number; name?: string; message?: string } | null;
    const text = `${e?.name ?? ""} ${e?.message ?? ""}`;

    if (e?.http_code === 499 || /timeout|etimedout/i.test(text)) {
        return "The photo upload timed out — your connection looks slow. Move to better signal and try again.";
    }
    if (/ENOTFOUND|ECONNRESET|ECONNREFUSED|EAI_AGAIN|network|fetch failed/i.test(text)) {
        return "We couldn't reach the photo service. Check your connection and try again.";
    }
    if (e?.http_code === 401 || e?.http_code === 403 || /api_key|signature|401|403/i.test(text)) {
        // Misconfiguration, not the registrant's fault — say so plainly.
        return "Our photo service is misconfigured, so this isn't your fault. Please screenshot this and send it to the ICT Coordinator.";
    }
    if (e?.http_code === 400 && /file|format|unsupported/i.test(text)) {
        return "That file isn't an image we can read. Try a JPG or PNG taken with your phone camera.";
    }
    if (e?.http_code === 413 || /too large|file size/i.test(text)) {
        return "That photo is too large. Take a new one with your phone camera and try again.";
    }
    return null;
};

const uploadBuffer = (buffer: Buffer, folder: string): Promise<UploadApiResponse> =>
    new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: `fyb/${folder}`,
                    resource_type: "image",
                    faces: true,
                    quality: "auto:good",
                    timeout: UPLOAD_TIMEOUT_MS,
                },
                (error, uploaded) => {
                    if (error || !uploaded) reject(error ?? new Error("Upload failed"));
                    else resolve(uploaded);
                }
            )
            .end(buffer);
    });

/** Upload for analysis. Returns either the asset or a user-facing failure. */
const uploadAndAnalyze = async (
    formData: FormData,
    folder: string
): Promise<{ ok: true; result: UploadApiResponse } | UploadFailure> => {
    const file = formData.get("file") as File | null;
    if (!file) {
        return {
            ok: false,
            message: "No photo came through. Pick the photo again and retry.",
        };
    }

    let buffer: Buffer;
    try {
        buffer = Buffer.from(await file.arrayBuffer());
    } catch (err) {
        return logUnexpected("upload:read", err);
    }

    try {
        return { ok: true, result: await uploadBuffer(buffer, folder) };
    } catch (err) {
        const known = friendlyUploadError(err);
        if (known) {
            console.error("Cloudinary upload failed:", err);
            return { ok: false, message: known };
        }
        return logUnexpected("upload:cloudinary", err);
    }
};

/**
 * Run face recognition on a candidate photo WITHOUT persisting it.
 *
 * The asset is uploaded only so Cloudinary can analyse it, then destroyed
 * immediately — pass or fail. This lets the photo step validate the face up front
 * while the real (kept) upload is deferred to `uploadProfileImage` at confirm.
 */
export async function verifyFacePhoto(formData: FormData): Promise<VerifyResponse> {
    const uploaded = await uploadAndAnalyze(formData, "registrations/_verify");
    if (!uploaded.ok) return uploaded;

    const error = faceCheckError(uploaded.result);
    await cloudinary.uploader.destroy(uploaded.result.public_id).catch(() => undefined);

    if (error) return { ok: false, message: error };
    return { ok: true };
}

/**
 * Upload and PERSIST a registrant photo to Cloudinary, re-running the single,
 * clear-face check server-side. Called at confirm — a failed check destroys the
 * asset before rejecting so nothing is left behind.
 */
export async function uploadProfileImage(
    formData: FormData,
    folder = "registrations"
): Promise<UploadResponse> {
    const uploaded = await uploadAndAnalyze(formData, folder);
    if (!uploaded.ok) return uploaded;

    const error = faceCheckError(uploaded.result);
    if (error) {
        await cloudinary.uploader.destroy(uploaded.result.public_id).catch(() => undefined);
        return { ok: false, message: error };
    }

    return {
        ok: true,
        url: uploaded.result.secure_url,
        publicId: uploaded.result.public_id,
    };
}

/** Best-effort cleanup. Never surfaced to a user, so failure is logged only. */
export async function deleteProfileImage(publicId: string): Promise<void> {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("deleteProfileImage failed:", err);
    }
}

/**
 * Upload and persist a brand logo, checked against the logo standard.
 *
 * Deliberately not routed through `uploadProfileImage`: that one requires
 * exactly one clear face, which is the right rule for a portrait and the wrong
 * one for a wordmark. What a logo needs instead is to be legible in a small
 * square box, so this checks format, weight and geometry — the constants live
 * in `constants/brand-logo.ts`, shared with the browser-side check, so the two
 * cannot drift into disagreeing.
 *
 * A logo that fails is destroyed before the rejection returns, so a rejected
 * upload leaves nothing behind in Cloudinary.
 */
export async function uploadBrandLogo(formData: FormData): Promise<UploadResponse> {
    const file = formData.get("file") as File | null;

    // Re-checked server-side. The browser check is a courtesy; this is the one
    // that decides, because a Server Action is a public endpoint.
    if (file && !BRAND_LOGO.acceptedTypes.includes(file.type as never)) {
        return {
            ok: false,
            message: "Logos must be PNG, JPEG or WEBP. SVG files aren't accepted.",
        };
    }
    if (file && file.size / 1024 / 1024 > BRAND_LOGO.maxSizeMb) {
        return {
            ok: false,
            message: `That logo is over ${BRAND_LOGO.maxSizeMb}MB. Export a smaller version.`,
        };
    }

    const uploaded = await uploadAndAnalyze(formData, "awards/brands");
    if (!uploaded.ok) return uploaded;

    const error = checkLogoDimensions(uploaded.result.width ?? 0, uploaded.result.height ?? 0);
    if (error) {
        await cloudinary.uploader.destroy(uploaded.result.public_id).catch(() => undefined);
        return { ok: false, message: error };
    }

    return {
        ok: true,
        url: uploaded.result.secure_url,
        publicId: uploaded.result.public_id,
    };
}
