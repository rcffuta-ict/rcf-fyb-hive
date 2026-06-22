import type { PropsWithChildren } from "react";

/**
 * Page shell for the public site. Adds top padding to clear the fixed header
 * (h-16) so route content never sits underneath it.
 */
const MainWrapper = ({ children }: PropsWithChildren): React.JSX.Element => {
    return <div className="pt-16">{children}</div>;
};

export default MainWrapper;
