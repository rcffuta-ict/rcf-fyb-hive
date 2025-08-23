import React, { useState } from "react";
import { Form, message } from "antd";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import ImageUpload from "../ImageUpload";
import { CheckInput, TextInput } from "../Form";
import { validateAssociatetForm } from "@/utils/validate-form";
import { openNotificationWithIcon } from "@/utils/notification";
import { authStore } from "@/stores/authStore"; // Assuming you have an auth store

const dummyData: any = {};

export default function AssociateForm() {
    const [form] = Form.useForm();
    const router = useRouter();

    // Get authenticated user's gender from your auth store
    const authenticatedUserGender = authStore.member?.gender; // 'male' or 'female'
    const oppositeGender =
        authenticatedUserGender === "male" ? "female" : "male";

    const [formData, setFormData] = useState<any>({
        ...dummyData,
        // Pre-select the opposite gender
        gender: oppositeGender,
    });
    const [messageApi, contextHolder] = message.useMessage();
    const [formError, setFormError] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        const errors = validateAssociatetForm(formData);
        if (errors) {
            setFormError(errors);
            messageApi.error("Please check your information and try again");
            return;
        }

        setLoading(true);
        messageApi.open({
            type: "loading",
            content: "Submitting your details...",
            duration: 0,
            key: "loader-1",
        });

        try {
            // Replace with your actual submission logic
            console.log("Submitted form data:", formData);

            setFormError(null);
            openNotificationWithIcon(
                "success",
                "Registration Complete",
                "Your associate registration was successful!"
            );
            router.replace("/register/done?e=" + formData.email);
        } catch (err) {
            console.error(err);
            openNotificationWithIcon(
                "error",
                "Registration Failed",
                "Unable to complete registration. Please try again."
            );
        } finally {
            messageApi.destroy("loader-1");
            setLoading(false);
        }
    };

    const handleElemChange = (key: string, val: any) => {
        setFormError(null);
        setFormData((prev: any) => ({ ...prev, [key]: val }));
    };

    const getValue = (key: string) => ({ ...dummyData, ...formData }[key]);

    return (
        <>
            {contextHolder}
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-champagne-gold to-rose-gold rounded-full flex items-center justify-center shadow-golden-glow">
                        <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2">
                        Associate Registration
                    </h1>
                    <p className="text-pearl-600 dark:text-pearl-300">
                        Invite your {oppositeGender} associate to join our
                        elegant evening
                    </p>
                    <div className="mt-2 text-sm text-champagne-gold bg-champagne-gold/10 px-4 py-2 rounded-xl inline-block">
                        You are registering as a {authenticatedUserGender}
                    </div>
                </div>

                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    {/* Profile Picture Section */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center">
                            <label className="block text-sm font-medium text-pearl-700 dark:text-pearl-200 mb-4 font-elegant">
                                Associate&apos;s Photo{" "}
                                <span className="text-rose-gold-500">*</span>
                            </label>

                            {!formData.picture && (
                                <div className="flex items-center justify-center text-error text-sm mt-3">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    Profile picture required for dinner party
                                </div>
                            )}

                            <div className="mt-4 w-full max-w-xs mx-auto flex flex-col items-center">
                                <ImageUpload
                                    name="picture"
                                    onChange={handleElemChange}
                                    getValue={getValue}
                                    circular={true}
                                    showPreview={true}
                                />
                            </div>

                            {formError?.picture && (
                                <div className="flex items-center justify-center text-error text-sm mt-3 animate-slide-down">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    {formError.picture}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gender Information - Auto-selected based on authenticated user */}
                    <div className="card mb-8">
                        <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-champagne-gold-500" />
                            Associate&apos;s Gender
                        </h3>
                        <div className="p-4 bg-pearl-50/50 dark:bg-pearl-800/30 rounded-xl">
                            <div className="flex items-center justify-center space-x-4">
                                <div
                                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 ${
                                        formData.gender === "female"
                                            ? "border-rose-gold bg-rose-gold/10 text-rose-gold"
                                            : "border-pearl-200 text-pearl-600"
                                    }`}
                                >
                                    {formData.gender === "female" ? (
                                        <Venus className="w-6 h-6" />
                                    ) : (
                                        <Mars className="w-6 h-6" />
                                    )}
                                    <span className="font-semibold">
                                        {formData.gender === "female"
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

                    {/* Personal Information Section */}
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2 text-champagne-gold-500" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInput
                                    name="firstname"
                                    label="First Name"
                                    onChange={handleElemChange}
                                    getValue={getValue}
                                    required
                                    error={formError}
                                    disable={loading}
                                    icon={<User className="w-4 h-4" />}
                                />
                                <TextInput
                                    name="lastname"
                                    label="Last Name"
                                    onChange={handleElemChange}
                                    getValue={getValue}
                                    required
                                    error={formError}
                                    disable={loading}
                                />
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-champagne-gold-500" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInput
                                    name="email"
                                    label="Email Address"
                                    onChange={handleElemChange}
                                    getValue={getValue}
                                    required
                                    error={formError}
                                    disable={loading}
                                    email
                                    icon={<Mail className="w-4 h-4" />}
                                />
                                <TextInput
                                    name="contact"
                                    label="Phone Number"
                                    onChange={handleElemChange}
                                    getValue={getValue}
                                    required
                                    error={formError}
                                    disable={loading}
                                    tel
                                    // icon={<Phone className="w-4 h-4" />}
                                />
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-champagne-gold-500" />
                                Relationship Details
                            </h3>
                            <TextInput
                                name="relationshipWithAssociate"
                                label="Your Relationship with this Associate"
                                placeholder="e.g., Friend, Family Member, Colleague"
                                onChange={handleElemChange}
                                getValue={getValue}
                                required
                                error={formError}
                                disable={loading}
                                icon={<Heart className="w-4 h-4" />}
                            />
                        </div>
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
                </Form>
            </div>
        </>
    );
}
