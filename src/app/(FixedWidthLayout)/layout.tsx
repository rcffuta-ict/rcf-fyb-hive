import React from "react";
import AutoInit from "@/components/AutoInit";
import MainWrapper from "@/components/MainWrapper";

export default function FixedWidthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <MainWrapper>
            {children}
            <AutoInit/>
        </MainWrapper>
    );
}
