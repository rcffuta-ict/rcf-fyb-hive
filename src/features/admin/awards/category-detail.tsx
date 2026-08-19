"use client";

import { useState } from "react";
import { ListChecks, ScrollText } from "lucide-react";

import { type AwardActionResult } from "@/actions/awards-admin.action";
import { cn } from "@/lib/utils";
import CandidatesPanel from "./candidates-panel";
import CategoryForm from "./category-form";
import CriteriaPanel from "./criteria-panel";
import type { DocumentedCategory } from "@/types/awards.types";

/**
 * The right pane: one category, its criteria, and who is standing in it.
 *
 * Criteria is the first tab on purpose. The task an admin is here to do is
 * decide whether someone belongs on the ballot, and the old layout put the
 * "add nominee" box first and the criteria nowhere — which quietly made adding
 * the default action and screening an optional one.
 *
 * There is no delete control. A category is derived from the standard and would
 * be provisioned again on the next load — deleting it would destroy its
 * nominees and votes and change nothing else. Archiving, in the Criteria tab,
 * is the real opt-out.
 */

type Tab = "criteria" | "nominees";

const CategoryDetail = ({
    category,
    busy,
    run,
}: {
    category: DocumentedCategory;
    busy: boolean;
    /** Runs an admin action, toasts the result, and refreshes the list. */
    run: (action: Promise<AwardActionResult>) => Promise<void>;
}): React.JSX.Element => {
    const [tab, setTab] = useState<Tab>("criteria");

    const tabs: { key: Tab; label: string; icon: typeof ScrollText }[] = [
        { key: "criteria", label: "Criteria", icon: ScrollText },
        { key: "nominees", label: "Nominees", icon: ListChecks },
    ];

    return (
        <div className="surface p-5">
            <div className="min-w-0">
                <h3 className="truncate font-luxury text-xl text-foreground">
                    {category.title}
                </h3>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {category.slug}
                </p>
            </div>

            <div className="mt-4 flex gap-1 border-b border-border">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        aria-selected={tab === key}
                        role="tab"
                        className={cn(
                            "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors",
                            tab === key
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            <div className="mt-5">
                {tab === "criteria" ? (
                    <>
                        <CriteriaPanel standard={category.standard} />
                        <div className="mt-6 border-t border-border pt-5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Ballot presentation
                            </h4>
                            <CategoryForm category={category} busy={busy} run={run} />
                        </div>
                    </>
                ) : category.standard ? (
                    <CandidatesPanel
                        categoryId={category.id}
                        entryKind={category.standard.entryKind}
                    />
                ) : (
                    <p className="rounded-token border border-destructive/40 bg-destructive/5 p-4 text-sm text-foreground/70">
                        Nominees can&apos;t be added to a category with no published criteria —
                        there would be nothing to screen them against. Resolve that first.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CategoryDetail;
