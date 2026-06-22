"use client";

import { useEffect } from "react";

import { useAdminStore } from "@/store/admin.store";
import type { AdminProfile } from "@/types/fyb.types";
import type { RegistrationsPage } from "@/actions/admin.action";
import AdminLogin from "./admin-login";
import AdminDashboard from "./admin-dashboard";

type AdminPanelProps = {
    admin: AdminProfile | null;
    initial?: RegistrationsPage;
};

/**
 * Hydrates the client store from server-fetched props (in an effect, so the
 * module-level store is never written during SSR) and branches login/dashboard
 * off the store — so login and logout transitions are reactive.
 */
const AdminPanel = ({ admin, initial }: AdminPanelProps): React.JSX.Element => {
    const storeAdmin = useAdminStore((s) => s.admin);

    useEffect(() => {
        useAdminStore.getState().hydrate(admin, initial);
    }, [admin, initial]);

    return storeAdmin ? <AdminDashboard /> : <AdminLogin />;
};

export default AdminPanel;
