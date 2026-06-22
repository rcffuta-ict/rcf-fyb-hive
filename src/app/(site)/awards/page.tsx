import NotAvailableYet from "@/components/ui/not-available-yet";

// Awards voting ships once `features.awards` is flipped on in site.config.json.
export default function AwardsPage(): React.JSX.Element {
    return (
        <NotAvailableYet
            title="Awards voting soon"
            description="Celebrate the set. When voting opens, you'll crown the standout finalists right here."
        />
    );
}
