import { create } from "zustand";

import {
    adminLogin,
    adminLogout,
    listRegistrations,
    resendConsentEmail,
    sendPendingConsentEmails,
    type ConsentActionResult,
    type RegistrationsPage,
} from "@/actions/admin.action";
import type { AdminProfile, RegistrationRecord } from "@/types/fyb.types";

type AdminState = {
    admin: AdminProfile | null;
    registrations: RegistrationRecord[];
    total: number;
    page: number;
    pageSize: number;
    search: string;
    loading: boolean;
    loggingIn: boolean;
    error: string | null;
    /** Registration id whose consent email is currently being resent. */
    resendingId: string | null;
    backfilling: boolean;

    hydrate: (admin: AdminProfile | null, initial?: RegistrationsPage) => void;
    login: (email: string) => Promise<boolean>;
    logout: () => Promise<void>;
    setSearch: (value: string) => void;
    load: (opts?: { page?: number; search?: string }) => Promise<void>;
    resendConsent: (registrationId: string) => Promise<ConsentActionResult>;
    backfillConsent: () => Promise<ConsentActionResult>;
};

export const useAdminStore = create<AdminState>((set, get) => ({
    admin: null,
    registrations: [],
    total: 0,
    page: 1,
    pageSize: 12,
    search: "",
    loading: false,
    loggingIn: false,
    error: null,
    resendingId: null,
    backfilling: false,

    hydrate: (admin, initial) =>
        set({
            admin,
            registrations: initial?.registrations ?? [],
            total: initial?.total ?? 0,
            page: initial?.page ?? 1,
            pageSize: initial?.pageSize ?? 12,
        }),

    login: async (email) => {
        set({ loggingIn: true, error: null });
        const result = await adminLogin(email);
        if (!result.ok || !result.admin) {
            set({ loggingIn: false, error: result.message ?? "Login failed." });
            return false;
        }
        set({ admin: result.admin, loggingIn: false });
        await get().load({ page: 1, search: "" });
        return true;
    },

    logout: async () => {
        await adminLogout();
        set({ admin: null, registrations: [], total: 0, page: 1, search: "" });
    },

    setSearch: (value) => set({ search: value }),

    load: async (opts) => {
        const page = opts?.page ?? get().page;
        const search = opts?.search ?? get().search;
        set({ loading: true, error: null });
        const result = await listRegistrations({ page, search });
        set({
            registrations: result.registrations,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            loading: false,
        });
    },

    resendConsent: async (registrationId) => {
        set({ resendingId: registrationId });
        const result = await resendConsentEmail(registrationId);
        set({ resendingId: null });
        // Refresh so the row's delivery badge reflects the new queue entry.
        if (result.ok) await get().load();
        return result;
    },

    backfillConsent: async () => {
        set({ backfilling: true });
        const result = await sendPendingConsentEmails();
        set({ backfilling: false });
        if (result.ok) await get().load();
        return result;
    },
}));
