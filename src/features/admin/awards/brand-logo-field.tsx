"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, Link2, Loader2, Upload, X } from "lucide-react";

import { uploadBrandLogo } from "@/actions/storage.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BRAND_LOGO,
    BRAND_LOGO_HINT,
    checkLogoDimensions,
    isRenderableLogoUrl,
} from "@/constants/brand-logo";
import { cn } from "@/lib/utils";

/**
 * A brand's logo: upload one, or paste a link to one that already exists.
 *
 * Both routes end at the same URL and both are held to the same standard, which
 * is the point — a ballot where one brand's mark is crisp and the next is a
 * blurry screenshot has quietly decided the race on image quality rather than on
 * the business. The dimension check runs in the browser first (instant, and it
 * costs nothing), and again on the server for uploads, because a Server Action
 * is a public endpoint and the browser's opinion is only a courtesy.
 *
 * A pasted link is checked by loading it: that simultaneously proves the host
 * allows hotlinking, that the URL is really an image, and that its geometry
 * fits — three ways a plausible-looking link fails silently on the ballot.
 */

const readImage = (src: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("unreadable"));
        img.src = src;
    });

const BrandLogoField = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (url: string) => void;
}): React.JSX.Element => {
    const [pasted, setPasted] = useState("");
    const [busy, setBusy] = useState(false);
    const [problem, setProblem] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File): Promise<void> => {
        setProblem(null);

        if (!BRAND_LOGO.acceptedTypes.includes(file.type as never)) {
            setProblem("Logos must be PNG, JPEG or WEBP. SVG files aren't accepted.");
            return;
        }
        if (file.size / 1024 / 1024 > BRAND_LOGO.maxSizeMb) {
            setProblem(`That logo is over ${BRAND_LOGO.maxSizeMb}MB. Export a smaller version.`);
            return;
        }

        setBusy(true);
        try {
            const preview = URL.createObjectURL(file);
            const { width, height } = await readImage(preview);
            URL.revokeObjectURL(preview);

            const geometry = checkLogoDimensions(width, height);
            if (geometry) {
                setProblem(geometry);
                return;
            }

            const form = new FormData();
            form.append("file", file);
            const result = await uploadBrandLogo(form);

            if (!result.ok) {
                setProblem(
                    result.reference
                        ? `${result.message} (Reference: ${result.reference})`
                        : result.message
                );
                return;
            }
            onChange(result.url);
        } catch {
            setProblem("Could not read that image. Try another file.");
        } finally {
            setBusy(false);
        }
    };

    const handlePaste = async (): Promise<void> => {
        const url = pasted.trim();
        setProblem(null);

        if (!isRenderableLogoUrl(url)) {
            setProblem("Paste a full https:// link to an image file.");
            return;
        }

        setBusy(true);
        try {
            const { width, height } = await readImage(url);
            const geometry = checkLogoDimensions(width, height);
            if (geometry) {
                setProblem(geometry);
                return;
            }
            onChange(url);
            setPasted("");
        } catch {
            setProblem(
                "That link didn't load as an image. It may be private, or the host may block " +
                    "other sites from displaying it — upload the file instead."
            );
        } finally {
            setBusy(false);
        }
    };

    if (value) {
        return (
            <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Logo
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-token border border-primary/40 bg-primary/5 p-3">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-token bg-background p-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element -- reason: arbitrary logo host, not in image remotePatterns */}
                        <img
                            src={value}
                            alt="Brand logo"
                            className="h-full w-full object-contain"
                        />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-xs text-primary">
                        <Check size={13} className="mr-1 inline" />
                        Logo set
                        <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                            {value}
                        </span>
                    </p>
                    <button
                        type="button"
                        aria-label="Remove logo"
                        onClick={() => onChange("")}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Logo
            </label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                    value={pasted}
                    onChange={(e) => setPasted(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        void handlePaste();
                    }}
                    placeholder="https://… link to the logo"
                    aria-label="Link to the brand's logo"
                    className="sm:flex-1"
                    disabled={busy}
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={busy || !pasted.trim()}
                    onClick={() => void handlePaste()}
                >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
                    Use link
                </Button>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept={BRAND_LOGO.acceptedTypes.join(",")}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                    e.target.value = "";
                }}
            />

            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className="mt-2"
            >
                <Upload size={14} /> Or upload the file
            </Button>

            <p
                className={cn(
                    "mt-1.5 text-[11px]",
                    problem ? "text-destructive" : "text-muted-foreground"
                )}
            >
                {problem ? (
                    <>
                        <AlertTriangle size={12} className="mr-1 inline" />
                        {problem}
                    </>
                ) : (
                    BRAND_LOGO_HINT
                )}
            </p>
        </div>
    );
};

export default BrandLogoField;
