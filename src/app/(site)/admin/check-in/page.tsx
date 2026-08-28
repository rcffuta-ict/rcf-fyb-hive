import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/actions/admin.action";
import GateCheckIn from "@/features/admin/check-in/gate-check-in";

/**
 * Gate check-in, on its own route rather than as a dashboard tab.
 *
 * Whoever works the door is holding a phone in one hand for the whole evening,
 * and every other admin control is a distraction (or a mistake) at that moment.
 * Unauthenticated visitors go to `/admin` to sign in, which is where the login
 * form lives — there is no second one here to keep in step.
 */

export const metadata: Metadata = {
    title: "Gate check-in",
    robots: { index: false, follow: false },
};

// The roster changes as couples arrive; a cached one is a queue at the door.
export const dynamic = "force-dynamic";

export default async function CheckInPage(): Promise<React.JSX.Element> {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin");

    return <GateCheckIn admin={admin} />;
}
