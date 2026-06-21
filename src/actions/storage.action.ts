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

/**
 * Upload a registrant photo to Cloudinary.
 *
 * Uses Cloudinary's built-in face detection (`faces: true`, no paid add-on): if
 * no face is found the asset is destroyed and the upload is rejected, enforcing
 * the "clear photo of your face" requirement without anything heavy.
 */
export async function uploadProfileImage(
    formData: FormData,
    folder = "registrations"
): Promise<UploadResult> {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file uploaded");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: `fyb/${folder}`,
                    resource_type: "image",
                    faces: true,
                    quality: "auto:good",
                },
                (error, uploaded) => {
                    if (error || !uploaded) {
                        reject(error ?? new Error("Upload failed"));
                    } else {
                        resolve(uploaded);
                    }
                }
            )
            .end(buffer);
    });

    const faces = (result.faces as number[][] | undefined) ?? [];
    if (faces.length === 0) {
        await cloudinary.uploader.destroy(result.public_id).catch(() => undefined);
        throw new Error(
            "We couldn't detect a face. Please upload a clear, front-facing photo."
        );
    }

    return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteProfileImage(publicId: string): Promise<void> {
    if (!publicId) throw new Error("Public ID is required");
    await cloudinary.uploader.destroy(publicId);
}
