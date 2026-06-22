import NotAvailableYet from "@/components/ui/not-available-yet";

// Pairing (date registration + payment validation) ships once `features.pairing`
// is flipped on in site.config.json. Until then this route is a friendly stub.
export default function PairingPage(): React.JSX.Element {
    return (
        <NotAvailableYet
            title="Pairing opens soon"
            description="No date, no entry. When pairing opens, you'll register the partner you're coming with and validate your spot here."
        />
    );
}
