import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SeatedPair } from "@/services/check-in.service";

/**
 * One couple on the public seating list.
 *
 * Names and a table, and whether they're already inside — the same three things
 * a printed seating chart on an easel would say, and nothing more.
 */
const SeatRow = ({ pair }: { pair: SeatedPair }): React.JSX.Element => (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{pair.names.join(" & ")}</p>
            {pair.checkedIn && (
                <Badge variant="success" className="mt-1 px-1.5 py-0 text-[10px]">
                    <Check size={10} /> Inside
                </Badge>
            )}
        </div>
        <span className="shrink-0 rounded-token bg-accent/60 px-3 py-1 font-mono text-sm font-bold tracking-wider text-primary">
            {pair.tableNumber}
        </span>
    </li>
);

export default SeatRow;
