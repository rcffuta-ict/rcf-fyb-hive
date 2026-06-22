import type { ReactNode } from "react";

import MainWrapper from "@/components/layout/main-wrapper";

const SiteLayout = ({ children }: { children: ReactNode }): React.JSX.Element => {
    return <MainWrapper>{children}</MainWrapper>;
};

export default SiteLayout;
