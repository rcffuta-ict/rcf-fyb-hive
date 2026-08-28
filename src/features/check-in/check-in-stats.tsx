import { Armchair, DoorOpen, HeartHandshake, Users } from "lucide-react";

import type { CheckInPair } from "@/types/fyb.types";

/**
 * The door in four numbers.
 *
 * On a phone these are a single quiet line — the roster and the search box are
 * what the gate needs on screen, and four tiles would push the first photograph
 * below the fold. They open out into tiles once there is room for them.
 */
const CheckInStats = ({ roster }: { roster: CheckInPair[] }): React.JSX.Element => {
    const arrived = roster.filter((pair) => pair.checkedInAt);
    const heads = arrived.reduce((total, pair) => total + pair.people.length, 0);
    const unseated = roster.filter((pair) => !pair.tableNumber).length;

    const tiles = [
        { label: "Couples expected", short: "expected", value: roster.length, Icon: HeartHandshake },
        { label: "Couples inside", short: "inside", value: arrived.length, Icon: DoorOpen },
        { label: "Guests inside", short: "guests", value: heads, Icon: Users },
        { label: "No table yet", short: "no table", value: unseated, Icon: Armchair },
    ];

    return (
        <>
            <p className="mt-1 text-center text-xs text-muted-foreground sm:hidden">
                {tiles.map(({ short, value }, index) => (
                    <span key={short}>
                        {index > 0 && " · "}
                        <span className="font-semibold text-foreground">{value}</span> {short}
                    </span>
                ))}
            </p>

            <div className="mt-3 hidden gap-3 sm:grid sm:grid-cols-4">
                {tiles.map(({ label, value, Icon }) => (
                    <div key={label} className="surface p-4 text-center">
                        <Icon size={16} className="mx-auto text-primary" />
                        <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CheckInStats;
