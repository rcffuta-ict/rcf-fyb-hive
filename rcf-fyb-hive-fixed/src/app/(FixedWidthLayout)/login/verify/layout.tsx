import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Verify Login - FYB Hive | Redeemed Christian Fellowship FUTA",
    description: "FYB Hive Feast 2024: Splendor Of His Love",
};

export default function VerifyRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-900 via-luxury-900 to-pearl-800 p-6">
            <div className="bg-pearl-800/40 backdrop-blur-md border border-pearl-700/50 rounded-2xl shadow-2xl p-10 max-w-md text-center animate-fade-in">
                {children}
            </div>
        </div>
    );
}
