"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X, Check, AlertCircle, User } from "lucide-react";

import { verifyFacePhoto } from "@/actions/storage.action";
import { appToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";
import { downscaleImage } from "@/lib/image";

type ImageUploadProps = {
    name: string;
    value?: string;
    onSelect: (file: File, previewUrl: string) => void;
    onClear: () => void;
    circular?: boolean;
    disable?: boolean;
    error?: string;
};

type Phase = "idle" | "optimizing" | "verifying";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE_MB = 5;
const MIN_DIMENSION = 300;

const isLocalPreview = (src: string): boolean =>
    src.startsWith("blob:") || src.startsWith("data:");

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
    value = "",
    onSelect,
    onClear,
    circular = true,
    disable = false,
    error,
}: ImageUploadProps): React.JSX.Element => {
    const [phase, setPhase] = useState<Phase>("idle");
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const busy = phase !== "idle";
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

        setUploadError(null);
        const toastId = appToast.loading("Preparing your photo…");

        try {
            // Shrink first so the face check (and the later save) stay fast on
            // slow connections.
            setPhase("optimizing");
            const processed = await downscaleImage(file);

            // Verify the face now, but DON'T persist — the real upload is at confirm.
            setPhase("verifying");
            appToast.loading("Checking your face…", toastId);
            const fd = new FormData();
            fd.append("file", processed);
            await verifyFacePhoto(fd);

            const previewUrl = URL.createObjectURL(processed);
            onSelect(processed, previewUrl);
            appToast.success("Face verified", toastId);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "We couldn't verify that photo. Please try again.";
            setUploadError(message);
            appToast.error(message, toastId);
        } finally {
            setPhase("idle");
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

    const handleRemove = (): void => {
        setUploadError(null);
        onClear();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openFileDialog = (): void => {
        if (!disable && !busy) fileInputRef.current?.click();
    };

    const idleLabel = errorMessage ? "Tap to try another photo" : "Tap to upload your photo";
    const phaseLabel =
        phase === "optimizing"
            ? "Preparing your photo…"
            : phase === "verifying"
              ? "Checking your face…"
              : idleLabel;

    return (
        <div className="group flex flex-col items-center">
            <input
                ref={fileInputRef}
                type="file"
                name={name}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleInputChange}
                className="hidden"
                disabled={disable || busy}
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
                    circular ? "h-44 w-44 rounded-xl" : "aspect-[4/5] w-full rounded-token",
                    dragActive
                        ? "ring-2 ring-primary"
                        : errorMessage
                          ? "ring-2 ring-destructive"
                          : "ring-1 ring-border hover:ring-primary/60",
                    disable && "cursor-not-allowed opacity-60"
                )}
            >
                {hasImage ? (
                    <>
                        <Image
                            src={value}
                            alt="Photo preview"
                            fill
                            className="object-cover"
                            unoptimized={isLocalPreview(value)}
                        />
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
                                    handleRemove();
                                }}
                                className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30"
                                title="Remove photo"
                            >
                                <X size={16} className="text-white" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                        {busy ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : errorMessage ? (
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">{phaseLabel}</span>
                    </div>
                )}

                {busy && hasImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/85 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-xs font-medium text-foreground">{phaseLabel}</span>
                    </div>
                )}
            </div>

            <div className="mt-3 min-h-[20px] max-w-[18rem] text-center">
                {errorMessage ? (
                    <span className="flex items-center justify-center gap-1.5 text-sm text-destructive">
                        <AlertCircle size={14} className="shrink-0" /> {errorMessage}
                    </span>
                ) : hasImage ? (
                    <span className="flex items-center justify-center gap-1.5 text-sm text-primary">
                        <Check size={14} /> Face verified · uploads when you confirm
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Just you · clear, front-facing · JPEG/PNG/WEBP · max {MAX_SIZE_MB}MB
                    </span>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
