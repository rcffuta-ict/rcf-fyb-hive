import Image from "next/image";
import Link from "next/link";

import { site } from "@/config/site";

const Footer = (): React.JSX.Element => {
    return (
        <footer className="relative isolate mt-8 overflow-hidden border-t border-border bg-card/50">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-60 bg-honeycomb"
            />

            <div className="mx-auto max-w-5xl px-6 py-16">
                <div className="flex flex-col items-center gap-8 text-center">
                    <Image
                        src={site.branding.logos.fybHive}
                        alt={`${site.name} crest`}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-contain drop-shadow-[0_8px_20px_hsl(var(--primary)/0.35)]"
                    />

                    <p className="max-w-xl font-elegant text-xl italic leading-relaxed text-foreground/75">
                        {site.copy.tribute}
                    </p>

                    {/* Attribution — the lineage behind FYB Hive */}
                    <div className="w-full">
                        <div className="divider-gold mx-auto max-w-md" />
                        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                            {site.sponsors.map((sponsor) => {
                                const body = (
                                    <>
                                        {sponsor.role && (
                                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
                                                {sponsor.role}
                                            </span>
                                        )}
                                        <span className="flex h-12 items-center justify-center">
                                            {sponsor.logo ? (
                                                <Image
                                                    src={sponsor.logo}
                                                    alt={sponsor.name}
                                                    width={150}
                                                    height={48}
                                                    className="max-h-10 w-auto object-contain"
                                                />
                                            ) : (
                                                <span className="font-luxury text-lg text-foreground">
                                                    {sponsor.name}
                                                </span>
                                            )}
                                        </span>
                                    </>
                                );

                                return (
                                    <li
                                        key={sponsor.name}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        {sponsor.url ? (
                                            <Link
                                                href={sponsor.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={sponsor.name}
                                                className="flex flex-col items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
                                            >
                                                {body}
                                            </Link>
                                        ) : (
                                            <span className="flex flex-col items-center gap-3 opacity-80">
                                                {body}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Copyright bar */}
                    <div className="mt-8 flex w-full flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()}{" "}
                            <Link
                                href={site.links.rcffuta}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-foreground/70 transition-colors hover:text-primary"
                            >
                                RCF FUTA
                            </Link>
                            . All rights reserved. &middot;{" "}
                            {site.copy.footerNote}
                        </p>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/privacy"
                                className="text-muted-foreground transition-colors hover:text-primary"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-muted-foreground transition-colors hover:text-primary"
                            >
                                Terms
                            </Link>
                            {site.contact.email && (
                                <a
                                    href={`mailto:${site.contact.email}`}
                                    className="text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {site.contact.email}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
