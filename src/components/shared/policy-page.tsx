import { site } from "@/config/site";

/**
 * Shared layout for the legal pages (Terms, Privacy).
 *
 * Both pages were rendering an identical numbered-section list, so the markup
 * lives here once — a styling change now touches one file. Sections are
 * numbered automatically, which means inserting a clause never means
 * renumbering the ones after it by hand.
 */

export type PolicySection = {
    title: string;
    body?: string;
    list?: string[];
};

type Props = {
    eyebrow?: string;
    title: string;
    intro: string;
    sections: PolicySection[];
    updated: string;
};

const PolicyPage = ({
    eyebrow = "Legal",
    title,
    intro,
    sections,
    updated,
}: Props): React.JSX.Element => (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="surface p-8 sm:p-10">
            <span className="eyebrow mb-3">{eyebrow}</span>
            <h1 className="font-luxury text-foreground">{title}</h1>
            <p className="mt-4 text-foreground/70">{intro}</p>
            <p className="mt-2 text-xs text-muted-foreground">Last updated {updated}</p>

            <div className="mt-10 space-y-9">
                {sections.map((section, index) => (
                    <div key={section.title}>
                        <h2 className="font-luxury text-xl text-foreground">
                            {index + 1}. {section.title}
                        </h2>
                        {section.body && (
                            <p className="mt-2 leading-relaxed text-foreground/70">
                                {section.body}
                            </p>
                        )}
                        {section.list && (
                            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-foreground/70">
                                {section.list.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}

                <div>
                    <h2 className="font-luxury text-xl text-foreground">
                        {sections.length + 1}. Contact
                    </h2>
                    <p className="mt-2 leading-relaxed text-foreground/70">
                        Questions? Reach the organizers at{" "}
                        <a
                            href={`mailto:${site.contact.email}`}
                            className="font-medium text-primary hover:underline"
                        >
                            {site.contact.email}
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default PolicyPage;
