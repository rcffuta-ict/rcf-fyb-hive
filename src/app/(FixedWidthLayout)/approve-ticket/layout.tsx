import React from 'react';
import type { Metadata } from "next";
import '@/styles/main.scss';
import { TicketContextProvider } from '@/context/TicketContext';



export const metadata: Metadata = {
  title: "Approve FYB Pairing | Reddemed Christian Fellowship FUTA",
  description: "FYB Hive Feast 2024: Splendor Of His Love",
};

export default function TicketRootLayout({
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
