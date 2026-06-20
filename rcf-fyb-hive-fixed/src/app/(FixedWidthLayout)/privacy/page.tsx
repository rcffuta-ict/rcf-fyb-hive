import Spacer from "@/app/components/ui/Spacer";

export default function PrivacyPage() {
    return (
        <section className="min-h-screen bg-gradient-to-b from-luxury-900 via-romance-900 to-pearl-900 text-pearl-100 py-16 px-6">
            
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/10 to-white/5 dark:from-luxury-800/30 dark:to-luxury-900/20 rounded-3xl shadow-glass backdrop-blur-xl border border-white/20 p-10 animate-fade-in">
                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-luxury font-bold bg-gradient-to-r from-champagne-gold to-rose-gold bg-clip-text text-transparent mb-6">
                    Privacy Policy
                </h1>
                <p className="text-pearl-300 font-elegant text-lg mb-12">
                    Your privacy is important to us. This Privacy Policy
                    explains how we collect, use, and safeguard your information
                    when you use the FYB Dinner ‘25 platform.
                </p>

                {/* Sections */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        1. Information We Collect
                    </h2>
                    <p className="text-pearl-200 leading-relaxed">
                        We may collect personal details you provide during
                        registration, such as your name, email, department, and
                        contact information. We also collect technical
                        information such as device type, browser, and usage data
                        to improve the experience.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        2. How We Use Your Information
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-pearl-200">
                        <li>To process event registrations and ticketing.</li>
                        <li>To communicate important event updates.</li>
                        <li>
                            To ensure fair participation in voting and awards.
                        </li>
                        <li>To improve and secure the FYB Dinner platform.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        3. Sharing of Information
                    </h2>
                    <p className="text-pearl-200 leading-relaxed">
                        We do not sell or rent your personal information.
                        Limited data may be shared with trusted partners (such
                        as payment processors or event vendors) strictly for
                        operational purposes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        4. Data Security
                    </h2>
                    <p className="text-pearl-200 leading-relaxed">
                        We implement technical and organizational measures to
                        protect your information against unauthorized access,
                        disclosure, or misuse. However, no system is 100%
                        secure, and you use the platform at your own risk.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        5. Your Rights
                    </h2>
                    <p className="text-pearl-200 leading-relaxed">
                        You have the right to access, update, or request
                        deletion of your personal information. You may also
                        opt-out of communications at any time by contacting us.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        6. Changes to this Policy
                    </h2>
                    <p className="text-pearl-200 leading-relaxed">
                        We may update this Privacy Policy occasionally to
                        reflect changes in practices or legal requirements.
                        Updates will be posted on this page.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-champagne-gold-300 mb-3">
                        7. Contact Us
                    </h2>
                    <p className="text-pearl-200 leading-relaxed">
                        If you have any questions or concerns about this Privacy
                        Policy, please contact the FYB Dinner Organizing
                        Committee at{" "}
                        <a
                            href="mailto:ict@rcffuta.com"
                            className="text-champagne-gold-400 underline hover:text-champagne-gold-200 transition"
                        >
                            ict@rcffuta.com
                        </a>
                        .
                    </p>
                </section>
            </div>
        </section>
    );
}
