import { Armchair, DoorOpen, HeartHandshake, Users } from "lucide-react";

import type { CheckInPair } from "@/types/fyb.types";

/**
 * The door in four numbers. Heads rather than pairs for the last one, because
 * the question anyone asks the gate is how many people are in the hall.
 */
const CheckInStats = ({ roster }: { roster: CheckInPair[] }): React.JSX.Element => {
    const arrived = roster.filter((pair) => pair.checkedInAt);
    const heads = arrived.reduce((total, pair) => total + pair.people.length, 0);

    const unseated = roster.filter((pair) => !pair.tableNumber).length;

    const tiles = [
        { label: "Pairs expected", value: roster.length, Icon: HeartHandshake },
        { label: "Pairs inside", value: arrived.length, Icon: DoorOpen },
        { label: "Guests inside", value: heads, Icon: Users },
        { label: "No table yet", value: unseated, Icon: Armchair },
    ];

    return (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {tiles.map(({ label, value, Icon }) => (
                <div key={label} className="surface p-3 text-center sm:p-4">
                    <Icon size={16} className="mx-auto text-primary" />
                    <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
            ))}
        </div>
    );
};

export default CheckInStats;
