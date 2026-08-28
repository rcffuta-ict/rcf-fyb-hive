import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/actions/admin.action";
import SeatingWorkbench from "@/features/admin/seating/seating-workbench";

/**
 * The seating plan — organizers only.
 *
 * The two jobs live on two pages because they are done by different people at
 * different times: seating is planned here in one sitting, and the door is
 * worked at `/tables` by the registration team as couples arrive. Nothing on
 * this page admits anybody, and nothing on that one moves a table.
 */

export const metadata: Metadata = {
    title: "Seating plan",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SeatingPage(): Promise<React.JSX.Element> {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin");

    return <SeatingWorkbench admin={admin} />;
}
