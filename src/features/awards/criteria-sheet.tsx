"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AwardStandard } from "@/types/awards.types";

/**
 * What this award takes — folded up, next to the rail it governs.
 *
 * Voters routinely assume an award is a popularity contest, and on most ballots
 * they are right. This is the correction, placed where the assumption forms:
 * beside the faces, before the tap. Everyone here cleared every line below, and
 * the "doesn't qualify" list is included precisely because it names the reasons
 * people usually vote — being visible, being liked, being everywhere.
 *
 * Closed by default. The criteria matter, but a ballot that opens as fifteen
 * screens of policy is a ballot nobody finishes.
 */

const CriteriaSheet = ({ standard }: { standard: AwardStandard }): React.JSX.Element => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
            >
                <Info size={12} />
                What this award takes
                <ChevronDown
                    size={13}
                    className={cn("transition-transform duration-200", open && "rotate-180")}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="surface mt-3 space-y-4 p-5 text-left">
                            <p className="text-sm leading-relaxed text-foreground/80">
                                {standard.definition}
                            </p>

                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                    Every nominee cleared all of this
                                </h3>
                                <ul className="mt-2.5 space-y-1.5">
                                    {standard.checklist.map((item) => (
                                        <li
                                            key={item}
                                            className="flex gap-2 text-sm leading-relaxed text-foreground/70"
                                        >
                                            <Check
                                                size={14}
                                                className="mt-1 shrink-0 text-primary"
                                            />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Not enough on its own
                                </h3>
                                <ul className="mt-2.5 space-y-1.5">
                                    {standard.disqualifiers.map((item) => (
                                        <li
                                            key={item}
                                            className="flex gap-2 text-sm leading-relaxed text-foreground/55"
                                        >
                                            <X size={14} className="mt-1 shrink-0 opacity-60" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {standard.note && (
                                <div className="rounded-token border border-primary/30 bg-primary/5 p-4">
                                    <h3 className="font-luxury text-sm text-foreground">
                                        {standard.note.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
                                        {standard.note.body}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CriteriaSheet;
