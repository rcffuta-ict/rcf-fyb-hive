"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { addBrandCandidate, addCliqueCandidate } from "@/actions/awards-admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/providers/ToastProvider";
import BrandLogoField from "./brand-logo-field";
import MemberEmailsField, { type ResolvedMember } from "./member-emails-field";

/**
 * Standing a clique or a brand — the two entries that are not one person.
 *
 * One component rather than two because the shape is identical (a name, a
 * nickname, a roster) and only two things differ: a brand needs a logo, and the
 * two have different floors for how many people must be named. Splitting them
 * would mean maintaining the same form twice, and the version that gets edited
 * less would slowly drift into being the worse one.
 *
 * The submit button stays dead until the entry is actually complete, so the
 * standard's floor — three members for a clique — is visible as a state of the
 * form rather than discovered as an error after the click.
 */

const GroupEntryForm = ({
    categoryId,
    entryKind,
    onAdded,
}: {
    categoryId: string;
    entryKind: "clique" | "brand";
    onAdded: () => void;
}): React.JSX.Element => {
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [members, setMembers] = useState<ResolvedMember[]>([]);
    const [busy, setBusy] = useState(false);

    const clique = entryKind === "clique";
    const minMembers = clique ? 3 : 1;

    const ready =
        name.trim() !== "" &&
        nickname.trim() !== "" &&
        members.length >= minMembers &&
        (clique || logoUrl !== "");

    const handleAdd = async (): Promise<void> => {
        if (!ready) return;

        setBusy(true);
        const emails = members.map((member) => member.email);
        const result = clique
            ? await addCliqueCandidate({ categoryId, name, nickname, emails })
            : await addBrandCandidate({ categoryId, name, nickname, logoUrl, emails });
        setBusy(false);

        if (!result.ok) {
            appToast.error(result.message);
            return;
        }

        appToast.success(result.message);
        setName("");
        setNickname("");
        setLogoUrl("");
        setMembers([]);
        onAdded();
    };

    return (
        <div className="mt-4 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {clique ? "Clique name" : "Brand name"}
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={clique ? "The Upper Room" : "Ada's Kitchen"}
                        aria-label={clique ? "Clique name" : "Brand name"}
                        className="mt-2"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                        This is what appears on the ballot card.
                    </p>
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nickname for this category
                    </label>
                    <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={clique ? "Six Years Deep" : "Campus Comfort Food"}
                        aria-label="Nickname for this category"
                        className="mt-2"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                        The line under the name — what they&apos;re standing for.
                    </p>
                </div>
            </div>

            {!clique && <BrandLogoField value={logoUrl} onChange={setLogoUrl} />}

            <MemberEmailsField
                categoryId={categoryId}
                members={members}
                onChange={setMembers}
                label={clique ? "Members" : "Founder & co-founders"}
                hint={
                    clique
                        ? "At least 3, and every one must be a registered finalist — that's what gives each of them a face on the card."
                        : "The first person named is recorded as the founder; anyone after is a co-founder. All of them share the award."
                }
            />

            <div className="flex flex-wrap items-center gap-3">
                <Button disabled={busy || !ready} onClick={() => void handleAdd()}>
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Add {clique ? "clique" : "brand"}
                </Button>

                {!ready && (
                    <p className="text-xs text-muted-foreground">
                        {members.length < minMembers
                            ? `${minMembers - members.length} more ${
                                  clique ? "member" : "founder"
                              }${minMembers - members.length === 1 ? "" : "s"} needed.`
                            : !clique && !logoUrl
                              ? "Add the logo to continue."
                              : "Fill in the name and nickname."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default GroupEntryForm;
