"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";

/**
 * Who is voting, and how far through they are.
 *
 * The progress line matters more than it looks: with a dozen categories stacked
 * vertically it is the only way to know there is more below worth scrolling to.
 */

const BallotHeader = ({
    firstName,
    avatarUrl,
    voted,
    total,
    onSignOut,
}: {
    firstName: string;
    avatarUrl: string | null;
    voted: number;
    total: number;
    onSignOut: () => void;
}): React.JSX.Element => {
    const pct = total === 0 ? 0 : Math.round((voted / total) * 100);

    return (
        <div className="surface sticky top-4 z-20 flex items-center gap-4 p-4 backdrop-blur-md">
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full border border-primary/40 object-cover"
                />
            ) : (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 font-luxury text-lg text-primary">
                    {firstName.charAt(0).toUpperCase()}
                </span>
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground/80">
                    Voting as{" "}
                    <span className="font-semibold text-foreground">{firstName}</span>
                </p>
                <div className="mt-1.5 flex items-center gap-2.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-metallic-gold transition-all duration-700"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {voted}/{total}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={onSignOut}
                title="Not you? Switch member"
                aria-label="Not you? Switch member"
                className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
};

export default BallotHeader;
