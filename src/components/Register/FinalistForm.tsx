"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Save,
    X,
    User,
    Phone,
    Mail,
    Users,
    Crown,
    Camera,
    AlertCircle,
    BookOpen,
    GraduationCap,
    Venus,
    Mars,
    Briefcase,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { openNotificationWithIcon } from "@/utils/notification";
import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import { Member } from "@rcffuta/ict-lib";
import ImageUpload from "../ImageUpload";

// Zod validation schema - only picture is required for editing
const profileSchema = z.object({
    picture: z
        .string()
        .min(1, "A profile picture is required for our elegant dinner party"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileProps {
    onUpdate?: (updatedUser: ProfileFormData) => void;
}

function UserProfileDisplay({ onUpdate }: UserProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useMemo(() => authStore.member || ({} as Member), []);

    const {
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            picture: user.picture || "",
        },
    });

    // Update form when user prop changes
    useEffect(() => {
        reset({
            picture: user.picture || "",
        });
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            openNotificationWithIcon(
                "success",
                "Profile Updated",
                "Your profile picture has been updated successfully!"
            );

            setIsEditing(false);

            if (onUpdate) {
                onUpdate(data);
            }
        } catch (error) {
            openNotificationWithIcon(
                "error",
                "Update Failed",
                "Could not update your profile picture. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset({
            picture: user.picture || "",
        });
        setIsEditing(false);
    };

    const getStatusBadge = () => {
        // Since we don't have exco/worker properties in Member type, we'll check for unit/team
        const hasUnit = user.unitId && user.unitId !== "";

        if (hasUnit) {
            return (
                <span className="inline-flex items-center px-4 py-2 rounded-2xl font-medium bg-glass-warm text-pearl-700 dark:text-pearl-200 border border-pearl-300 dark:border-pearl-600">
                    <Users className="w-4 h-4 mr-2" />
                    Worker
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-4 py-2 rounded-2xl font-medium bg-pearl-100/50 dark:bg-pearl-800/50 text-pearl-600 dark:text-pearl-300 border border-pearl-200 dark:border-pearl-700">
                    <User className="w-4 h-4 mr-2" />
                    Member
                </span>
            );
        }
    };

    const getGenderIcon = () => {
        return user.gender === "male" ? (
            <Mars className="w-5 h-5 text-blue-500" />
        ) : (
            <Venus className="w-5 h-5 text-pink-500" />
        );
    };

    const getAcademicLevel = () => {
        // Determine level based on matric number or other logic
        // For now, we'll use a simple approach
        return "Student";
    };

    return (
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-champagne-gold-400 to-rose-gold-400 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-white text-2xl font-luxury font-bold">
                            Fellowship Dinner Profile
                        </h1>
                        <p className="text-champagne-gold-100 text-sm mt-1">
                            Your elegant presence at our special evening
                        </p>
                    </div>
                    {isEditing && (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={loading}
                                className="btn btn-primary flex items-center space-x-2"
                            >
                                {loading ? (
                                    <div className="animate-spin">
                                        <Save className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>
                                    {loading ? "Saving..." : "Save Photo"}
                                </span>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="btn btn-outline flex items-center space-x-2 border-white/30 text-white hover:bg-white/10"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Profile Picture Section */}
                    <div className="text-center">
                        <div className="flex flex-col items-center">
                            <label className="block text-sm font-medium text-pearl-700 dark:text-pearl-200 mb-4 font-elegant">
                                Profile Picture{" "}
                                <span className="text-rose-gold-500">*</span>
                            </label>

                            {!user.picture && (
                                <div className="flex items-center justify-center text-error text-sm mt-3">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    Profile picture required for dinner party
                                </div>
                            )}

                            <div className="mt-4 w-full max-w-xs mx-auto flex flex-col items-center">
                                <ImageUpload
                                    name="picture"
                                    onChange={(name, value) =>
                                        setValue("picture", value as string)
                                    }
                                    getValue={(name) => user.picture || ""}
                                    circular={true}
                                    showPreview={true}
                                />
                            </div>

                            {errors.picture && (
                                <div className="flex items-center justify-center text-error text-sm mt-3 animate-slide-down">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    {errors.picture.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name and Status */}
                    <div className="text-center">
                        <h2 className="text-3xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2 flex items-center justify-center">
                            {getGenderIcon()}
                            <span className="mx-2">{user.firstname}</span>
                            <span>{user.lastname}</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <span className="text-pearl-600 dark:text-pearl-300 flex items-center">
                                <GraduationCap className="w-4 h-4 mr-1.5" />
                                {getAcademicLevel()}
                            </span>
                            <div className="hidden sm:block w-px h-6 bg-pearl-300 dark:bg-pearl-600"></div>
                            {getStatusBadge()}
                        </div>
                    </div>

                    {/* Display Mode - Always show information as read-only */}
                    <div className="space-y-8">
                        {/* Contact Information */}
                        <div className="card">
                            <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-champagne-gold-500" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4 p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                    <div className="bg-champagne-gold/10 p-3 rounded-full">
                                        <Mail className="w-5 h-5 text-champagne-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                            Email
                                        </p>
                                        <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                    <div className="bg-champagne-gold/10 p-3 rounded-full">
                                        <Phone className="w-5 h-5 text-champagne-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                            Phone
                                        </p>
                                        <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                            {user.contacts}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="card">
                            <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-champagne-gold-500" />
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4 p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                    <div className="bg-champagne-gold/10 p-3 rounded-full">
                                        {user.gender === "male" ? (
                                            <Mars className="w-5 h-5 text-blue-500" />
                                        ) : (
                                            <Venus className="w-5 h-5 text-pink-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                            Gender
                                        </p>
                                        <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                            {user.gender
                                                ? user.gender
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  user.gender.slice(1)
                                                : "Not specified"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                    <div className="bg-champagne-gold/10 p-3 rounded-full">
                                        <GraduationCap className="w-5 h-5 text-champagne-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                            Department
                                        </p>
                                        <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                            {user.department || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ministry Information */}
                        {user.unitId && (
                            <div className="card">
                                <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                                    <Briefcase className="w-5 h-5 mr-2 text-champagne-gold-500" />
                                    Ministry Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center space-x-4 p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                        <div className="bg-champagne-gold/10 p-3 rounded-full">
                                            <Users className="w-5 h-5 text-champagne-gold-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                                Unit
                                            </p>
                                            <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                                {user.unitId || "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                    {user.teamId && (
                                        <div className="flex items-center space-x-4 p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                            <div className="bg-golden-500/10 p-3 rounded-full">
                                                <Crown className="w-5 h-5 text-golden-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                                    Team
                                                </p>
                                                <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                                    {user.teamId}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 text-center">
                        <button
                            className="btn btn-primary btn-lg transform-romantic hover-lift px-8"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Registering you...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Register For Dinner</span>
                                </div>
                            )}
                        </button>

                        <p className="text-pearl-500 dark:text-pearl-400 mt-4 text-sm">
                            By registering, you confirm this information about
                            you is correct
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default observer(UserProfileDisplay);
