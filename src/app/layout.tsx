import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Cormorant_Garamond, Poppins, Inter } from "next/font/google";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ThemeProvider from "@/providers/ThemeProvider";
import { GlobalToastProvider } from "@/providers/ToastProvider";
import { site } from "@/config/site";

import "./global.css";

const cinzel = Cinzel({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-cinzel",
    display: "swap",
});
const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-playfair",
    display: "swap",
});
const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-cormorant",
    display: "swap",
});
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
    display: "swap",
});
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    icons: { icon: site.branding.favicon },
};

const fontVars = `${cinzel.variable} ${playfair.variable} ${cormorant.variable} ${poppins.variable} ${inter.variable}`;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <html lang="en" className={`scroll-smooth ${fontVars}`} data-scroll-behavior="smooth">
            <body className="font-modern antialiased">
                <ThemeProvider>
                    <GlobalToastProvider>
                        <Header />
                        <main className="min-h-screen">{children}</main>
                        <Footer />
                    </GlobalToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
