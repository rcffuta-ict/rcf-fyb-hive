import type { Metadata } from "next";

import PolicyPage, { type PolicySection } from "@/components/shared/policy-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
    title: `Privacy Policy — ${site.name}`,
};

const LAST_UPDATED = "28 July 2026";

const sections: PolicySection[] = [
    {
        title: "Information We Collect",
        body: "We collect details you provide during registration — such as your name, email, RCF unit, level, and a photo — looked up against your RCF FUTA membership profile. If you pair with an associate, you also give us their name, email and phone number so we can send them their invitation. We collect basic technical data (device, browser, usage) to keep the platform reliable, and log the IP addresses of consent-token lookups to prevent people guessing at tokens.",
    },
    {
        title: "How We Use Your Information",
        list: [
            "To verify finalist eligibility and process registrations.",
            "To identify attendees at the door using your photo.",
            "To generate and email your consent token, and to enable pairing.",
            "To communicate important event updates.",
            "To improve and secure the platform.",
        ],
    },
    {
        title: "Your Consent Token",
        body: "Your consent token is generated for you and delivered to your email address only. It is stored separately from your registration record and is deliberately hidden from the organizer dashboard — no admin, including the person who resends your email, can see your token. Admins can only see whether the email was sent, queued, or failed. If you ask for a resend, you receive the same token you already had; it is never regenerated behind your back.",
    },
    {
        title: "Your Photo",
        body: "Your registration photo is stored with our image provider (Cloudinary) and used to identify you at the door. It also appears in your confirmation email, cropped to a circular profile image, so you can tell at a glance the message is genuinely yours. It is not published publicly or shared with other attendees by us.",
    },
    {
        title: "Email Delivery",
        body: `Transactional email is sent through ZeptoMail on our behalf from our verified ${site.name} sending domain. To deliver a message, they process your email address, your name, and the message content. We keep a delivery log — the recipient address, subject, and whether the send succeeded — so we can answer "did it actually arrive?" if you tell us you never got it. Delivery logs never contain your consent token.`,
    },
    {
        title: "What Your Date Can See",
        body: "Entering someone's consent token shows you their photo, full name, level, unit and pairing status — that is what sharing a token consents to, and it works both ways. Nothing else about them is revealed, and the token itself is never displayed back to anyone. The public pairing feed shows first names only, never surnames or units.",
    },
    {
        title: "Sharing of Information",
        body: "We do not sell or rent your personal information. Limited data may be shared with trusted service providers (our hosting, image, and email providers) strictly to operate the platform, and with the event organizers for running the dinner.",
    },
    {
        title: "Data Retention",
        body: "Registration records, pairings and consent tokens are kept for the duration of the event cycle and a reasonable period afterwards for records and dispute resolution, then removed or anonymised. Delivery logs are kept on the same basis.",
    },
    {
        title: "Data Security",
        body: "We apply technical and organizational measures to protect your information against unauthorized access or misuse — including keeping consent tokens out of every admin-facing view. However, no system is fully secure, and you use the platform at your own risk.",
    },
    {
        title: "Your Rights",
        body: "You may request access to, correction of, or deletion of your personal information at any time by contacting the organizers. You can also ask us to reissue your consent token if you believe it has been shared without your consent.",
    },
    {
        title: "Changes to this Policy",
        body: "We may update this Privacy Policy occasionally to reflect changes in practice or legal requirements. Updates will be posted on this page with a new date above.",
    },
];

export default function PrivacyPage(): React.JSX.Element {
    return (
        <PolicyPage
            title="Privacy Policy"
            intro={`Your privacy matters to us. This policy explains how the ${site.event.title} platform collects, uses, and safeguards your information.`}
            sections={sections}
            updated={LAST_UPDATED}
        />
    );
}
