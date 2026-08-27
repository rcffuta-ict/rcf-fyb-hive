"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

import { castTieBreak, listTieBreaks } from "@/actions/awards-admin.action";
import { appToast } from "@/providers/ToastProvider";
import TieBreakCard from "./tie-break-card";
import type { TieBreakCategory } from "@/types/awards.types";

/**
 * The committee's ballot: every award the members left level, and one vote each.
 *
 * This exists because an award has one winner. `tallyCategory` will not crown
 * anybody in a dead heat — picking whoever sorted first would be a lie the rest
 * of the app then repeats confidently — and "it's a tie" is not something that
 * can be handed to two people at a podium. So the room's vote decides who is in
 * contention, and the committee decides between them.
 *
 * Publishing the results refuses while anything here is unsettled, which is the
 * point: the alternative is a screen in front of a hall with no name on it.
 */
const TieBreaksPanel = (): React.JSX.Element => {
    const [ties, setTies] = useState<TieBreakCategory[] | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [version, setVersion] = useState(0);
    const reload = (): void => setVersion((current) => current + 1);

    useEffect(() => {
        const load = async (): Promise<void> => {
            setTies(await listTieBreaks());
        };
        void load();
    }, [version]);

    const handlePick = async (categoryId: string, candidateId: string): Promise<void> => {
        setBusyId(categoryId);
        const result = await castTieBreak(categoryId, candidateId);
        setBusyId(null);

        if (!result.ok) {
            appToast.error(result.message);
            return;
        }

        appToast.success(result.message);
        reload();
    };

    if (!ties) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    if (ties.length === 0) {
        return (
            <div className="surface mt-4 p-8 text-center">
                <Scale size={22} className="mx-auto text-primary/60" />
                <p className="mt-3 text-sm font-medium text-foreground">
                    Nothing is tied.
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Every award has an outright leader. If one ends level, it appears here for
                    the committee to settle before results can be published.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
                The members left {ties.length} award{ties.length === 1 ? "" : "s"} level.
                Every admin gets one vote, and only between the candidates who actually
                tied — nobody who lost the members&apos; vote can be promoted here. Change
                your mind as often as you like until the results go out.
            </p>

            <ul className="mt-4 grid gap-3">
                {ties.map((tie) => (
                    <TieBreakCard
                        key={tie.categoryId}
                        tie={tie}
                        busy={busyId === tie.categoryId}
                        onPick={(candidateId) => void handlePick(tie.categoryId, candidateId)}
                    />
                ))}
            </ul>
        </div>
    );
};

export default TieBreaksPanel;
