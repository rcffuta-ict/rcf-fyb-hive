import type { Metadata } from "next";

import Logo from "@/components/brand/logo";
import { site } from "@/config/site";
import TableDirectory from "@/features/tables/table-directory";
import { getSeatedPairs } from "@/services/check-in.service";

/**
 * "Where am I sitting?" — the page behind the QR code posted at the hall.
 *
 * Public and unauthenticated on purpose: it is reached by pointing a camera at
 * a poster, and a login screen at that moment is a queue. It carries names and
 * tables only — nothing that isn't already visible on a place card.
 */

export const metadata: Metadata = {
    title: `Find your table — ${site.event.title}`,
    description: "Seating for the evening. Search your name to find your table.",
};

// Tables move right up to the door opening; a cached plan is the wrong plan.
export const dynamic = "force-dynamic";

export default async function TablesPage(): Promise<React.JSX.Element> {
    const pairs = await getSeatedPairs();

    return (
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <div className="text-center">
                <Logo size={56} href={null} className="justify-center" />
                <span className="eyebrow mt-4 block">{site.event.title}</span>
                <h1 className="mt-1 font-luxury text-foreground">Find your table</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {pairs.length > 0
                        ? `${pairs.length} ${pairs.length === 1 ? "couple" : "couples"} seated so far. Search your name.`
                        : "Seating is still being arranged."}
                </p>
            </div>

            <TableDirectory pairs={pairs} />

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Can&apos;t find your name? Speak to someone at the door — they can seat you.
            </p>
        </section>
    );
}
