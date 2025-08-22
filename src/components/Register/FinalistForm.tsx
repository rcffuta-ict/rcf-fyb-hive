import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Edit3,
    Save,
    X,
    User,
    Phone,
    Mail,
    Users,
    Crown,
    Camera,
    Check,
    AlertCircle,
} from "lucide-react";
import ImageUpload from "../ImageUpload";
import { openNotificationWithIcon } from "@/utils/notification";

// Zod validation schema
const profileSchema = z
    .object({
        picture: z
            .string()
            .min(1, "Profile picture is required for the dinner party"),
        firstname: z.string().min(1, "First name is required"),
        lastname: z.string().min(1, "Last name is required"),
        email: z.string().email("Please enter a valid email address"),
        contact: z.string().min(1, "Phone number is required"),
        gender: z.enum(["male", "female"], {
            required_error: "Please select your gender",
        }),
        partV: z.boolean(),
        worker: z.boolean(),
        unit: z.string().optional(),
        exco: z.boolean().optional(),
        portfolio: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.worker && !data.unit) {
                return false;
            }
            return true;
        },
        {
            message: "Unit is required for workers",
            path: ["unit"],
        }
    )
    .refine(
        (data) => {
            if (data.exco && data.worker && !data.portfolio) {
                return false;
            }
            return true;
        },
        {
            message: "Portfolio is required for executives",
            path: ["portfolio"],
        }
    );

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileProps {
    user: ProfileFormData;
    onUpdate?: (updatedUser: ProfileFormData) => void;
}

export default function UserProfileDisplay({
    user,
    onUpdate,
}: UserProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: user,
    });

    const watchedValues = watch();

    // Update form when user prop changes
    useEffect(() => {
        reset(user);
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            openNotificationWithIcon(
                "success",
                "Profile Updated",
                "Your profile has been updated successfully!"
            );

            setIsEditing(false);

            if (onUpdate) {
                onUpdate(data);
            }
        } catch (error) {
            openNotificationWithIcon(
                "error",
                "Update Failed",
                "Could not update your profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset(user);
        setIsEditing(false);
    };

    const getStatusBadge = () => {
        if (watchedValues.exco && watchedValues.worker) {
            return (
                <span className="inline-flex items-center px-4 py-2 rounded-2xl font-medium bg-gradient-to-r from-champagne-gold/20 to-golden-600/20 text-champagne-gold border border-champagne-gold/30 shadow-golden-glow animate-glow-pulse">
                    <Crown className="w-4 h-4 mr-2" />
                    Executive
                </span>
            );
        } else if (watchedValues.worker) {
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
        return watchedValues.gender === "male" ? "👨" : "👩";
    };

    const getPartLevel = () => {
        return watchedValues.partV ? "Part V" : "Part IV";
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-xl font-bold">
                        Fellowship Dinner Profile
                    </h1>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={loading}
                                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>{loading ? "Saving..." : "Save"}</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Profile Picture Section */}
                    <div className="text-center mb-6">
                        {isEditing ? (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Picture{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex justify-center">
                                        {watchedValues.picture ? (
                                            <div className="relative">
                                                <img
                                                    src={watchedValues.picture}
                                                    alt="Profile"
                                                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setValue("picture", "")
                                                    }
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Handle file upload logic here
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setValue(
                                                        "picture",
                                                        event.target
                                                            ?.result as string
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                {errors.picture && (
                                    <div className="flex items-center justify-center text-red-600 text-sm mt-2">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.picture.message}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {watchedValues.picture ? (
                                    <img
                                        src={watchedValues.picture}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mx-auto mb-4"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                {!watchedValues.picture && (
                                    <div className="flex items-center justify-center text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Profile picture required for dinner
                                        party
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Name and Status */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {getGenderIcon()} {watchedValues.firstname}{" "}
                            {watchedValues.lastname}
                        </h2>
                        <div className="flex justify-center items-center space-x-3">
                            <span className="text-gray-600">
                                {getPartLevel()} Student
                            </span>
                            <span>•</span>
                            {getStatusBadge()}
                        </div>
                    </div>

                    {isEditing ? (
                        // Edit Mode
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            {...register("firstname")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.firstname && (
                                            <span className="text-red-600 text-sm">
                                                {errors.firstname.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            {...register("lastname")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.lastname && (
                                            <span className="text-red-600 text-sm">
                                                {errors.lastname.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            {...register("email")}
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.email && (
                                            <span className="text-red-600 text-sm">
                                                {errors.email.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            {...register("contact")}
                                            type="tel"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.contact && (
                                            <span className="text-red-600 text-sm">
                                                {errors.contact.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gender and Academic Level */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    {...register("gender")}
                                                    type="radio"
                                                    value="male"
                                                    className="mr-2"
                                                />
                                                <span>👨 Male</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    {...register("gender")}
                                                    type="radio"
                                                    value="female"
                                                    className="mr-2"
                                                />
                                                <span>👩 Female</span>
                                            </label>
                                        </div>
                                        {errors.gender && (
                                            <span className="text-red-600 text-sm">
                                                {errors.gender.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Level
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    {...register("partV")}
                                                    type="radio"
                                                    value="false"
                                                    className="mr-2"
                                                />
                                                <span>📚 Part IV</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    {...register("partV")}
                                                    type="radio"
                                                    value="true"
                                                    className="mr-2"
                                                />
                                                <span>🎓 Part V</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ministry Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Ministry Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                {...register("worker")}
                                                type="checkbox"
                                                className="mr-2"
                                            />
                                            <span>I am a worker</span>
                                        </label>
                                    </div>

                                    {watchedValues.worker && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit
                                                </label>
                                                <input
                                                    {...register("unit")}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {errors.unit && (
                                                    <span className="text-red-600 text-sm">
                                                        {errors.unit.message}
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <label className="flex items-center">
                                                    <input
                                                        {...register("exco")}
                                                        type="checkbox"
                                                        className="mr-2"
                                                    />
                                                    <span>
                                                        I am an executive
                                                    </span>
                                                </label>
                                            </div>

                                            {watchedValues.exco && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Portfolio
                                                    </label>
                                                    <input
                                                        {...register(
                                                            "portfolio"
                                                        )}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    {errors.portfolio && (
                                                        <span className="text-red-600 text-sm">
                                                            {
                                                                errors.portfolio
                                                                    .message
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Display Mode
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Contact Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-blue-500" />
                                        <span className="text-gray-700">
                                            {watchedValues.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-blue-500" />
                                        <span className="text-gray-700">
                                            {watchedValues.contact}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ministry Information */}
                            {watchedValues.worker && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-blue-500" />
                                        Ministry Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Unit:
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {watchedValues.unit ||
                                                    "Not specified"}
                                            </span>
                                        </div>
                                        {watchedValues.exco && (
                                            <div className="flex items-center">
                                                <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                                                <span className="font-medium text-gray-700">
                                                    Portfolio:
                                                </span>
                                                <span className="ml-2 text-gray-600">
                                                    {watchedValues.portfolio}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
