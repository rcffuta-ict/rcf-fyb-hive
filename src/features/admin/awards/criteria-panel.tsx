"use client";

import { Check, ShieldAlert, X } from "lucide-react";

import type { AwardStandard } from "@/types/awards.types";

/**
 * The screening reference: what this category's nominees had to clear.
 *
 * Admin sees the whole checklist, unabridged, in the same panel where they add
 * nominees — because the decision this page exists to support is "should this
 * person be on the ballot", and that decision is only answerable with the list
 * in front of you. Read-only by design: the criteria are governed in
 * `award-standard.jsonrc` and changed by review, never from a dashboard.
 */

const CriteriaPanel = ({
    standard,
}: {
    standard: AwardStandard | null;
}): React.JSX.Element => {
    if (!standard) {
        return (
            <div className="rounded-token border border-destructive/40 bg-destructive/5 p-5">
                <h4 className="flex items-center gap-2 font-luxury text-base text-destructive">
                    <ShieldAlert size={16} /> No published criteria
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    This category&apos;s slug matches no award in the standard,
                    so it is not on anyone&apos;s ballot and voting cannot open
                    while it is live. Either archive it, or add the award to{" "}
                    <code className="break-all rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        src/constants/award-standard.jsonrc
                    </code>{" "}
                    and deploy.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {standard.entryKind === "individual"
                        ? "One finalist per entry"
                        : standard.entryKind === "clique"
                          ? "Group entry · 3+ members"
                          : "Brand entry · name, logo, founders"}
                    {standard.gender !== "any" && ` · ${standard.gender} only`}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {standard.definition}
                </p>
            </div>

            <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Screening checklist — every box, with a named example
                </h4>
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
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Does not qualify on its own
                </h4>
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
                    <h4 className="font-luxury text-sm text-foreground">
                        {standard.note.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
                        {standard.note.body}
                    </p>
                </div>
            )}

            <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                The award&apos;s name and its criteria are governed by the ICT Team, in
                the published standard, and cannot be edited from this dashboard — that
                is what stops either of them changing the night before voting.
            </p>
        </div>
    );
};

export default CriteriaPanel;
