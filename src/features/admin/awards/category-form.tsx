"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { updateCategory, type AwardActionResult } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AwardCategory } from "@/types/awards.types";

/**
 * The edit form for one category — title, description, archived.
 *
 * Archiving saves immediately rather than waiting for the Save button: it is
 * the one field here with a consequence outside this panel (it can close voting
 * if it takes the last populated category off the ballot), so it should not sit
 * half-applied while someone is still typing a title.
 */

const CategoryForm = ({
    category,
    busy,
    run,
}: {
    category: AwardCategory;
    busy: boolean;
    run: (action: Promise<AwardActionResult>) => Promise<void>;
}): React.JSX.Element => {
    const [title, setTitle] = useState(category.title);
    const [description, setDescription] = useState(category.description ?? "");

    const save = (isArchived: boolean): Promise<void> =>
        run(updateCategory({ id: category.id, title, description, isArchived }));

    return (
        <div className="mt-3 space-y-3">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Category title"
            />
            <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this award is for (shown under the title)"
            />

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
                <input
                    type="checkbox"
                    defaultChecked={category.isArchived}
                    onChange={(e) => void save(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                />
                Archived — off the ballot, votes kept
            </label>

            <Button size="sm" disabled={busy} onClick={() => void save(category.isArchived)}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save
            </Button>
        </div>
    );
};

export default CategoryForm;
