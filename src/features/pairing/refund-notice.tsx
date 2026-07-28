import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The warning that makes the money rule fair.
 *
 * Pending intents aren't exclusive, approval is, and there are no refunds —
 * which together mean someone can pay and still lose the pairing if another
 * person's payment is confirmed first. That's the intended design, but only
 * defensible if nobody meets it by surprise. So it is stated before the money
 * moves, not in the small print afterwards.
 */
const RefundNotice = ({
    partnerName,
    className,
}: {
    partnerName?: string;
    className?: string;
}): React.JSX.Element => (
    <div
        className={cn(
            "flex gap-3 rounded-token border border-primary/30 bg-primary/5 px-4 py-3.5 text-left",
            className
        )}
    >
        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground/80">
            <strong className="text-foreground">Paying is what locks it in.</strong> Until we
            confirm your payment, {partnerName ?? "your date"} can still be paired by someone
            else — and whoever pays first gets it.{" "}
            <strong className="text-foreground">We don&apos;t do refunds</strong>, so pay early.
        </p>
    </div>
);

export default RefundNotice;
