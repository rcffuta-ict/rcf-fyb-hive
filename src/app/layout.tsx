import type { Metadata } from "next";
import '@/styles/main.scss';
import Link from "next/link";


export const metadata: Metadata = {
  title: "FYB Hive| Reddemed Christian Fellowship FUTA",
  description: "FYB Hive Feast: Splendor Of His Love",
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
                <main>
                    <section className="main-wrapper">
                        {/* <div >
                        </div> */}
                        

                        <div className="main-content">
                            <br/>
                            {children}
                        </div>
                        {/* <Done /> */}

                    </section>
                </main>
            </body>
        </html>
    );
}
