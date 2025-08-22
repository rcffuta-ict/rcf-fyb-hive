import type { Metadata } from "next";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import "./global.css";
import { GlobalToastProvider } from "@/providers/ToastProvider";

export const metadata: Metadata = {
    title: "FYB Hive | Redeemed Christian Fellowship FUTA",
    description: "FYB Hive Feast 2024: Splendor Of His Love",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth dark">
            <body className="bg-white-accent text-primary font-sans antialiased">
                <GlobalToastProvider>
                    {/* Header */}
                    <Header/>

                    {/* Main content */}
                    <main className="min-h-screen">{children}</main>

                    {/* Footer */}
                    <Footer/>
                </GlobalToastProvider>
            </body>
        </html>
    );
}
