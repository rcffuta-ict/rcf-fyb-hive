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
        answer: "When pairing opens. Registration is the part that's live now — the token is issued today so it's already in your hands when it's time. Nothing else to do until then except keep the email.",
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
