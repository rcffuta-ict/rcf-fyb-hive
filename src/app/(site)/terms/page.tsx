import type { Metadata } from "next";

import { site } from "@/config/site";

export const metadata: Metadata = {
    title: `Terms of Use — ${site.name}`,
};

type Section = { title: string; body?: string; list?: string[] };

const sections: Section[] = [
    {
        title: "1. Eligibility",
        body: `${site.event.title} registration is for the graduating class only — ${site.event.audience}. Registration requires an existing RCF FUTA membership profile, verified by email or phone number.`,
    },
    {
        title: "2. Accurate Information",
        body: "You agree to provide accurate details and a clear, recent photo of yourself. Photos are used to identify you at the event. Submitting another person's details or an unclear/false photo may void your registration.",
    },
    {
        title: "3. No Date, No Entry",
        list: [
            "Entry to the dinner follows a no-date, no-entry policy.",
            "Where pairing is enabled, both partners and any required validation must be completed before the event.",
            "Organizers reserve the right to verify pairings and registrations at the door.",
        ],
    },
    {
        title: "4. Conduct",
        body: "Attendees are expected to uphold the values of the fellowship and conduct themselves respectfully. Organizers may decline entry or remove anyone whose conduct disrupts the event.",
    },
    {
        title: "5. Payments",
        body: "Where a fee or pairing validation applies, payments are made to the account details provided in-app and confirmed by the organizers. Fees are non-transferable unless stated otherwise by the organizers.",
    },
    {
        title: "6. Changes & Cancellations",
        body: "Event details such as date, venue, or programme may change. We will communicate material changes through this platform. Continued use after changes constitutes acceptance of the updated terms.",
    },
    {
        title: "7. Liability",
        body: "The platform is provided on an as-is basis. To the extent permitted by law, the organizers are not liable for losses arising from use of the platform or attendance at the event.",
    },
];

export default function TermsPage(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <div className="surface p-8 sm:p-10">
                <span className="eyebrow mb-3">Legal</span>
                <h1 className="font-luxury text-foreground">Terms of Use</h1>
                <p className="mt-4 text-foreground/70">
                    By registering for the {site.event.title}, you agree to the following terms.
                    Please read them carefully.
                </p>

                <div className="mt-10 space-y-9">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h2 className="font-luxury text-xl text-foreground">
                                {section.title}
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
                        <h2 className="font-luxury text-xl text-foreground">8. Contact</h2>
                        <p className="mt-2 leading-relaxed text-foreground/70">
                            Questions about these terms? Reach the organizers at{" "}
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
}
