import Link from "next/link";
import { Hourglass } from "lucide-react";

import { Button } from "@/components/ui/button";

type NotAvailableYetProps = {
    title?: string;
    description?: string;
};

/** Premium "coming soon" panel for feature-flagged routes that aren't live yet. */
const NotAvailableYet = ({
    title = "Coming soon",
    description = "This part of the Hive is still being prepared. Check back shortly.",
}: NotAvailableYetProps): React.JSX.Element => {
    return (
        <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 sm:py-32">
            <div className="surface w-full animate-fade-in p-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
                    <Hourglass className="animate-float" size={28} />
                </div>

                <h1 className="font-luxury text-3xl text-foreground">{title}</h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground/70">
                    {description}
                </p>

                <Button asChild variant="outline" className="mt-7">
                    <Link href="/">Back to home</Link>
                </Button>
            </div>
        </section>
    );
};

export default NotAvailableYet;
