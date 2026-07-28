"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { site } from "@/config/site";

/**
 * FAQ accordion. Client-only because of the open/closed state — the rest of the
 * guide page stays a Server Component.
 */

type Faq = { question: string; answer: string };

const faqs: Faq[] = [
    {
        question: "I registered but never got the email. What now?",
        answer: `Check your spam and promotions folders first — a brand-new sending domain often lands there before it settles. Still nothing after a few minutes? Message the organizers at ${site.contact.email} and they can resend it. You'll get the same token, not a new one.`,
    },
    {
        question: "I deleted the email. Can someone just tell me my token?",
        answer: "No — and that's on purpose. Nobody can look it up for you, not even the organizers: the token is only ever visible in your inbox. What they can do is resend that email, which delivers the same token again.",
    },
    {
        question: "When do I actually use the token?",
        answer: "On the pairing page — you enter yours, then your date's, and that pair of tokens is what proves you both agreed. If pairing hasn't opened yet, just hold on to the email.",
    },
    {
        question: "I paid but someone else got my date. What now?",
        answer: "Payment is what confirms a pairing, and the first confirmed payment wins — so if someone paid for the same person before you, their pairing stands. Payments aren't refunded, which is exactly why the page tells you to pay early rather than sit on it. Talk to the organizers if you think something went wrong.",
    },
    {
        question: "Can I bring someone who isn't in the fellowship?",
        answer: "Yes — we call them an associate. You fill in their name, email and phone yourself, and their invitation goes to that email. One catch: registering an associate takes you off the market immediately, so no other finalist can pair with you and you can't swap them for someone else.",
    },
    {
        question: "Can I pair with more than one person?",
        answer: "You can have more than one pairing waiting on payment — nothing is reserved until money is confirmed. But only one can ever be paid for, and the moment one is confirmed the others are cancelled automatically.",
    },
    {
        question: "Someone asked me to send them my token. Should I?",
        answer: "Only if they're the person you actually want to bring. Anyone holding your token will be able to pair with you, and organizers will never ask you for it — if someone claiming to be an organizer asks, that's a red flag, and you should report it.",
    },
    {
        question: "I'm a finalist but it says I'm not eligible.",
        answer: "Eligibility comes from the entry year on your RCF FUTA profile, so if your class set is wrong or missing, the level we compute will be wrong too. That's fixed on your profile rather than here — message the organizers and they'll sort it out with the ICT team.",
    },
    {
        question: "Why is my photo in the email?",
        answer: "So you can tell at a glance the message is genuinely about your registration and not someone spoofing us. It's the same photo you uploaded, cropped to a circle.",
    },
    {
        question: "Can I register without a photo?",
        answer: "No. The photo is how the team confirms it's you at the door, so a clear, recent, front-facing one is required to finish registering.",
    },
];

const GuideFaq = (): React.JSX.Element => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number): void => {
        setOpenIndex((current) => (current === index ? null : index));
    };

    return (
        <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => {
                const open = openIndex === index;
                return (
                    <div key={faq.question} className="surface overflow-hidden p-0">
                        <button
                            type="button"
                            onClick={() => handleToggle(index)}
                            aria-expanded={open}
                            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                        >
                            <span className="font-medium text-foreground">{faq.question}</span>
                            <ChevronDown
                                size={18}
                                className={`shrink-0 text-primary transition-transform ${
                                    open ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        {open && (
                            <p className="px-6 pb-5 leading-relaxed text-foreground/70">
                                {faq.answer}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GuideFaq;
