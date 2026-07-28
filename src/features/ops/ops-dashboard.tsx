"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, Send } from "lucide-react";

import { drainQueueAction } from "@/actions/ops.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";
import type { EmailOpsData } from "@/services/email-ops.service";

/**
 * Email queue health, on one screen, built to be read on a phone — this gets
 * opened when someone says "I never got the email" and you are nowhere near a
 * laptop.
 */

const timeFmt = new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

const since = (iso: string | null): string => {
    if (!iso) return "—";
    const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
    return `${Math.round(minutes / 1440)}d ago`;
};

const Stat = ({
    label,
    value,
    tone = "muted",
}: {
    label: string;
    value: number | string;
    tone?: "muted" | "good" | "warn" | "bad";
}): React.JSX.Element => {
    const toneClass = {
        muted: "text-foreground",
        good: "text-emerald-400",
        warn: "text-amber-400",
        bad: "text-destructive",
    }[tone];

    return (
        <div className="surface p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-1 font-luxury text-2xl ${toneClass}`}>{value}</p>
        </div>
    );
};

const OpsDashboard = ({
    data,
    opsKey,
}: {
    data: EmailOpsData;
    opsKey: string;
}): React.JSX.Element => {
    const [draining, setDraining] = useState(false);
    const { queue, stuck, stats } = data;

    const handleDrain = async (): Promise<void> => {
        setDraining(true);
        const result = await drainQueueAction(opsKey);
        setDraining(false);

        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    const backlog = queue.pending + queue.sending;

    return (
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="eyebrow">Internal</span>
                    <h1 className="mt-1 font-luxury text-foreground">Email queue</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {backlog === 0
                            ? "Nothing waiting. All clear."
                            : `${backlog} message${backlog === 1 ? "" : "s"} waiting to go out.`}
                    </p>
                </div>
                <Button disabled={draining} onClick={() => void handleDrain()}>
                    {draining ? (
                        <RefreshCw size={16} className="animate-spin" />
                    ) : (
                        <Send size={16} />
                    )}
                    {draining ? "Flushing…" : "Flush queue now"}
                </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                    label="Pending"
                    value={queue.pending}
                    tone={queue.pending > 0 ? "warn" : "good"}
                />
                <Stat label="Sending" value={queue.sending} />
                <Stat label="Sent" value={queue.sent} tone="good" />
                <Stat
                    label="Failed"
                    value={queue.failed}
                    tone={queue.failed > 0 ? "bad" : "good"}
                />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat label="Sent (24h)" value={stats.last24hSent} tone="good" />
                <Stat
                    label="Failed (24h)"
                    value={stats.last24hFailed}
                    tone={stats.last24hFailed > 0 ? "bad" : "good"}
                />
                <Stat label="Oldest pending" value={since(stats.oldestPendingAt)} />
            </div>

            <h2 className="mt-9 font-luxury text-xl text-foreground">
                Not delivered yet
                {stuck.length > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">({stuck.length})</span>
                )}
            </h2>

            {stuck.length === 0 ? (
                <div className="surface mt-3 flex items-center gap-3 p-6">
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                    <p className="text-sm text-foreground/80">
                        Every queued email has been delivered.
                    </p>
                </div>
            ) : (
                <ul className="mt-3 space-y-2">
                    {stuck.map((row) => (
                        <li key={row.id} className="surface p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-medium text-foreground">
                                    {row.recipientEmail ?? "no recipient"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            row.status === "failed" ? "destructive" : "warning"
                                        }
                                    >
                                        {row.status}
                                    </Badge>
                                    {row.attempts > 0 && (
                                        <Badge variant="outline">
                                            {row.attempts} attempt
                                            {row.attempts === 1 ? "" : "s"}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock size={12} />
                                {timeFmt.format(new Date(row.createdAt))} · {since(row.createdAt)}
                                {row.templateKey ? ` · ${row.templateKey}` : ""}
                            </p>

                            {row.lastError && (
                                <p className="mt-2 flex items-start gap-1.5 rounded-token bg-destructive/10 p-2 text-xs leading-relaxed text-destructive">
                                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                    <span className="break-all">{row.lastError}</span>
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default OpsDashboard;
