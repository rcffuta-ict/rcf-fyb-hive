"use client";

import Image from "next/image";
import { Loader2, Mail } from "lucide-react";

import PairingBadge from "@/components/shared/pairing-badge";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ConsentEmailStatus, RegistrationRecord } from "@/types/fyb.types";

/**
 * One finalist row in the admin table.
 *
 * Shows the delivery state of the consent email and lets an admin resend it.
 * It deliberately never displays the token itself — that value exists only in
 * the recipient's inbox and never leaves the server.
 */

const dateFmt = new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const STATUS_BADGE: Record<
    ConsentEmailStatus,
    { label: string; variant: BadgeProps["variant"] }
> = {
    sent: { label: "Sent", variant: "success" },
    queued: { label: "Queued", variant: "warning" },
    failed: { label: "Failed", variant: "destructive" },
    not_sent: { label: "Not sent", variant: "outline" },
    no_email: { label: "No email", variant: "outline" },
};

type Props = {
    registration: RegistrationRecord;
    resending: boolean;
    onResend: (id: string) => void;
};

const RegistrationRow = ({ registration, resending, onResend }: Props): React.JSX.Element => {
    const status = registration.consentEmailStatus ?? "not_sent";
    const badge = STATUS_BADGE[status];

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Image
                        src={registration.photoUrl}
                        alt={registration.firstName}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                    />
                    <div className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                            {registration.firstName} {registration.lastName}
                        </span>
                        <PairingBadge
                            status={registration.pairingStatus}
                            className="mt-1 px-2 py-0 text-[10px]"
                        />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                    {registration.level}
                </span>
            </TableCell>
            <TableCell className="hidden text-foreground/80 md:table-cell">
                {registration.unit ?? "—"}
            </TableCell>
            <TableCell className="hidden text-foreground/80 sm:table-cell">
                {registration.email ?? registration.phoneNumber ?? "—"}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {status !== "no_email" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={resending}
                            onClick={() => onResend(registration.id)}
                            title="Send the consent token to this finalist"
                        >
                            {resending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Mail size={14} />
                            )}
                            <span className="sr-only sm:not-sr-only">
                                {status === "not_sent" ? "Send" : "Resend"}
                            </span>
                        </Button>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
                {dateFmt.format(new Date(registration.createdAt))}
            </TableCell>
        </TableRow>
    );
};

export default RegistrationRow;
