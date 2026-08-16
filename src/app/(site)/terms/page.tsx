import type { Metadata } from "next";

import PolicyPage, { type PolicySection } from "@/components/shared/policy-page";
import { formatMoney, site } from "@/config/site";

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
        title: "Pairing",
        list: [
            "Pairing is by mutual consent: you pair by exchanging consent tokens, or by registering an associate — someone outside the fellowship whose details you provide.",
            "The dinner pairs a brother with a sister.",
            "Registering an associate takes you off the market immediately. No other finalist can pair with you and you cannot register a second associate unless the organizers cancel the first.",
            "You may have more than one pairing awaiting payment. Only one can ever be confirmed.",
        ],
    },
    {
        title: "Payments, Conflicts and Refunds",
        body: `The fee is ${formatMoney(site.payment.amount)} per pair, paid by transfer to the account shown when you pair, using the narration code given to you. Read the rest of this clause before you transfer anything.`,
        list: [
            "Submitting a pairing reserves nothing. A pairing is validated only when the organizers confirm your payment.",
            "Where more than one person pairs with the same person, the first confirmed payment wins. Everyone else's pairing is cancelled.",
            "Payments are non-refundable. This includes losing a conflict, a cancelled pairing, and not attending.",
            "An approved pairing is final. Both people are locked to it and it cannot be swapped or transferred.",
            "The organizers may cancel a pairing awaiting payment — for example a mistaken associate entry — and doing so creates no entitlement to a refund of any payment already made.",
        ],
    },
    {
        title: "Awards and Voting",
        body: "Where awards voting is open, any member with an RCF FUTA profile may vote, at any level. Candidates are drawn from finalists registered for the dinner.",
        list: [
            "One vote per person per category. You may change your pick at any time until voting closes; only your last pick counts.",
            "Votes are private. Your picks are never shown to other voters or to the candidates.",
            "Results are not public until the organizers publish them, and the organizers' declaration of a result is final.",
            "Voting on behalf of another person, or any attempt to vote more than once in a category, may void the votes concerned.",
            "The organizers may add, edit, archive or remove categories and candidates. Removing a candidate removes votes cast for them.",
        ],
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
