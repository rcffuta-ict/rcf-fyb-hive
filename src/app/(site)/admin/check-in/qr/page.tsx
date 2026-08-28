import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentAdmin } from "@/actions/admin.action";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import TableQrPoster from "@/features/admin/check-in/table-qr-poster";
import { buildTableQrPoster } from "@/lib/qr-poster";
import { absoluteUrl } from "@/lib/site-url";

/**
 * The poster that gets printed and pasted at the front of the hall.
 *
 * Admin-only because it is a production step, not a guest screen — the page it
 * points at (`/tables`) is the public one. Rendered fresh each visit so a
 * changed site URL can never be baked into a poster that is already on a wall.
 */

export const metadata: Metadata = {
    title: "Table QR poster",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TableQrPage(): Promise<React.JSX.Element> {
    const admin = await getCurrentAdmin();
    if (!admin) redirect("/admin");

    const url = absoluteUrl("/tables");
    const svg = await buildTableQrPoster({
        url,
        eyebrow: site.event.title,
        title: "Find your table",
        instruction: "Point your camera here to see where you're seated",
        footer: site.name,
        logoPath: site.branding.logos.fybHive,
    });

    return (
        <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
            <div className="flex items-start justify-between gap-3 print:hidden">
                <div>
                    <span className="eyebrow">For the door</span>
                    <h1 className="mt-1 font-luxury text-foreground">Table QR poster</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Print it and paste it at the entrance. It opens the seating list at{" "}
                        <span className="font-medium text-foreground">
                            {url.replace(/^https?:\/\//, "")}
                        </span>
                        .
                    </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/check-in">
                        <ArrowLeft size={16} /> Check-in
                    </Link>
                </Button>
            </div>

            <TableQrPoster svg={svg} url={url} />
        </section>
    );
}
