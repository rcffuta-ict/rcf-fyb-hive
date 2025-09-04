"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    User,
    Mail,
    Phone,
    Heart,
    CheckCircle,
    Loader2,
    Venus,
    Mars,
    AlertCircle,
    PhoneCallIcon,
} from "lucide-react";
import ImageUpload from "../ImageUpload";
import { authStore } from "@/stores/authStore";
import { TextField } from "../Form";
import { appToast } from "@/providers/ToastProvider";
import NotAvailableYet from "@/app/components/ui/NotAvailableYet";

// Zod schema
const associateSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    contact: z.string().min(7, "Phone number is required"),
    relationshipWithAssociate: z.string().min(1, "Relationship is required"),
    picture: z.string().url("Profile picture is required"),
    gender: z.enum(["male", "female"]),
});

type AssociateFormData = z.infer<typeof associateSchema>;

export default function AssociateForm() {
    // const router = useRouter();
    const authenticatedUserGender = authStore.member?.gender as
        | "male"
        | "female";
    const oppositeGender =
        authenticatedUserGender === "male" ? "female" : "male";

    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AssociateFormData>({
        resolver: zodResolver(associateSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            contact: "",
            relationshipWithAssociate: "",
            picture: "",
            gender: oppositeGender,
        },
    });

    const onSubmit = async (data: AssociateFormData) => {
        setLoading(true);
        try {
            console.log("Submitted form data:", data);
            appToast.romantic(
                "Associate recognized",
            );

            // router.replace("/register/done?e=" + data.email);
        } catch (err) {
            console.error(err);
            appToast.error(
                "Unable to complete registration for your associate. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    return <NotAvailableYet/>;

    return (
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-5">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-champagne-gold to-rose-gold rounded-full flex items-center justify-center shadow-golden-glow">
                    <Heart className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2">
                    Associate Registration
                </h1>
                <p className="text-pearl-600 dark:text-pearl-300">
                    Invite your {oppositeGender} associate to join our elegant
                    evening
                </p>
                <div className="mt-2 text-sm text-champagne-gold bg-champagne-gold/10 px-4 py-2 rounded-xl inline-block">
                    You are registering as a {authenticatedUserGender}
                </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 align-middle">
                    {/* Profile Picture Section */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center">
                            <label className="block text-sm font-medium text-pearl-700 dark:text-pearl-200 mb-4 font-elegant">
                                Associate&apos;s Photo{" "}
                                <span className="text-rose-gold-500">*</span>
                            </label>

                            <Controller
                                name="picture"
                                control={control}
                                render={({ field }) => (
                                    <ImageUpload
                                        name="picture"
                                        onChange={(_, val) =>
                                            field.onChange(val)
                                        }
                                        getValue={() => field.value}
                                        circular={true}
                                        showPreview={true}
                                    />
                                )}
                            />

                            {errors.picture && (
                                <div className="flex items-center justify-center text-error text-sm mt-3 animate-slide-down">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    {errors?.picture?.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gender - Auto-selected */}
                    <div className="card mb-8">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Associate&apos;s Gender
                        </h3>
                        <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                            <div className="flex items-center justify-center space-x-4">
                                <div
                                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 ${
                                        oppositeGender === "female"
                                            ? "border-rose-gold bg-rose-gold/10 text-rose-gold"
                                            : "border-pearl-200 text-pearl-600"
                                    }`}
                                >
                                    {oppositeGender === "female" ? (
                                        <Venus className="w-6 h-6" />
                                    ) : (
                                        <Mars className="w-6 h-6" />
                                    )}
                                    <span className="font-semibold">
                                        {oppositeGender === "female"
                                            ? "Female"
                                            : "Male"}{" "}
                                        Associate
                                    </span>
                                </div>
                            </div>
                            <p className="text-center text-pearl-500 dark:text-pearl-400 mt-3 text-sm">
                                As a {authenticatedUserGender}, you can only
                                register a {oppositeGender} associate
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <User className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Controller
                                name="firstname"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        // getValue={() => getValues().firstname}
                                        label="First Name"
                                        required
                                        error={errors.firstname?.message}
                                        disabled={loading}
                                        icon={<User className="w-4 h-4" />}
                                    />
                                )}
                            />
                            <Controller
                                name="lastname"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Last Name"
                                        required
                                        error={errors.lastname?.message}
                                        // getValue={() => getValues().lastname}
                                        disabled={loading}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email Address"
                                        required
                                        error={errors.email?.message}
                                        // getValue={() => getValues().email}
                                        disabled={loading}
                                        type="email"
                                        icon={<Mail className="w-4 h-4" />}
                                    />
                                )}
                            />
                            <Controller
                                name="contact"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phone Number"
                                        required
                                        error={errors.contact?.message}
                                        // getValue={() => getValues().contact}
                                        disabled={loading}
                                        type="tel"
                                        icon={<PhoneCallIcon className="w-4 h-4" />}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Relationship Details
                        </h3>
                        <Controller
                            name="relationshipWithAssociate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Your Relationship with this Associate"
                                    placeholder="e.g., Friend, Family Member, Colleague"
                                    required
                                    error={
                                        errors.relationshipWithAssociate
                                            ?.message
                                    }
                                    // getValue={() =>
                                    //     getValues().relationshipWithAssociate
                                    // }
                                    disabled={loading}
                                    icon={<Heart className="w-4 h-4" />}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-8 text-center">
                    <button
                        className="btn btn-primary btn-lg transform-romantic hover-lift px-8"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Registering Associate...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Register Associate</span>
                            </div>
                        )}
                    </button>

                    <p className="text-pearl-500 dark:text-pearl-400 mt-4 text-sm">
                        By registering, you confirm this person is your{" "}
                        {oppositeGender} associate
                    </p>
                </div>
            </form>
        </div>
    );
}
