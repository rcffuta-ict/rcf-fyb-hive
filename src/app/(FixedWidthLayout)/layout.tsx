import { ReactNode } from "react";
import AutoInit from "@/components/AutoInit";
import MainWrapper from "@/components/MainWrapper";

interface LayoutProps {
    children: ReactNode;
}

export default function FixedWidthLayout({ children }: LayoutProps) {
    return (
        <MainWrapper>
            {children}
            <AutoInit />
        </MainWrapper>
    );
}
