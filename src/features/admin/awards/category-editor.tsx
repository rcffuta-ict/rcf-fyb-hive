"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import {
    deleteCategory,
    moveCategory,
    type AwardActionResult,
} from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";
import CategoryForm from "./category-form";
import type { AwardCategory } from "@/types/awards.types";

/** One category row: rename, re-describe, reorder, archive or delete. */
const CategoryEditor = ({
    category,
    isFirst,
    isLast,
    selected,
    onSelect,
    onChanged,
}: {
    category: AwardCategory;
    isFirst: boolean;
    isLast: boolean;
    selected: boolean;
    onSelect: () => void;
    onChanged: () => void;
}): React.JSX.Element => {
    const [busy, setBusy] = useState(false);

    const run = async (action: Promise<AwardActionResult>): Promise<void> => {
        setBusy(true);
        const result = await action;
        setBusy(false);
        if (result.message) {
            if (result.ok) appToast.success(result.message);
            else appToast.error(result.message);
        }
        if (result.ok) onChanged();
    };

    const handleDelete = (): void => {
        // Deleting cascades to candidates and their votes, so it asks first.
        const sure = window.confirm(
            `Delete “${category.title}”? Its candidates and every vote cast in it go too. Archive it instead if voting has started.`
        );
        if (sure) void run(deleteCategory(category.id));
    };

    return (
        <div
            className={`surface p-4 transition-colors ${selected ? "border-primary/50" : ""}`}
        >
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={onSelect}
                    className="min-w-0 flex-1 text-left"
                    aria-pressed={selected}
                >
                    <span className="font-luxury text-lg text-foreground">
                        {category.title}
                    </span>
                    {category.isArchived && (
                        <span className="ml-2 text-xs uppercase tracking-wider text-amber-600">
                            archived
                        </span>
                    )}
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                        {selected ? "Editing below" : "Tap to manage candidates"}
                    </span>
                </button>

                <div className="flex shrink-0 gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Move up"
                        disabled={isFirst || busy}
                        onClick={() => void run(moveCategory(category.id, "up"))}
                    >
                        <ArrowUp size={15} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Move down"
                        disabled={isLast || busy}
                        onClick={() => void run(moveCategory(category.id, "down"))}
                    >
                        <ArrowDown size={15} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete category"
                        disabled={busy}
                        onClick={handleDelete}
                    >
                        <Trash2 size={15} className="text-destructive" />
                    </Button>
                </div>
            </div>

            {selected && <CategoryForm category={category} busy={busy} run={run} />}
        </div>
    );
};

export default CategoryEditor;
