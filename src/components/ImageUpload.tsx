"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X, Check, AlertCircle, User } from "lucide-react";

import { deleteProfileImage, uploadProfileImage } from "@/actions/storage.action";
import { appToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
    name: string;
    onChange: (value: string, publicId: string | null) => void;
    circular?: boolean;
    disable?: boolean;
    error?: string;
    value?: string;
    folder?: string;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE_MB = 5;
const MIN_DIMENSION = 300;

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const readDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read image."));
        };
        img.src = url;
    });

const ImageUpload = ({
    name,
    onChange,
    circular = true,
    disable = false,
    error,
    value = "",
    folder = "registrations",
}: ImageUploadProps): React.JSX.Element => {
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [publicId, setPublicId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasImage = Boolean(value);
    const errorMessage = error || uploadError;

    const validateFile = async (file: File): Promise<string | null> => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return "Only JPEG, PNG, and WEBP files are allowed.";
        }
        if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
            return `Image must be smaller than ${MAX_SIZE_MB}MB.`;
        }
        try {
            const { width, height } = await readDimensions(file);
            if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
                return `Photo is too small. Use at least ${MIN_DIMENSION}×${MIN_DIMENSION}px.`;
            }
        } catch {
            return "Could not read that image. Try another file.";
        }
        return null;
    };

    const handleFileSelect = async (file: File): Promise<void> => {
        const validationError = await validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            appToast.error(validationError);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setUploadError(null);
        const toastId = appToast.loading("Uploading photo…");

        try {
            const { url, publicId: uploadedId } = await uploadProfileImage(formData, folder);
            onChange(url, uploadedId);
            setPublicId(uploadedId);
            appToast.success("Photo uploaded", toastId);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Upload failed.";
            setUploadError(message);
            appToast.error(message, toastId);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) void handleFileSelect(file);
    };

    const handleRemove = async (): Promise<void> => {
        if (deleting || !publicId) {
            onChange("", null);
            return;
        }
        setDeleting(true);
        try {
            await deleteProfileImage(publicId);
        } catch {
            // best-effort cleanup; still clear locally
        } finally {
            onChange("", null);
            setPublicId(null);
            setDeleting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const openFileDialog = (): void => {
        if (!disable && !loading) fileInputRef.current?.click();
    };

    return (
        <div className="group flex flex-col items-center">
            <input
                ref={fileInputRef}
                type="file"
                name={name}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleInputChange}
                className="hidden"
                disabled={disable || loading}
            />

            <div
                role="button"
                tabIndex={0}
                onClick={openFileDialog}
                onKeyDown={(e) => e.key === "Enter" && openFileDialog()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                }}
                className={cn(
                    "relative flex cursor-pointer items-center justify-center overflow-hidden bg-card/60 transition-all",
                    circular ? "h-44 w-44 rounded-full" : "aspect-[4/5] w-full rounded-token",
                    dragActive
                        ? "ring-2 ring-primary"
                        : errorMessage
                          ? "ring-2 ring-destructive"
                          : "ring-1 ring-border hover:ring-primary/60",
                    disable && "cursor-not-allowed opacity-60"
                )}
                style={!circular ? { clipPath: HEX_CLIP } : undefined}
            >
                {hasImage ? (
                    <>
                        <Image src={value} alt="Photo preview" fill className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileDialog();
                                }}
                                className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30"
                                title="Change photo"
                            >
                                <Upload size={16} className="text-white" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    void handleRemove();
                                }}
                                className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30"
                                title="Remove photo"
                            >
                                {deleting ? (
                                    <Loader2 size={16} className="animate-spin text-white" />
                                ) : (
                                    <X size={16} className="text-white" />
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : errorMessage ? (
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                            {loading ? "Uploading…" : "Tap to upload your photo"}
                        </span>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>

            <div className="mt-3 min-h-[20px] text-center">
                {errorMessage ? (
                    <span className="flex items-center justify-center gap-1.5 text-sm text-destructive">
                        <AlertCircle size={14} /> {errorMessage}
                    </span>
                ) : hasImage ? (
                    <span className="flex items-center justify-center gap-1.5 text-sm text-primary">
                        <Check size={14} /> Looking good
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Clear, front-facing face · JPEG/PNG/WEBP · max {MAX_SIZE_MB}MB
                    </span>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
