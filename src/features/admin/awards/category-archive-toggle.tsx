"use client";

import { Archive, ArchiveRestore, Loader2 } from "lucide-react";

import { setCategoryArchived, type AwardActionResult } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import type { AwardCategory } from "@/types/awards.types";

/**
 * The only decision an admin makes about a category: run it, or don't.
 *
 * There is no title or description field here any more. An award is named by
 * `award-standard.jsonrc`, and the ballot reads that name back out of the file —
 * so renaming it from a dashboard would only make the ballot and the published
 * criteria disagree, in an app whose answer to a disputed result is "here is the
 * standard we applied".
 *
 * Archiving keeps the votes. It is an opt-out for this season, not a delete.
 */
const CategoryArchiveToggle = ({
    category,
    busy,
    run,
}: {
    category: AwardCategory;
    busy: boolean;
    run: (action: Promise<AwardActionResult>) => Promise<void>;
}): React.JSX.Element => {
    const handleToggle = (): void => {
        void run(setCategoryArchived(category.id, !category.isArchived));
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-token border border-border p-4">
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                    {category.isArchived
                        ? "Archived — off this year's ballot"
                        : "Live on this year's ballot"}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {category.isArchived
                        ? "Nobody can see or vote in it. Its votes are kept."
                        : "Archive it if the committee isn't running this award this year."}
                </p>
            </div>

            <Button
                variant={category.isArchived ? "default" : "outline"}
                size="sm"
                disabled={busy}
                onClick={handleToggle}
            >
                {busy ? (
                    <Loader2 size={15} className="animate-spin" />
                ) : category.isArchived ? (
                    <ArchiveRestore size={15} />
                ) : (
                    <Archive size={15} />
                )}
                {category.isArchived ? "Restore" : "Archive"}
            </Button>
        </div>
    );
};

export default CategoryArchiveToggle;
