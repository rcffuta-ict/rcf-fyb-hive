"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createCategory, listCategories } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/providers/ToastProvider";
import CandidatesPanel from "./candidates-panel";
import CategoryEditor from "./category-editor";
import type { AwardCategory } from "@/types/awards.types";

/** Categories list + the candidate manager for whichever one is selected. */
const CategoriesPanel = (): React.JSX.Element => {
    const [categories, setCategories] = useState<AwardCategory[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Bumping the version is how anything below asks for a re-read; the fetch
    // itself stays inside the effect, which is what keeps it out of render.
    const [version, setVersion] = useState(0);
    const reload = (): void => setVersion((current) => current + 1);

    useEffect(() => {
        const load = async (): Promise<void> => {
            setCategories(await listCategories());
            setLoading(false);
        };
        void load();
    }, [version]);

    const handleCreate = async (): Promise<void> => {
        setCreating(true);
        const result = await createCategory({ title, description });
        setCreating(false);

        if (!result.ok) {
            appToast.error(result.message);
            return;
        }
        appToast.success(result.message);
        setTitle("");
        setDescription("");
        reload();
    };

    if (loading) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    return (
        <div className="mt-4 space-y-6">
            <div className="surface p-5">
                <h3 className="font-luxury text-lg text-foreground">New category</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    The title is the award; the description is the line underneath it on the
                    ballot. Both are visible to every voter, so write them the way you want them
                    read out on the night.
                </p>
                <div className="mt-4 space-y-3 sm:flex sm:gap-3 sm:space-y-0">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Most Likely to Preach a 3-Hour Sermon"
                        className="sm:flex-1"
                    />
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="sm:flex-1"
                    />
                    <Button onClick={() => void handleCreate()} disabled={creating}>
                        {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Add
                    </Button>
                </div>
            </div>

            {categories.length === 0 ? (
                <p className="surface p-8 text-center text-sm text-muted-foreground">
                    No categories yet. The ballot stays empty until there&apos;s at least one.
                </p>
            ) : (
                <div className="space-y-3">
                    {categories.map((category, index) => (
                        <div key={category.id}>
                            <CategoryEditor
                                category={category}
                                isFirst={index === 0}
                                isLast={index === categories.length - 1}
                                selected={selectedId === category.id}
                                onSelect={() =>
                                    setSelectedId(selectedId === category.id ? null : category.id)
                                }
                                onChanged={reload}
                            />
                            {selectedId === category.id && (
                                <CandidatesPanel categoryId={category.id} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesPanel;
