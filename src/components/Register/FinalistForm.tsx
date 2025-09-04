"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    User,
    Phone,
    Mail,
    Users,
    Crown,
    AlertCircle,
    GraduationCap,
    Venus,
    Mars,
    Briefcase,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { authStore } from "@/stores/authStore";
import { profileStore } from "@/stores/profileStore";
import { observer } from "mobx-react-lite";
import ImageUpload from "../ImageUpload";
import { appToast } from "@/providers/ToastProvider";
import NotEligible from "@/app/components/ui/NotEligible";

// Zod schema – picture is mandatory for dinner profile
const profileSchema = z.object({
    picture: z
        .string()
        .min(1, "A profile picture is required for our elegant dinner party"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function UserProfileDisplay() {
    const user = authStore.member;
    const unit = authStore.unit;
    const profile = authStore.tenureProfile;


    const {
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        getValues,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            picture: user?.picture || "",
        },
    });

    useEffect(() => {
        reset({
            picture: user?.picture || "",
        });
    }, [user?.picture, reset]);

    const level = profile?.levels.find((e) => e.label === "500");

    const isLegitFinalist = (() => {
        const finalists = profile?.finalists || [];

        if (!user) return false;
        return (
            level?.generationId === user.levelId || finalists.includes(user.id)
        );
    })();

    if (!user) return <NotEligible />;
    if (!isLegitFinalist) return <NotEligible />;

    const onSubmit = async (data: ProfileFormData) => {
        try {
            const dinnerProfile = {
                picture: data.picture,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.contacts,
                gender: user.gender as "male" | "female",
                isWorker: !!user.unitId,
                unitId: user.unitId,
                unit: unit?.name || undefined,
                isFinalist: true, // default finalist
            };

            await profileStore.createProfile(dinnerProfile);

            if (profileStore.error) {
                appToast.error(profileStore.error);
            } else {
                appToast.romantic(
                    profileStore.success ||
                        "Your dinner profile has been created successfully!"
                );
            }
        } catch (error: any) {
            appToast.error(error.message || "Could not create dinner profile.");
        }
    };

    const getStatusBadge = () => {
        return user.unitId ? (
            <span className="inline-flex items-center px-4 py-2 rounded-2xl font-medium bg-glass-warm text-pearl-700 dark:text-pearl-200 border border-pearl-300 dark:border-pearl-600">
                <Users className="w-4 h-4 mr-2" />
                Worker
            </span>
        ) : (
            <span className="inline-flex items-center px-4 py-2 rounded-2xl font-medium bg-pearl-100/50 dark:bg-pearl-800/50 text-pearl-600 dark:text-pearl-300 border border-pearl-200 dark:border-pearl-700">
                <User className="w-4 h-4 mr-2" />
                Non Worker
            </span>
        );
    };

    const getGenderIcon = () =>
        user.gender === "male" ? (
            <Mars className="w-5 h-5 text-blue-500" />
        ) : (
            <Venus className="w-5 h-5 text-pink-500" />
        );
    
    
    
    return (
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-champagne-gold-400 to-rose-gold-400 px-8 py-6">
                <h1 className="text-white text-2xl font-luxury font-bold">
                    Fellowship Dinner Profile
                </h1>
                <p className="text-champagne-gold-100 text-sm mt-1">
                    Review your details before registering
                </p>
            </div>

            <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Profile Picture */}
                    <div className="text-center">
                        <label className="block text-sm font-medium text-pearl-700 dark:text-pearl-200 mb-4 font-elegant">
                            Profile Picture{" "}
                            <span className="text-rose-gold-500">*</span>
                        </label>

                        <div className="mt-4 w-full max-w-xs mx-auto flex flex-col items-center">
                            <ImageUpload
                                name="picture"
                                onChange={(name, value) =>
                                    setValue("picture", value as string)
                                }
                                getValue={() => getValues().picture}
                                circular={true}
                                showPreview={true}
                            />
                        </div>

                        {errors.picture && (
                            <div className="flex items-center justify-center text-error text-sm mt-3 animate-slide-down">
                                <AlertCircle className="w-4 h-4 mr-1.5" />
                                {errors.picture?.message}
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="text-center">
                        <h2 className="text-3xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2 flex items-center justify-center">
                            {getGenderIcon()}
                            <span className="mx-2">{user.firstname}</span>
                            <span>{user.lastname}</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <span className="text-pearl-600 dark:text-pearl-300 flex items-center">
                                <GraduationCap className="w-4 h-4 mr-1.5" />
                                Student
                            </span>
                            <div className="hidden sm:block w-px h-6 bg-pearl-300 dark:bg-pearl-600"></div>
                            {getStatusBadge()}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="card">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                    Email
                                </p>
                                <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                    {user.email}
                                </p>
                            </div>
                            <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                    Phone
                                </p>
                                <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                    {user.contacts}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fellowship Info */}
                    <div className="card">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Fellowship Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                    Unit
                                </p>
                                <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                    {unit?.name || "Not specified"}
                                </p>
                            </div>
                            <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                                <p className="text-sm text-pearl-500 dark:text-pearl-400">
                                    Level
                                </p>
                                <p className="text-pearl-700 dark:text-pearl-200 font-medium">
                                    {level?.label || "Not Specified"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-8 text-center">
                        <button
                            className="btn btn-primary btn-lg transform-romantic hover-lift px-8"
                            type="submit"
                            disabled={profileStore.loading}
                        >
                            {profileStore.loading ? (
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
                            If any of this information is incorrect, please
                            visit{" "}
                            <a
                                href="https://ict.rcffuta.com/portal/register"
                                className="underline text-rose-gold-500 hover:text-rose-gold-600"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ict.rcffuta.com/portal/register
                            </a>{" "}
                            to update your details.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default observer(UserProfileDisplay);
