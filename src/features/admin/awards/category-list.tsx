"use client";

import { AlertTriangle, ArrowDown, ArrowUp, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DocumentedCategory } from "@/types/awards.types";

/**
 * The left rail of the workbench: every category, its status at a glance.
 *
 * The chips carry the two things worth knowing without opening anything —
 * whether the category has published criteria, and whether it is archived. A
 * category with no criteria is drawn as an error rather than a warning, because
 * it is not a soft problem: it is invisible to voters and it holds the whole
 * ballot shut until it is resolved.
 */

const CategoryList = ({
    categories,
    selectedId,
    busyId,
    onSelect,
    onMove,
}: {
    categories: DocumentedCategory[];
    selectedId: string | null;
    busyId: string | null;
    onSelect: (id: string) => void;
    onMove: (id: string, direction: "up" | "down") => void;
}): React.JSX.Element => (
    <ul className="space-y-1.5">
        {categories.map((category, index) => {
            const selected = category.id === selectedId;
            const undocumented = !category.standard;

            return (
                <li key={category.id}>
                    <div
                        className={cn(
                            "flex items-start gap-1.5 rounded-token border p-3 transition-colors",
                            selected
                                ? "border-primary/60 bg-primary/5"
                                : undocumented
                                  ? "border-destructive/40"
                                  : "border-border hover:border-primary/30"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => onSelect(category.id)}
                            aria-pressed={selected}
                            className="min-w-0 flex-1 text-left"
                        >
                            <span className="block truncate font-luxury text-[15px] text-foreground">
                                {category.title}
                            </span>

                            <span className="mt-1 flex flex-wrap items-center gap-2">
                                {undocumented ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                                        <AlertTriangle size={10} /> no criteria
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                                        <ShieldCheck size={10} className="text-primary" />
                                        {category.standard?.entryKind}
                                    </span>
                                )}

                                {category.isArchived && (
                                    <span className="text-[10px] uppercase tracking-wider text-amber-600">
                                        archived
                                    </span>
                                )}
                            </span>
                        </button>

                        <div className="flex shrink-0 flex-col">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Move ${category.title} up`}
                                disabled={index === 0 || busyId === category.id}
                                onClick={() => onMove(category.id, "up")}
                                className="h-7 w-7 lg:h-6 lg:w-6"
                            >
                                <ArrowUp size={13} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Move ${category.title} down`}
                                disabled={
                                    index === categories.length - 1 || busyId === category.id
                                }
                                onClick={() => onMove(category.id, "down")}
                                className="h-7 w-7 lg:h-6 lg:w-6"
                            >
                                <ArrowDown size={13} />
                            </Button>
                        </div>
                    </div>
                </li>
            );
        })}
    </ul>
);

export default CategoryList;
