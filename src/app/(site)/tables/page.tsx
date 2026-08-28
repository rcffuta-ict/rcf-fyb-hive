import type { Metadata } from "next";

import { getCurrentCheckInManager } from "@/actions/check-in-access.action";
import Logo from "@/components/brand/logo";
import { site } from "@/config/site";
import StaffCheckIn from "@/features/check-in/staff-check-in";
import StaffBar from "@/features/tables/staff-bar";
import TableDirectory from "@/features/tables/table-directory";
import { getSeatedPairs } from "@/services/check-in.service";

/**
 * One page, two readings.
 *
 * To a guest it is the seating chart the QR poster opens: names and tables, no
 * login, nothing that isn't already on a place card. To a signed-in member of
 * the check-in team it is the door — the full roster, searchable by anything
 * they might be told, with a button that admits the couple in front of them.
 *
 * Deliberately the same URL. The plan the guest reads and the plan the door
 * works are then the same plan, and the poster on the wall never needs
 * reprinting to point somewhere else.
 */

export const metadata: Metadata = {
    title: `Find your table — ${site.event.title}`,
    description: "Seating for the evening. Search your name to find your table.",
};

// Tables move right up to the door opening; a cached plan is the wrong plan.
export const dynamic = "force-dynamic";

export default async function TablesPage(): Promise<React.JSX.Element> {
    const manager = await getCurrentCheckInManager();
    // The public list is only built for the public view — the door loads the
    // full roster itself, and there is no reason to fetch both.
    const pairs = manager ? [] : await getSeatedPairs();

    return (
        <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
            {/* The door view trims its own header on a phone: the search box and
                the first pair of faces are what has to be on screen. */}
            <div className="text-center">
                <Logo
                    size={56}
                    href={null}
                    className={manager ? "hidden justify-center sm:inline-flex" : "justify-center"}
                />
                <span className={manager ? "eyebrow hidden sm:mt-4 sm:block" : "eyebrow mt-4 block"}>
                    {site.event.title}
                </span>
                <h1 className="mt-1 font-luxury text-2xl text-foreground sm:text-4xl">
                    {manager ? "Check-in" : "Find your table"}
                </h1>
                <p className="mt-1 hidden text-sm text-muted-foreground sm:mt-2 sm:block">
                    {manager
                        ? "Search the couple in front of you, then let them through."
                        : pairs.length > 0
                          ? `${pairs.length} ${pairs.length === 1 ? "couple" : "couples"} seated so far. Search your name.`
                          : "Seating is still being arranged."}
                </p>
                {!manager && (
                    <p className="mt-1 text-sm text-muted-foreground sm:hidden">
                        {pairs.length > 0
                            ? `${pairs.length} seated so far. Search your name.`
                            : "Seating is still being arranged."}
                    </p>
                )}
            </div>

            <StaffBar manager={manager} />

            {manager ? (
                <StaffCheckIn manager={manager} />
            ) : (
                <>
                    <TableDirectory pairs={pairs} />
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Can&apos;t find your name? Speak to someone at the door — they can
                        seat you.
                    </p>
                </>
            )}
        </section>
    );
}
