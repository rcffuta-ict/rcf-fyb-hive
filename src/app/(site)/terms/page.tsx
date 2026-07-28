import type { Metadata } from "next";

import PolicyPage, { type PolicySection } from "@/components/shared/policy-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
    title: `Terms of Use — ${site.name}`,
};

const LAST_UPDATED = "28 July 2026";

const sections: PolicySection[] = [
    {
        title: "Eligibility",
        body: `${site.event.title} registration is for the graduating class only — ${site.event.audience}. Registration requires an existing RCF FUTA membership profile, verified by email or phone number.`,
    },
    {
        title: "Accurate Information",
        body: "You agree to provide accurate details and a clear, recent photo of yourself. Photos are used to identify you at the event. Submitting another person's details or an unclear/false photo may void your registration.",
    },
    {
        title: "Your Consent Token",
        body: "When your registration is confirmed we email you a consent token in the format FYB-XXXX. It represents your consent to attend with someone, and it is the only way another person can pair with you.",
        list: [
            "Share it only with the person you actually want to come with. Anyone holding your token can pair with you.",
            "A token works once. Once a pairing is made with it, it cannot be used again.",
            "Never post it publicly or in a group chat. Treat it like a ticket, not a hashtag.",
            "Organizers never ask for your token and cannot see it — nobody but you and your recipient ever has it. Anyone who asks you for it is not an organizer.",
            "If you believe your token has been shared or used without your consent, contact the organizers immediately so it can be reissued.",
        ],
    },
    {
        title: "No Date, No Entry",
        list: [
            "Entry to the dinner follows a no-date, no-entry policy.",
            "Where pairing is enabled, both partners and any required validation must be completed before the event.",
            "Organizers reserve the right to verify pairings and registrations at the door.",
        ],
    },
    {
        title: "Conduct",
        body: "Attendees are expected to uphold the values of the fellowship and conduct themselves respectfully. Pairing is by mutual consent — pressuring anyone for their token, or pairing with a token you were not freely given, is a breach of these terms. Organizers may decline entry or remove anyone whose conduct disrupts the event.",
    },
    {
        title: "Payments",
        body: "Where a fee or pairing validation applies, payments are made to the account details provided in-app and confirmed by the organizers. Fees are non-transferable unless stated otherwise by the organizers.",
    },
    {
        title: "Email Communication",
        body: `Registering means we'll email you about your registration — your consent token and essential event updates. These are transactional messages, not marketing, so there's no unsubscribe: they only go out because you registered. Mail comes from our verified ${site.name} sending domain and we never ask for passwords or payment details by email.`,
    },
    {
        title: "Changes & Cancellations",
        body: "Event details such as date, venue, or programme may change. We will communicate material changes through this platform. Continued use after changes constitutes acceptance of the updated terms.",
    },
    {
        title: "Liability",
        body: "The platform is provided on an as-is basis. To the extent permitted by law, the organizers are not liable for losses arising from use of the platform or attendance at the event.",
    },
];

export default function TermsPage(): React.JSX.Element {
    return (
        <PolicyPage
            title="Terms of Use"
            intro={`By registering for the ${site.event.title}, you agree to the following terms. Please read them carefully — especially the part about your consent token.`}
            sections={sections}
            updated={LAST_UPDATED}
        />
    );
}
