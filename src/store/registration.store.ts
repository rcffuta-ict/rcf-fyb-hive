import { create } from "zustand";

import { lookupMember, registerFinalist } from "@/actions/registration.action";
import { uploadProfileImage } from "@/actions/storage.action";
import { appToast } from "@/providers/ToastProvider";
import type {
    LookupStatus,
    MemberLookup,
    RegistrationRecord,
} from "@/types/fyb.types";

type Step = "identify" | "photo" | "preview" | "done";

type RegistrationState = {
    step: Step;
    identifier: string;
    member: MemberLookup | null;
    lookupStatus: LookupStatus | null;
    photoFile: File | null;
    photoPreview: string;
    photoUrl: string;
    photoPublicId: string | null;
    registration: RegistrationRecord | null;
    looking: boolean;
    submitting: boolean;
    error: string | null;

    setIdentifier: (value: string) => void;
    setPhotoFile: (file: File, previewUrl: string) => void;
    clearPhoto: () => void;
    lookup: (identifier: string) => Promise<void>;
    proceedToPreview: () => void;
    submit: () => Promise<void>;
    back: () => void;
    reset: () => void;
};

/** Release a blob: object URL so the selected photo doesn't leak memory. */
const revokePreview = (url: string): void => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
};

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
    step: "identify",
    identifier: "",
    member: null,
    lookupStatus: null,
    photoFile: null,
    photoPreview: "",
    photoUrl: "",
    photoPublicId: null,
    registration: null,
    looking: false,
    submitting: false,
    error: null,

    setIdentifier: (value) => set({ identifier: value, error: null }),

    setPhotoFile: (file, previewUrl) => {
        revokePreview(get().photoPreview);
        set({ photoFile: file, photoPreview: previewUrl, error: null });
    },

    clearPhoto: () => {
        revokePreview(get().photoPreview);
        set({ photoFile: null, photoPreview: "" });
    },

    lookup: async (identifier) => {
        set({ looking: true, error: null });
        const result = await lookupMember(identifier);
        set({ lookupStatus: result.status, member: result.member ?? null, looking: false });

        if (result.status === "eligible") {
            // Start the photo step empty — registrants must pick a clear face shot.
            revokePreview(get().photoPreview);
            set({ step: "photo", photoFile: null, photoPreview: "" });
        } else if (result.status === "error" || result.status === "config_error") {
            set({ error: result.message ?? "Something went wrong." });
        }
    },

    proceedToPreview: () => {
        if (!get().photoFile) {
            set({ error: "Please upload a clear photo of your face." });
            return;
        }
        set({ step: "preview", error: null });
    },

    submit: async () => {
        const { member, photoFile } = get();
        if (!member) return;
        if (!photoFile) {
            set({ error: "Please upload a clear photo of your face.", step: "photo" });
            return;
        }

        set({ submitting: true, error: null });
        const toastId = appToast.loading("Uploading your photo…");
        try {
            // The photo is only persisted now — at confirm — not when it was picked.
            const formData = new FormData();
            formData.append("file", photoFile);
            const { url, publicId } = await uploadProfileImage(formData, "registrations");
            set({ photoUrl: url, photoPublicId: publicId });

            appToast.loading("Completing your registration…", toastId);
            const result = await registerFinalist({
                profileId: member.profileId,
                photoUrl: url,
                photoPublicId: publicId,
            });

            if (result.status === "success" || result.status === "already_registered") {
                appToast.success("You're registered! See you at the dinner.", toastId);
                set({ step: "done", registration: result.registration ?? null, submitting: false });
            } else {
                const message = result.message ?? "Could not complete registration.";
                appToast.error(message, toastId);
                set({ error: message, submitting: false });
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "We couldn't upload your photo. Please try again.";
            appToast.error(message, toastId);
            set({ error: message, submitting: false });
        }
    },

    back: () => {
        const { step } = get();
        if (step === "preview") {
            set({ step: "photo", error: null });
            return;
        }
        // From the photo step, go back to identify and clear the resolved member + photo.
        revokePreview(get().photoPreview);
        set({
            step: "identify",
            lookupStatus: null,
            member: null,
            photoFile: null,
            photoPreview: "",
            error: null,
        });
    },

    reset: () => {
        revokePreview(get().photoPreview);
        set({
            step: "identify",
            identifier: "",
            member: null,
            lookupStatus: null,
            photoFile: null,
            photoPreview: "",
            photoUrl: "",
            photoPublicId: null,
            registration: null,
            looking: false,
            submitting: false,
            error: null,
        });
    },
}));
