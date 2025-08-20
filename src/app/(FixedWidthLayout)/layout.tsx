import MainWrapper from "@/components/MainWrapper";

export default function FixedWidthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <MainWrapper>
            <section className="pt-32 ">{children}</section>
        </MainWrapper>
    );
}
