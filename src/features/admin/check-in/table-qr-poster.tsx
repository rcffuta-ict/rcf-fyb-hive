"use client";

import { useRef, useState } from "react";
import { Download, Image as ImageIcon, Link2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { appToast } from "@/providers/ToastProvider";

/**
 * The printable poster, plus the three things anyone actually does with it:
 * print it, save it for a print shop, or send someone the link.
 *
 * The artwork is the server-built SVG, dropped in as markup — so the thing on
 * screen, the thing that prints and the thing that downloads are one file, not
 * three lookalikes. PNG is offered beside SVG because half of print shops still
 * ask for one.
 */
const PNG_WIDTH = 2400;

type Props = {
    svg: string;
    url: string;
};

const TableQrPoster = ({ svg, url }: Props): React.JSX.Element => {
    const frame = useRef<HTMLDivElement>(null);
    const [rendering, setRendering] = useState(false);

    const download = (blob: Blob, filename: string): void => {
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(href);
    };

    const handleDownloadSvg = (): void => {
        download(new Blob([svg], { type: "image/svg+xml" }), "fyb-table-qr.svg");
    };

    /**
     * SVG → canvas → PNG, entirely in the browser. The crest is already a data
     * URI inside the SVG, so the canvas is never tainted and `toBlob` works.
     */
    const handleDownloadPng = (): void => {
        setRendering(true);
        const source = new Image();
        source.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = PNG_WIDTH;
            canvas.height = Math.round((PNG_WIDTH * source.height) / source.width);
            const context = canvas.getContext("2d");
            if (!context) {
                setRendering(false);
                appToast.error("This browser can't render the PNG — use the SVG.");
                return;
            }
            context.drawImage(source, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                setRendering(false);
                if (!blob) {
                    appToast.error("Could not build the PNG — use the SVG.");
                    return;
                }
                download(blob, "fyb-table-qr.png");
            }, "image/png");
        };
        source.onerror = () => {
            setRendering(false);
            appToast.error("Could not build the PNG — use the SVG.");
        };
        source.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };

    const handleCopyLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(url);
            appToast.success("Link copied.");
        } catch {
            appToast.error("Copy failed — the link is printed on the poster.");
        }
    };

    return (
        <>
            {/* Printing must give the poster the whole sheet — no site header,
                no footer, no dashboard chrome around a thing going on a wall. */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #qr-poster, #qr-poster * { visibility: visible !important; }
                    #qr-poster {
                        position: absolute;
                        inset: 0;
                        margin: 0;
                        width: 100%;
                    }
                    @page { margin: 0; }
                }
            `}</style>

            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
                <Button onClick={() => window.print()}>
                    <Printer size={16} /> Print
                </Button>
                <Button variant="outline" onClick={handleDownloadSvg}>
                    <Download size={16} /> Download SVG
                </Button>
                <Button variant="outline" disabled={rendering} onClick={handleDownloadPng}>
                    <ImageIcon size={16} />
                    {rendering ? "Rendering…" : "Download PNG"}
                </Button>
                <Button variant="ghost" onClick={() => void handleCopyLink()}>
                    <Link2 size={16} /> Copy link
                </Button>
            </div>

            <div
                id="qr-poster"
                ref={frame}
                className="mt-5 overflow-hidden rounded-token border border-border shadow-sm [&>svg]:h-auto [&>svg]:w-full"
                // Server-built from site config and our own route — no user input
                // reaches this markup.
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </>
    );
};

export default TableQrPoster;
