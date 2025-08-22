import React, { useState, useRef } from "react";
import {
    Upload,
    Loader2,
    ImageIcon,
    X,
    Check,
    AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { FormElement } from "./Form/form.interface";
import { upload_server_api, upload_server_token } from "@/lib/nobox/config";
import axios, { AxiosProgressEvent } from "axios";

type FileType = File;

interface UploadProps extends FormElement {
    name: string;
    label?: string;
    maxSizeMB?: number;
    acceptedTypes?: string[];
    showPreview?: boolean;
    circular?: boolean;
}

const ImageUpload: React.FC<UploadProps> = ({
    name,
    label,
    maxSizeMB = 5,
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
    showPreview = true,
    circular = false,
    ...props
}) => {
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const imageUrl: string = props.getValue(name) as string;

    function revealError() {
        if (!props.error) return null;
        if (!props.error[name]) return null;
        return props.error[name];
    }

    const validateFile = (file: FileType): string | null => {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            return `Only ${acceptedTypes
                .map((type) => type.split("/")[1].toUpperCase())
                .join("/")} files are allowed!`;
        }

        // Check file size
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > maxSizeMB) {
            return `Image must be smaller than ${maxSizeMB}MB! Current size: ${fileSizeMB.toFixed(
                1
            )}MB`;
        }

        return null;
    };

    const getBase64Preview = (file: FileType): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
    };

    const uploadFile = async (file: FileType) => {
        setLoading(true);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress(0);

        try {
            if (props.disable) {
                throw new Error("Upload is disabled!");
            }

            // Show preview immediately
            if (showPreview) {
                const preview = await getBase64Preview(file);
                setPreviewUrl(preview);
            }

            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(
                `${upload_server_api}/files/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${upload_server_token}`,
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        const percent = Math.floor(
                            (progressEvent.loaded /
                                (progressEvent.total || progressEvent.loaded)) *
                                100
                        );
                        setUploadProgress(percent);
                    },
                }
            );

            const data = response.data.data;
            props.onChange(name, data);

            setUploadSuccess(true);
            setPreviewUrl(null); // Clear preview, use actual URL

            // Auto-hide success state after 3 seconds
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error: any) {
            console.error("Upload error:", error);

            let errorMessage = "Failed to upload image";
            if (error.code === "ERR_NETWORK") {
                errorMessage = "Network error - image may be too large";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setUploadError(errorMessage);
            setPreviewUrl(null);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleFileSelect = async (file: FileType) => {
        const validationError = validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }

        await uploadFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
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
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const removeImage = () => {
        props.onChange(name, "");
        setPreviewUrl(null);
        setUploadError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const hasImage = imageUrl || previewUrl;
    const displayUrl = imageUrl || previewUrl;
    const error = revealError() || uploadError;

    return (
        <div className="group relative animate-fade-in">
            {/* Label */}
            {label && (
                <label className="block mb-3 font-elegant text-sm font-medium text-pearl-700 dark:text-pearl-200 transition-colors duration-300">
                    {label}
                </label>
            )}

            {/* Upload Container */}
            <div
                className={`
          relative overflow-hidden transition-all duration-400 ease-romantic cursor-pointer
          ${
              circular
                  ? "rounded-full aspect-square"
                  : "rounded-3xl aspect-video"
          }
          ${
              dragActive
                  ? "border-4 border-dashed border-champagne-gold bg-champagne-gold/20 shadow-golden-glow scale-105"
                  : hasImage
                  ? "border-2 border-champagne-gold/30 bg-glass-warm backdrop-blur-sm"
                  : error
                  ? "border-2 border-dashed border-error/50 bg-error-light/10"
                  : "border-2 border-dashed border-pearl-300 dark:border-pearl-600 bg-glass-warm backdrop-blur-sm hover:border-champagne-gold/50 hover:bg-champagne-gold/10"
          }
          ${
              props.disable
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-soft hover:scale-[1.02]"
          }
          ${loading ? "pointer-events-none" : ""}
        `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={
                    !props.disable && !loading ? openFileDialog : undefined
                }
            >
                {/* Background Shimmer */}
                {(dragActive || loading) && (
                    <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] opacity-30 animate-shimmer" />
                )}

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(",")}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={props.disable || loading}
                />

                {/* Content */}
                <div className="relative w-full h-full flex items-center justify-center p-6">
                    {hasImage ? (
                        // Image Preview
                        <div className="relative w-full h-full group/image">
                            <Image
                                src={displayUrl!}
                                alt="Upload preview"
                                fill
                                className={`object-cover transition-all duration-300 ${
                                    circular ? "rounded-full" : "rounded-2xl"
                                }`}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Overlay Controls */}
                            <div
                                className={`
                absolute inset-0 bg-luxury-900/60 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-all duration-300
                flex items-center justify-center gap-3 ${
                    circular ? "rounded-full" : "rounded-2xl"
                }
              `}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openFileDialog();
                                    }}
                                    disabled={props.disable || loading}
                                    className="btn btn-ghost btn-sm text-white hover:text-champagne-gold"
                                    title="Change image"
                                >
                                    <Upload size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage();
                                    }}
                                    disabled={props.disable || loading}
                                    className="btn btn-ghost btn-sm text-white hover:text-error"
                                    title="Remove image"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Success Indicator */}
                            {uploadSuccess && (
                                <div className="absolute top-2 right-2 bg-success text-white rounded-full p-1 animate-scale-in shadow-elevated">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                    ) : (
                        // Upload Placeholder
                        <div className="text-center space-y-4">
                            {/* Icon */}
                            <div
                                className={`
                mx-auto transition-all duration-300
                ${
                    loading
                        ? "text-champagne-gold animate-spin"
                        : dragActive
                        ? "text-champagne-gold animate-bounce-gentle"
                        : error
                        ? "text-error"
                        : "text-pearl-400 group-hover:text-champagne-gold group-hover:scale-110"
                }
              `}
                            >
                                {loading ? (
                                    <Loader2 size={48} />
                                ) : dragActive ? (
                                    <Upload size={48} />
                                ) : error ? (
                                    <AlertCircle size={48} />
                                ) : (
                                    <ImageIcon size={48} />
                                )}
                            </div>

                            {/* Text */}
                            <div className="space-y-2">
                                <h3
                                    className={`
                  font-elegant font-semibold transition-colors duration-300
                  ${
                      loading
                          ? "text-champagne-gold"
                          : error
                          ? "text-error"
                          : "text-pearl-700 dark:text-pearl-200 group-hover:text-champagne-gold"
                  }
                `}
                                >
                                    {loading
                                        ? "Uploading..."
                                        : dragActive
                                        ? "Drop image here"
                                        : error
                                        ? "Upload failed"
                                        : "Upload Image"}
                                </h3>

                                {!loading && !error && (
                                    <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                        Drag & drop or click to select
                                        <br />
                                        {acceptedTypes
                                            .map((type) =>
                                                type.split("/")[1].toUpperCase()
                                            )
                                            .join("/")}{" "}
                                        up to {maxSizeMB}MB
                                    </p>
                                )}

                                {loading && (
                                    <div className="space-y-2">
                                        <div className="w-32 mx-auto bg-pearl-200 dark:bg-pearl-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-champagne-gold to-golden-600 transition-all duration-300 ease-out"
                                                style={{
                                                    width: `${uploadProgress}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-champagne-gold font-medium">
                                            {uploadProgress}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-luxury-900/20 backdrop-blur-sm rounded-inherit" />
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-3 flex items-start space-x-2 text-error animate-slide-down">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Success Message */}
            {uploadSuccess && !error && (
                <div className="mt-3 flex items-center space-x-2 text-success animate-slide-down">
                    <Check size={16} />
                    <span className="text-sm font-medium">
                        Image uploaded successfully!
                    </span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
