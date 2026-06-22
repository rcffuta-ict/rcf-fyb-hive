import type { Metadata } from "next";

import { site } from "@/config/site";

export const metadata: Metadata = {
    title: `Privacy Policy — ${site.name}`,
};

type Section = { title: string; body?: string; list?: string[] };

const sections: Section[] = [
    {
        title: "1. Information We Collect",
        body: "We collect details you provide during registration — such as your name, email, department, level, and a photo — looked up against your RCF FUTA membership profile. We also collect basic technical data (device, browser, usage) to keep the platform reliable.",
    },
    {
        title: "2. How We Use Your Information",
        list: [
            "To verify finalist eligibility and process registrations.",
            "To identify attendees at the door using your photo.",
            "To communicate important event updates.",
            "To improve and secure the platform.",
        ],
    },
    {
        title: "3. Sharing of Information",
        body: "We do not sell or rent your personal information. Limited data may be shared with trusted partners (such as the event organizers) strictly for operational purposes.",
    },
    {
        title: "4. Data Security",
        body: "We apply technical and organizational measures to protect your information against unauthorized access or misuse. However, no system is fully secure, and you use the platform at your own risk.",
    },
    {
        title: "5. Your Rights",
        body: "You may request access to, correction of, or deletion of your personal information at any time by contacting the organizers.",
    },
    {
        title: "6. Changes to this Policy",
        body: "We may update this Privacy Policy occasionally to reflect changes in practice or legal requirements. Updates will be posted on this page.",
    },
];

export default function PrivacyPage(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <div className="surface p-8 sm:p-10">
                <span className="eyebrow mb-3">Legal</span>
                <h1 className="font-luxury text-foreground">Privacy Policy</h1>
                <p className="mt-4 text-foreground/70">
                    Your privacy matters to us. This policy explains how the {site.event.title}{" "}
                    platform collects, uses, and safeguards your information.
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
                        <h2 className="font-luxury text-xl text-foreground">7. Contact Us</h2>
                        <p className="mt-2 leading-relaxed text-foreground/70">
                            Questions about this policy? Reach the organizers at{" "}
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
