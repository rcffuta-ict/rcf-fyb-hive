"use server";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export type UploadResult = {
    url: string;
    publicId: string;
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

/** Map a raw Cloudinary/network failure to a friendly, actionable message. */
const friendlyUploadError = (err: unknown): Error => {
    const e = err as { http_code?: number; name?: string; message?: string } | null;
    const isTimeout =
        e?.http_code === 499 ||
        /timeout/i.test(e?.name ?? "") ||
        /timeout/i.test(e?.message ?? "");

    if (isTimeout) {
        return new Error(
            "The photo upload timed out — your connection looks slow. Move to better signal and try again."
        );
    }
    return new Error(
        "We couldn't reach the photo service. Please check your connection and try again."
    );
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

const fileToBuffer = async (formData: FormData): Promise<Buffer> => {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file uploaded");
    return Buffer.from(await file.arrayBuffer());
};

/** Upload for analysis, translating transport failures into friendly errors. */
const uploadAndAnalyze = async (
    formData: FormData,
    folder: string
): Promise<UploadApiResponse> => {
    const buffer = await fileToBuffer(formData);
    try {
        return await uploadBuffer(buffer, folder);
    } catch (err) {
        console.error("Cloudinary upload failed:", err);
        throw friendlyUploadError(err);
    }
};

/**
 * Run face recognition on a candidate photo WITHOUT persisting it.
 *
 * The asset is uploaded only so Cloudinary can analyse it, then destroyed
 * immediately — pass or fail. This lets the photo step validate the face up front
 * while the real (kept) upload is deferred to `uploadProfileImage` at confirm.
 */
export async function verifyFacePhoto(formData: FormData): Promise<{ ok: true }> {
    const result = await uploadAndAnalyze(formData, "registrations/_verify");

    const error = faceCheckError(result);
    await cloudinary.uploader.destroy(result.public_id).catch(() => undefined);

    if (error) throw new Error(error);
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
): Promise<UploadResult> {
    const result = await uploadAndAnalyze(formData, folder);

    const error = faceCheckError(result);
    if (error) {
        await cloudinary.uploader.destroy(result.public_id).catch(() => undefined);
        throw new Error(error);
    }

    return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteProfileImage(publicId: string): Promise<void> {
    if (!publicId) throw new Error("Public ID is required");
    await cloudinary.uploader.destroy(publicId);
}
