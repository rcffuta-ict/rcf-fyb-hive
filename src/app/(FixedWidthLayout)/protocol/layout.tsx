import React from 'react';
import type { Metadata } from "next";
import '@/styles/main.scss';
import { TicketContextProvider } from '@/context/TicketContext';



export const metadata: Metadata = {
  title: "Guest Protocol | Reddemed Christian Fellowship FUTA",
  description: "FYB Hive Feast 2024: Splendor Of His Love",
};

export default function CheckInRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TicketContextProvider>
            {children}
        </TicketContextProvider>
    );
}
