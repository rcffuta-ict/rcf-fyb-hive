"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ScrollText } from "lucide-react";

import {
    listCategories,
    moveCategory,
    type AwardActionResult,
} from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";
import CategoryDetail from "./category-detail";
import CategoryList from "./category-list";
import type { DocumentedCategory } from "@/types/awards.types";

/**
 * The ballot workbench: categories on the left, one category's detail on the
 * right.
 *
 * This replaces a vertical stack of accordions in which every category carried
 * its own inline form. That layout meant scrolling past ten collapsed forms to
 * reach the eleventh, and it gave no way to see the shape of the ballot as a
 * whole — which categories are thin, which are archived, which have no criteria.
 * Two panes fix both: the left rail is the ballot at a glance, and the right is
 * one thing at a time.
 *
 * The rail scrolls inside a capped height rather than running the length of the
 * page: there are twenty-odd awards, and a list that tall would push the detail
 * pane you are actually reading off the screen.
 *
 * On narrow screens the panes become one: the list, or the detail with a back
 * button. Side-by-side at phone width would give each half too little room to
 * be worth the split.
 *
 * Note there is no "new category" control. Categories are derived from
 * `award-standard.jsonrc`, so the list below already *is* every award the
 * fellowship recognises — the committee's decision is which ones to archive,
 * not which ones to remember to create.
 */
const CategoryWorkbench = (): React.JSX.Element => {
    const [categories, setCategories] = useState<DocumentedCategory[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    // Bumping the version is how anything below asks for a re-read; the fetch
    // itself stays inside the effect, which is what keeps it out of render.
    const [version, setVersion] = useState(0);
    const reload = (): void => setVersion((current) => current + 1);

    useEffect(() => {
        const load = async (): Promise<void> => {
            const rows = await listCategories();
            setCategories(rows);
            setLoading(false);
            // The selection is re-validated rather than kept: a category can
            // vanish from this list between loads (someone archives it in
            // another tab), and a detail pane rendering a row that is no longer
            // in the list is a pane whose Save button writes into the void.
            setSelectedId((current) =>
                current && rows.some((row) => row.id === current) ? current : null
            );
        };
        void load();
    }, [version]);

    const run = async (action: Promise<AwardActionResult>): Promise<void> => {
        const result = await action;
        if (result.message) {
            if (result.ok) appToast.success(result.message);
            else appToast.error(result.message);
        }
        if (result.ok) reload();
    };

    const handleMove = async (id: string, direction: "up" | "down"): Promise<void> => {
        setBusyId(id);
        await run(moveCategory(id, direction));
        setBusyId(null);
    };

    const selected = categories.find((category) => category.id === selectedId) ?? null;
    const undocumented = categories.filter(
        (category) => !category.standard && !category.isArchived
    );

    if (loading) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    return (
        <div className="mt-4">
            {undocumented.length > 0 && (
                <div className="mb-4 flex items-start gap-2.5 rounded-token border border-destructive/40 bg-destructive/5 p-4">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
                    <p className="text-sm leading-relaxed text-foreground/80">
                        <span className="font-medium text-destructive">
                            {undocumented.length} live categor
                            {undocumented.length === 1 ? "y has" : "ies have"} no published
                            criteria.
                        </span>{" "}
                        {undocumented.length === 1 ? "It is" : "They are"} hidden from every
                        ballot, and voting cannot open until{" "}
                        {undocumented.length === 1 ? "it is" : "they are"} archived or added to
                        the standard.
                    </p>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <div className={selected ? "hidden lg:block" : ""}>
                    <div className="surface mx-auto w-full max-w-md p-4 lg:max-w-none">
                        <h3 className="font-luxury text-lg text-foreground">
                            Categories ({categories.length})
                        </h3>
                        <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                            <ScrollText size={12} className="mt-0.5 shrink-0" />
                            <span>
                                One per award in the standard, provisioned automatically.
                                Archive the ones you&apos;re not running this year.
                            </span>
                        </p>

                        {categories.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                No categories yet — the standard is empty, or the database
                                couldn&apos;t be reached.
                            </p>
                        ) : (
                            <div className="mt-4 max-h-[min(60vh,32rem)] overflow-y-auto pr-1 lg:max-h-[calc(100vh-18rem)]">
                                <CategoryList
                                    categories={categories}
                                    selectedId={selectedId}
                                    busyId={busyId}
                                    onSelect={setSelectedId}
                                    onMove={(id, direction) => void handleMove(id, direction)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={selected ? "" : "hidden lg:block"}>
                    {selected ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedId(null)}
                                className="mb-2 lg:hidden"
                            >
                                <ArrowLeft size={14} /> All categories
                            </Button>
                            <CategoryDetail
                                category={selected}
                                busy={busyId === selected.id}
                                run={run}
                            />
                        </>
                    ) : (
                        <div className="surface grid h-full min-h-64 place-items-center p-8 text-center">
                            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                                Pick a category to read its criteria and manage who is standing
                                in it. Every nominee has to clear that category&apos;s checklist
                                before they go on the ballot — and every category here comes
                                from the published standard, not from this screen.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryWorkbench;
