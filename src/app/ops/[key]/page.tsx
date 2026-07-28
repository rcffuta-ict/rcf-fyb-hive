import type { Metadata } from "next";
import { notFound } from "next/navigation";

import OpsDashboard from "@/features/ops/ops-dashboard";
import { getEmailOpsData, isOpsKeyValid } from "@/services/email-ops.service";

/**
 * Hidden email operations page.
 *
 * Reachable only at `/ops/<OPS_KEY>`. It is linked from nowhere, excluded from
 * `sitemap`/nav, and carries `noindex, nofollow, noarchive` so a crawler that
 * somehow reaches it never publishes the path. Deliberately NOT listed in
 * robots.txt — a Disallow rule there would advertise the very URL it protects.
 *
 * A wrong key renders the ordinary 404, identical to any nonexistent route, so
 * the page cannot be discovered by probing.
 */

export const metadata: Metadata = {
    robots: { index: false, follow: false, nocache: true, noarchive: true },
};

// Always fresh: a cached queue snapshot is worse than useless when the whole
// point is to see what is stuck right now.
export const dynamic = "force-dynamic";

export default async function OpsPage({
    params,
}: {
    params: Promise<{ key: string }>;
}): Promise<React.JSX.Element> {
    const { key } = await params;
    if (!isOpsKeyValid(key)) notFound();

    const data = await getEmailOpsData();
    return <OpsDashboard data={data} opsKey={key} />;
}
