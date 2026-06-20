"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    User,
    Phone,
    Mail,
    Users,
    AlertCircle,
    GraduationCap,
    Venus,
    Mars,
    Briefcase,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import ImageUpload from "../ImageUpload";
import { appToast } from "@/providers/ToastProvider";
import NotEligible from "@/app/components/ui/NotEligible";
import { authStore } from "@/stores/authStore";
import { profileStore } from "@/stores/profileStore";

// Constants
const PROFILE_PICTURE_ERROR_MESSAGE =
    "A profile picture is required for our elegant dinner party";
const REGISTRATION_SUCCESS_MESSAGE =
    "Your dinner profile has been created successfully!";
const REGISTRATION_ERROR_MESSAGE = "Could not create dinner profile.";

// Zod schema
const profileSchema = z.object({
    picture: z.string().min(1, PROFILE_PICTURE_ERROR_MESSAGE),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Helper components
const StatusBadge = ({ isWorker }: { isWorker: boolean }) => (
    <span
        className={`inline-flex items-center px-4 py-2 rounded-2xl font-medium border ${
            isWorker
                ? "bg-glass-warm text-pearl-700 dark:text-pearl-200 border-pearl-300 dark:border-pearl-600"
                : "bg-pearl-100/50 dark:bg-pearl-800/50 text-pearl-600 dark:text-pearl-300 border-pearl-200 dark:border-pearl-700"
        }`}
    >
        {isWorker ? (
            <>
                <Users className="w-4 h-4 mr-2" />
                Worker
            </>
        ) : (
            <>
                <User className="w-4 h-4 mr-2" />
                Non Worker
            </>
        )}
    </span>
);

const GenderIcon = ({ gender }: { gender: string }) =>
    gender === "male" ? (
        <Mars className="w-5 h-5 text-blue-500" />
    ) : (
        <Venus className="w-5 h-5 text-pink-500" />
    );

const InfoCard = ({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ComponentType<any>;
    children: React.ReactNode;
}) => (
    <div className="card">
        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
            <Icon className="w-5 h-5 mr-2 text-champagne-gold-500" />
            {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
);

const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
        <p className="text-sm text-pearl-500 dark:text-pearl-400">{label}</p>
        <p className="text-pearl-700 dark:text-pearl-200 font-medium">
            {value}
        </p>
    </div>
);

const SubmitButton = ({ loading }: { loading: boolean }) => (
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
);

function UserProfileDisplay() {
    const user = authStore.member;
    const unit = user?.unit;
    const profile = authStore.tenureProfile;
    const level = user?.level;

    const dinnerProfile = profileStore.profile;

    const {
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        watch,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            picture: dinnerProfile?.picture || "",
        },
    });

    const pictureValue = watch("picture");

    useEffect(() => {
        // Reset form with user's picture when component mounts or user changes
        reset({
            picture: user?.picture || "",
        });
    }, [user?.picture, reset]);

    const isLegitFinalist = useMemo(() => {
        if (!user) return false;
        const finalists = profile?.finalists || [];
        return level?.label === "500" || finalists.includes(user.id);
    }, [user, profile?.finalists, level?.label]);

    const createDinnerProfile = useCallback(
        async (data: ProfileFormData) => {
            if (!user) return;

            const dinnerProfile = {
                picture: data.picture,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.contacts,
                gender: user.gender as "male" | "female",
                isWorker: !!user.unitId,
                unitId: user.unitId,
                unit: unit?.unit?.name || "Not specified",
                isFinalist: true,
            };

            try {
                await profileStore.createProfile(dinnerProfile);

                if (profileStore.error) {
                    appToast.error(profileStore.error);
                } else {
                    appToast.romantic(
                        profileStore.success || REGISTRATION_SUCCESS_MESSAGE
                    );
                }
            } catch (error: any) {
                appToast.error(error.message || REGISTRATION_ERROR_MESSAGE);
            }
        },
        [user, unit]
    );

    // Early returns for edge cases
    if (!user) return <NotEligible />;
    if (!isLegitFinalist) return <NotEligible />;

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

            <div className="p-2 lg:p-8">
                <form
                    onSubmit={handleSubmit(createDinnerProfile)}
                    className="space-y-8"
                >
                    {/* Profile Picture */}
                    <div className="text-center">
                        <label className="block text-sm font-medium text-pearl-700 dark:text-pearl-200 mb-4 font-elegant">
                            Profile Picture{" "}
                            <span className="text-rose-gold-500">*</span>
                        </label>

                        <div className="mt-4 w-full max-w-xs mx-auto flex flex-col items-center">
                            <ImageUpload
                                // key={pictureValue} // Force re-render when value changes
                                name="picture"
                                onChange={(value) =>
                                    setValue("picture", value as string, {
                                        shouldValidate: true,
                                    })
                                }
                                value={pictureValue}
                                defaultValue={dinnerProfile?.picture}
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

                    {/* Basic Info */}
                    <div className="text-center">
                        <h2 className="text-3xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2 flex items-center justify-center">
                            <GenderIcon gender={user.gender} />
                            <span className="mx-2">{user.firstname}</span>
                            <span>{user.lastname}</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <span className="text-pearl-600 dark:text-pearl-300 flex items-center">
                                <GraduationCap className="w-4 h-4 mr-1.5" />
                                Student
                            </span>
                            <div className="hidden sm:block w-px h-6 bg-pearl-300 dark:bg-pearl-600"></div>
                            <StatusBadge isWorker={!!user.unitId} />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <InfoCard title="Contact Information" icon={Mail}>
                        <InfoField label="Email" value={user.email} />
                        <InfoField label="Phone" value={user.contacts} />
                    </InfoCard>

                    {/* Fellowship Info */}
                    <InfoCard title="Fellowship Information" icon={Briefcase}>
                        <InfoField
                            label="Unit"
                            value={unit?.unit?.name || "Not specified"}
                        />
                        <InfoField
                            label="Level"
                            value={
                                level?.label
                                    ? `${level.label} Level`
                                    : "Not Specified"
                            }
                        />
                    </InfoCard>

                    {/* Submit */}
                    <div className="mt-8 text-center">
                        <SubmitButton loading={profileStore.loading} />

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
