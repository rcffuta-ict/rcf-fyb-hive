import type { Metadata } from "next";
import '@/styles/main.scss';
import Link from "next/link";
import Attribution from "@/components/Attribution";


export const metadata: Metadata = {
  title: "FYB Hive | Reddemed Christian Fellowship FUTA",
  description: "FYB Hive Feast 2024: Splendor Of His Love",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <header className="logo-wrapper sticky">
                    <Link href='/' className="img-wrapper logo">
                        RCF FUTA
                    </Link>

                </header>
                
                {children}

                <footer>
                    <Attribution />
                </footer>
            </body>
        </html>
    );
}
