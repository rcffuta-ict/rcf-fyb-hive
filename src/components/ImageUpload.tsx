import React, { useState, useRef, useEffect } from "react";
import {
    Upload,
    Loader2,
    X,
    Check,
    AlertCircle,
    Camera,
    User,
} from "lucide-react";
import Image from "next/image";
import {
    deleteProfileImage,
    uploadProfileImage,
} from "@/actions/storage.action";
import { appToast } from "@/providers/ToastProvider";
import { extractPublicId } from "cloudinary-build-url";
import { observer } from "mobx-react-lite";

interface ElegantImageUploadProps {
    name: string;
    onChange: (value: string | File) => void;
    getValue?: () => string;
    circular?: boolean;
    showPreview?: boolean;
    disable?: boolean;
    error?: Record<string, string>;
    label?: string;
    value?: string;
    defaultValue?: string;
}

const folder = "fybHive";

const ImageUpload: React.FC<ElegantImageUploadProps> = ({
    name,
    onChange,
    getValue,
    circular = true,
    showPreview = true,
    disable = false,
    error,
    label,
    value,
    defaultValue,
}) => {
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [publicId, setPublicId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const url = getValue?.() ?? value ?? defaultValue ?? "";

    const [imageUrl, setImageUrl] = useState<string>(url);


    const validateFile = (file: File): string | null => {
        const acceptedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
        ];
        const maxSizeMB = 5;

        if (!acceptedTypes.includes(file.type)) {
            return `Only JPEG, PNG, and WEBP files are allowed!`;
        }

        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > maxSizeMB) {
            return `Image must be smaller than ${maxSizeMB}MB!`;
        }

        return null;
    };

    const handleFileSelect = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            appToast.error(validationError);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setUploadError(null);
        setUploadSuccess(false);
        appToast.loading("Uploading image...");

        try {
            const result: any = await uploadProfileImage(formData, folder);
            onChange(result.secure_url);
            setImageUrl(result.secure_url); // Update local state
            setUploadSuccess(true);
            setPublicId(result.public_id);
            appToast.success("Image uploaded successfully");
        } catch (err: any) {
            console.error(err);
            setUploadError("Failed to upload image: " + err.message);
            appToast.error("Failed to upload image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFileSelect(files[0]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) handleFileSelect(files[0]);
    };

    const removeImage = async (link?: string) => {
        let pid: string = publicId as string;

        if (!pid && link) {
            pid = extractPublicId(link);
        }

        if (isDeleting || !pid) return;

        setIsDeleting(true);
        appToast.loading("Removing image...");

        try {
            await deleteProfileImage(pid);
            onChange("");
            setImageUrl(""); // Clear local state
            setUploadError(null);
            setUploadSuccess(false);
            setPublicId(null);
            appToast.success("Image removed successfully");
        } catch (err) {
            appToast.error("Failed to remove image");
            console.error("Failed to delete image:", err);
        } finally {
            setIsDeleting(false);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openFileDialog = () => {
        if (!disable && !loading) {
            fileInputRef.current?.click();
        }
    };

    const hasImage = !!imageUrl;
    const errorMessage = error?.[name] || uploadError;

    return (
        <div className="group relative">
            {label && <label className="input-label mb-3">{label}</label>}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleInputChange}
                className="hidden"
                disabled={disable || loading}
            />

            <div
                className={`
                    relative overflow-hidden transition-all duration-300 ease-in-out cursor-pointer rounded-xl
                    ${circular ? "w-40 h-40 " : "w-full aspect-video"}
                    ${
                        dragActive
                            ? "border-2 border-dashed border-primary bg-primary/10"
                            : hasImage
                            ? "border border-stroke dark:border-strokedark"
                            : errorMessage
                            ? "border-2 border-dashed border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-2 border-dashed border-stroke dark:border-strokedark bg-alabaster dark:bg-blackho"
                    }
                    ${
                        disable
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-primary hover:shadow-solid-5"
                    }
                    ${loading ? "pointer-events-none" : ""}
                    shadow-solid-2
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
            >
                {hasImage ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt="Upload preview"
                            fill
                            className={
                                "object-cover transition-all duration-300 rounded-xl"
                            }
                        />

                        {/* Action buttons overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileDialog();
                                }}
                                disabled={disable || loading}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                                title="Change image"
                            >
                                <Upload size={16} className="text-white" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(imageUrl);
                                }}
                                disabled={disable || loading || isDeleting}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                                title="Remove image"
                            >
                                {isDeleting ? (
                                    <Loader2
                                        size={16}
                                        className="text-white animate-spin"
                                    />
                                ) : (
                                    <X size={16} className="text-white" />
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        {loading ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        ) : dragActive ? (
                            <>
                                <Upload className="w-8 h-8 text-primary mb-2" />
                                <span className="text-sm text-primary font-medium">
                                    Drop to upload
                                </span>
                            </>
                        ) : errorMessage ? (
                            <>
                                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                                <span className="text-sm text-red-500 font-medium">
                                    Upload failed
                                </span>
                            </>
                        ) : (
                            <>
                                <User className="w-8 h-8 text-waterloo dark:text-manatee mb-2" />
                                <span className="text-sm text-waterloo dark:text-manatee text-center">
                                    Click to upload
                                    <br />
                                    <span className="text-xs">
                                        or drag and drop
                                    </span>
                                </span>
                            </>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}
            </div>

            {/* Status messages */}
            <div className="mt-3 text-center min-h-[20px]">
                {errorMessage && (
                    <div className="flex items-center justify-center gap-2 text-red-500">
                        <AlertCircle size={14} />
                        <span className="text-sm">{errorMessage}</span>
                    </div>
                )}

                {uploadSuccess && !errorMessage && (
                    <div className="flex items-center justify-center gap-2 text-meta">
                        <Check size={14} />
                        <span className="text-sm">Upload successful!</span>
                    </div>
                )}

                {!hasImage && !errorMessage && !loading && !uploadSuccess && (
                    <p className="text-xs text-waterloo dark:text-manatee mt-1">
                        JPEG, PNG, WEBP (Max 5MB)
                    </p>
                )}
            </div>
        </div>
    );
};

export default (ImageUpload);
