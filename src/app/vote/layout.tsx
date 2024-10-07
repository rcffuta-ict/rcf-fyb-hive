import { Fragment } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Metadata } from "next";
import AuthIndicator from "@/components/Vote/AuthIndicator";


export const metadata: Metadata = {
  title: "FYB Award Spotlight | Reddemed Christian Fellowship FUTA",
  description: "FYB Hive Feast 2024: Splendor Of His Love",
};

export default function FixedWidthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="vote-layout">
            {children}

            <AuthIndicator user={{}}/>
        </main>
    );
}
