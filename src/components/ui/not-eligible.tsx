import { ShieldAlert, Mail } from "lucide-react";

import { site } from "@/config/site";

type NotEligibleProps = {
    level?: string | null;
    title?: string;
    message?: string;
};

/**
 * Shown when a resolved member is not in a finalist level (400L/500L). No auth in
 * this app, so the copy points them to the organizers rather than a login.
 */
const NotEligible = ({
    level,
    title = "Finalists only",
    message,
}: NotEligibleProps): React.JSX.Element => {
    return (
        <div className="surface mx-auto max-w-md animate-scale-in p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert size={26} />
            </div>

            <h3 className="font-luxury text-xl text-foreground">{title}</h3>

            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {message ??
                    "The FYB Dinner is for the graduating class — only members in 400 and 500 level can register."}
                {level ? (
                    <>
                        {" "}
                        Your profile shows{" "}
                        <span className="font-semibold text-foreground">{level}</span>.
                    </>
                ) : null}
            </p>

            {site.contact.email && (
                <a
                    href={`mailto:${site.contact.email}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                    <Mail size={15} />
                    Contact the organizers
                </a>
            )}
        </div>
    );
};

export default NotEligible;
