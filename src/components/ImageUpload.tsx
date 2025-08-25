import React, { useState, useRef } from "react";
import {
    Upload,
    Loader2,
    ImageIcon,
    X,
    Check,
    AlertCircle,
    Camera,
    User,
} from "lucide-react";
import Image from "next/image";
import { deleteProfileImage, uploadProfileImage } from "@/actions/storage.action";
import { appToast } from "@/providers/ToastProvider";
import { extractPublicId } from "cloudinary-build-url";

interface ElegantImageUploadProps {
    name: string;
    onChange: (name: string, value: string | File) => void;
    getValue: (name: string) => string | File | null;
    circular?: boolean;
    showPreview?: boolean;
    disable?: boolean;
    error?: Record<string, string>;
    label?: string;
}


const folder = "fybHive"


const ImageUpload: React.FC<ElegantImageUploadProps> = ({
    name,
    onChange,
    getValue,
    circular = true, // Default to circular for profile pictures
    showPreview = true,
    disable = false,
    error,
    label,
}) => {
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [publicId, setPublicId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const imageUrl: string =
        typeof getValue(name) === "string" ? (getValue(name) as string) : "";

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

    const getBase64Preview = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
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
        appToast.loading("Updating your image...");

        try {
            // Convert to base64 for preview and storage
            const result: any = await uploadProfileImage(formData, folder);
            onChange(name, result.secure_url);
            setUploadSuccess(true);
            setPublicId(result.public_id);

            // setTimeout(() => setUploadSuccess(false), 3000);
            appToast.success("Image updated successfully");
        } catch (err: any) {
            console.error(err);
            setUploadError("Failed to process image: " +err.message);
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

        if (!pid) {
            if (link) {
                pid = extractPublicId(link);
            }
        }

        if (isDeleting) return;

        setIsDeleting(true);

        appToast.loading("Removing image...", pid);
        try {
            await deleteProfileImage(pid);
            onChange(name, "");
            setUploadError(null);
            setUploadSuccess(false);
            setPublicId(null);
            appToast.success("Deleted Image", pid);
        } catch (err) {
            appToast.error("Delete failed", pid);
            console.error("Failed to delete image:", err);
        } finally {
            setIsDeleting(false);
        }

        
        
        
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const hasImage = !!imageUrl;
    const errorMessage = error?.[name] || uploadError;

    return (
        <div className="group relative animate-fade-in">
            {label && (
                <label className="block mb-3 font-elegant text-sm font-medium text-pearl-700 dark:text-pearl-200 transition-colors duration-300">
                    {label}
                </label>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleInputChange}
                className="hidden opacity-0"
                disabled={disable || loading}
            />

            <div
                className={`
                    relative overflow-hidden transition-all duration-400 ease-romantic cursor-pointer
                    ${
                        circular
                            ? "w-40 h-40 rounded-full"
                            : "w-full aspect-video rounded-3xl"
                    }
                    ${
                        dragActive
                            ? "border-4 border-dashed border-champagne-gold bg-champagne-gold/20 shadow-golden-glow scale-105"
                            : hasImage
                            ? "border-2 border-champagne-gold/30 bg-glass-warm backdrop-blur-sm"
                            : errorMessage
                            ? "border-2 border-dashed border-error/50 bg-error-light/10"
                            : "border-4 border-champagne-gold-200/50 bg-gradient-to-br from-pearl-100 to-pearl-200"
                    }
                    ${
                        disable
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-golden-glow hover:scale-105"
                    }
                    ${loading ? "pointer-events-none" : ""}
                    shadow-lg
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={!disable && !loading ? openFileDialog : undefined}
            >
                {hasImage ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt="Upload preview"
                            fill
                            className={`object-cover transition-all duration-300 ${
                                circular ? "rounded-full" : "rounded-2xl"
                            }`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>

                        {/* Action buttons on hover */}
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileDialog();
                                }}
                                disabled={disable || loading}
                                className="btn btn-ghost btn-sm text-white hover:text-champagne-gold bg-black/50 backdrop-blur-sm"
                                title="Change image"
                            >
                                <Upload size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                disabled={disable || loading}
                                className="btn btn-ghost btn-sm text-white hover:text-error bg-black/50 backdrop-blur-sm"
                                title="Remove image"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-full h-full flex items-center justify-center">
                            {loading ? (
                                <Loader2 className="w-12 h-12 text-champagne-gold animate-spin" />
                            ) : dragActive ? (
                                <Upload className="w-12 h-12 text-champagne-gold animate-bounce-gentle" />
                            ) : errorMessage ? (
                                <AlertCircle className="w-12 h-12 text-error" />
                            ) : (
                                <User className="w-12 h-12 text-pearl-400" />
                            )}
                        </div>

                        {/* Hover overlay for empty state */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-luxury-900/20 backdrop-blur-sm rounded-inherit flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-champagne-gold animate-spin" />
                    </div>
                )}
            </div>

            {/* Status messages */}
            <div className="mt-4 text-center">
                {!hasImage && !errorMessage && !loading && (
                    <p className="text-sm text-pearl-500 dark:text-pearl-400">
                        Click to upload your photo
                        <br />
                        <span className="text-xs">
                            JPEG, PNG, WEBP up to 5MB
                        </span>
                    </p>
                )}

                {dragActive && (
                    <p className="text-sm text-champagne-gold animate-pulse-romantic">
                        Drop your image here
                    </p>
                )}

                {errorMessage && (
                    <div className="flex items-center justify-center space-x-2 text-error animate-slide-down mt-2">
                        <AlertCircle size={14} />
                        <span className="text-sm font-medium">
                            {errorMessage}
                        </span>
                    </div>
                )}

                {uploadSuccess && !errorMessage && (
                    <div className="flex items-center justify-center space-x-2 text-success animate-slide-down mt-2">
                        <Check size={14} />
                        <span className="text-sm font-medium">
                            Image uploaded successfully!
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
