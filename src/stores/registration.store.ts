import { create } from "zustand";

import { lookupMember, registerFinalist } from "@/actions/registration.action";
import type {
    LookupStatus,
    MemberLookup,
    RegistrationRecord,
} from "@/types/fyb.types";

type Step = "identify" | "review" | "done";

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

    setPhoto: (url, publicId) => set({ photoUrl: url, photoPublicId: publicId }),

    lookup: async (identifier) => {
        set({ looking: true, error: null });
        const result = await lookupMember(identifier);
        set({ lookupStatus: result.status, member: result.member ?? null, looking: false });

        if (result.status === "eligible") {
            set({
                step: "review",
                photoUrl: result.member?.avatarUrl ?? "",
                photoPublicId: null,
            });
        } else if (result.status === "error" || result.status === "config_error") {
            set({ error: result.message ?? "Something went wrong." });
        }
    },

    submit: async () => {
        const { member, photoUrl, photoPublicId } = get();
        if (!member) return;
        if (!photoUrl) {
            set({ error: "Please upload a clear photo of your face." });
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

    back: () => set({ step: "identify", lookupStatus: null, member: null, error: null }),

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
