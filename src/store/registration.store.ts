import { create } from "zustand";

import { lookupMember, registerFinalist } from "@/actions/registration.action";
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
    photoUrl: string;
    photoPublicId: string | null;
    registration: RegistrationRecord | null;
    looking: boolean;
    submitting: boolean;
    error: string | null;

    setIdentifier: (value: string) => void;
    setPhoto: (url: string, publicId: string | null) => void;
    lookup: (identifier: string) => Promise<void>;
    proceedToPreview: () => void;
    submit: () => Promise<void>;
    back: () => void;
    reset: () => void;
};

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
    step: "identify",
    identifier: "",
    member: null,
    lookupStatus: null,
    photoUrl: "",
    photoPublicId: null,
    registration: null,
    looking: false,
    submitting: false,
    error: null,

    setIdentifier: (value) => set({ identifier: value, error: null }),

    setPhoto: (url, publicId) => set({ photoUrl: url, photoPublicId: publicId, error: null }),

    lookup: async (identifier) => {
        set({ looking: true, error: null });
        const result = await lookupMember(identifier);
        set({ lookupStatus: result.status, member: result.member ?? null, looking: false });

        if (result.status === "eligible") {
            // Start the photo step empty — registrants must upload a clear face shot.
            set({ step: "photo", photoUrl: "", photoPublicId: null });
        } else if (result.status === "error" || result.status === "config_error") {
            set({ error: result.message ?? "Something went wrong." });
        }
    },

    proceedToPreview: () => {
        if (!get().photoUrl) {
            set({ error: "Please upload a clear photo of your face." });
            return;
        }
        set({ step: "preview", error: null });
    },

    submit: async () => {
        const { member, photoUrl, photoPublicId } = get();
        if (!member) return;
        if (!photoUrl) {
            set({ error: "Please upload a clear photo of your face.", step: "photo" });
            return;
        }

        set({ submitting: true, error: null });
        const result = await registerFinalist({
            profileId: member.profileId,
            photoUrl,
            photoPublicId: photoPublicId ?? undefined,
        });
        set({ submitting: false });

        if (result.status === "success" || result.status === "already_registered") {
            set({ step: "done", registration: result.registration ?? null });
        } else {
            set({ error: result.message ?? "Could not complete registration." });
        }
    },

    back: () => {
        const { step } = get();
        if (step === "preview") {
            set({ step: "photo", error: null });
            return;
        }
        // From the photo step, go back to identify and clear the resolved member.
        set({ step: "identify", lookupStatus: null, member: null, error: null });
    },

    reset: () =>
        set({
            step: "identify",
            identifier: "",
            member: null,
            lookupStatus: null,
            photoUrl: "",
            photoPublicId: null,
            registration: null,
            looking: false,
            submitting: false,
            error: null,
        }),
}));
