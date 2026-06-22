import { getCurrentAdmin, listRegistrations } from "@/actions/admin.action";
import { AdminPanel } from "@/features/admin";

// Admin state depends on the signed httpOnly cookie, so never statically cache.
export const dynamic = "force-dynamic";

export default async function AdminPage(): Promise<React.JSX.Element> {
    const admin = await getCurrentAdmin();
    const initial = admin ? await listRegistrations({ page: 1 }) : undefined;

    return <AdminPanel admin={admin} initial={initial} />;
}
