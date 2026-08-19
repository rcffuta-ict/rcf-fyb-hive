import type { Metadata } from "next";

import { site } from "@/config/site";
import { AwardStandardView } from "@/features/awards";
import { getStandardDoc } from "@/services/award-standard.service";

export const metadata: Metadata = {
    title: `Award standard — ${site.name}`,
    description: `How every award at the ${site.event.title} is decided: the criteria each nominee had to clear before reaching the ballot.`,
};

/**
 * The published standard.
 *
 * Deliberately not gated behind the awards feature flag or a voter session.
 * The point of publishing criteria is that anyone can check them — including
 * someone who has just been told they did not qualify, and who is entitled to
 * read the reason for themselves without logging in first.
 *
 * Statically rendered: it reads no cookies, headers or search params, so Next
 * renders it once at build. The standard only changes when the file does, which
 * means only on a deploy — there is nothing here to revalidate.
 */
export default async function AwardStandardPage(): Promise<React.JSX.Element> {
    return <AwardStandardView doc={getStandardDoc()} />;
}
