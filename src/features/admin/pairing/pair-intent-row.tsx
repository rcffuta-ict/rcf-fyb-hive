"use client";

import Image from "next/image";
import { Check, Loader2, Undo2, X } from "lucide-react";

import AssociateAvatar from "@/components/shared/associate-avatar";
import GenderBadge from "@/components/shared/gender-badge";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/config/site";
import type {
    Gender,
    PairIntentRecord,
    PairIntentStatus,
} from "@/types/fyb.types";

/** One pair intent in the admin table. */

const dateFmt = new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

const STATUS: Record<
    PairIntentStatus,
    { label: string; variant: BadgeProps["variant"] }
> = {
    pending: { label: "Awaiting payment", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    cancelled: { label: "Cancelled", variant: "outline" },
};

const Face = ({
    photoUrl,
    name,
    detail,
    gender,
}: {
    photoUrl?: string;
    name: string;
    detail: string;
    gender: Gender | null;
}): React.JSX.Element => (
    <div className="flex min-w-0 items-center gap-2.5">
        {photoUrl ? (
            <Image
                src={photoUrl}
                alt={name}
                width={34}
                height={34}
                className="h-[34px] w-[34px] rounded-full object-cover ring-1 ring-border"
            />
        ) : null}
        <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
                {name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
            <GenderBadge
                gender={gender}
                className="mt-1 px-1.5 py-0 text-[9px]"
            />
        </div>
    </div>
);

type Props = {
    intent: PairIntentRecord;
    busy: boolean;
    onApprove: (id: string) => void;
    onCancel: (id: string) => void;
    onRevoke: (id: string) => void;
};

const PairIntentRow = ({
    intent,
    busy,
    onApprove,
    onCancel,
    onRevoke,
}: Props): React.JSX.Element => {
    const badge = STATUS[intent.status];

    return (
        <div className="border-b border-border p-4 last:border-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    <Face
                        photoUrl={intent.initiator.photoUrl}
                        name={`${intent.initiator.firstName} ${intent.initiator.lastName}`}
                        detail={`${intent.initiator.level}${
                            intent.initiator.unit
                                ? ` · ${intent.initiator.unit}`
                                : ""
                        }`}
                        gender={intent.initiator.gender}
                    />
                    <span className="hidden text-muted-foreground sm:inline">
                        And
                    </span>
                    {intent.partner ? (
                        <Face
                            photoUrl={intent.partner.photoUrl}
                            name={`${intent.partner.firstName} ${intent.partner.lastName}`}
                            detail={`${intent.partner.level}${
                                intent.partner.unit
                                    ? ` · ${intent.partner.unit}`
                                    : ""
                            }`}
                            gender={intent.partner.gender}
                        />
                    ) : intent.associate ? (
                        <div className="flex min-w-0 items-center gap-2.5">
                            <AssociateAvatar
                                gender={intent.associate.gender}
                                className="h-[34px] w-[34px]"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {intent.associate.name}{" "}
                                    <span className="text-xs font-normal text-primary">
                                        associate
                                    </span>
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {intent.associate.relationship} ·{" "}
                                    {intent.associate.phone}
                                </p>
                                <GenderBadge
                                    gender={intent.associate.gender}
                                    className="mt-1 px-1.5 py-0 text-[9px]"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="text-right">
                    {/* The narration code is what admin matches against the bank
                        statement, so it gets the most legible treatment here. */}
                    <p className="font-mono text-sm font-bold tracking-wider text-secondary">
                        {intent.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatMoney(intent.amount)} ·{" "}
                        {dateFmt.format(new Date(intent.createdAt))}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {intent.cancelReason && (
                        <span className="text-xs text-muted-foreground">
                            {intent.cancelReason}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {intent.status === "pending" && (
                        <>
                            <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => onApprove(intent.id)}
                            >
                                {busy ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Check size={14} />
                                )}
                                Payment received
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={() => onCancel(intent.id)}
                            >
                                <X size={14} /> Cancel
                            </Button>
                        </>
                    )}
                    {intent.status === "approved" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => onRevoke(intent.id)}
                            title="Admin error only — this is not a refund"
                        >
                            <Undo2 size={14} /> Revoke
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PairIntentRow;
