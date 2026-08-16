"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { getAdminSettings, savePairingSettings } from "@/actions/admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/providers/ToastProvider";
import { site } from "@/config/site";

/** Runtime settings — the pairing switch, the fee, and where the money lands. */
const PairingSettings = (): React.JSX.Element => {
    const [pairingEnabled, setPairingEnabled] = useState(false);
    const [pairAmount, setPairAmount] = useState(site.payment.amount);
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async (): Promise<void> => {
            const settings = await getAdminSettings();
            setPairingEnabled(settings.pairingEnabled);
            setPairAmount(settings.pairAmount);
            setBankName(settings.bankName);
            setAccountName(settings.accountName);
            setAccountNumber(settings.accountNumber);
            setLoading(false);
        };
        void load();
    }, []);

    const handleSave = async (): Promise<void> => {
        setSaving(true);
        const result = await savePairingSettings({
            pairingEnabled,
            pairAmount,
            bankName,
            accountName,
            accountNumber,
        });
        setSaving(false);
        if (result.ok) appToast.success(result.message);
        else appToast.error(result.message);
    };

    if (loading) {
        return <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    return (
        <div className="surface mt-4 max-w-lg p-6">
            <label className="flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    checked={pairingEnabled}
                    onChange={(e) => setPairingEnabled(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                    <span className="block font-medium text-foreground">Pairing is open</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                        Opens the pairing page and its nav link for everyone, immediately. Turn
                        it off and the page goes back to &ldquo;opens soon&rdquo; — pairings
                        already made are untouched.
                    </span>
                </span>
            </label>

            <div className="mt-6">
                <Label htmlFor="pair-amount">Fee per pair ({site.payment.currency})</Label>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    One transfer covers both people. Changing this only affects pairings made
                    from now on — existing ones keep the amount they were quoted.
                </p>
                <Input
                    id="pair-amount"
                    type="number"
                    min={0}
                    step={100}
                    value={pairAmount}
                    onChange={(e) => setPairAmount(Number(e.target.value))}
                    className="mt-2 max-w-[12rem]"
                />
            </div>

            <div className="mt-7 border-t border-border pt-6">
                <h3 className="font-luxury text-lg text-foreground">Where the money goes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Shown on the payment screen after someone pairs. Get this wrong and the
                    transfers go to the wrong account — check it twice.
                </p>

                <div className="mt-4 space-y-4">
                    <div>
                        <Label htmlFor="bank-name">Bank</Label>
                        <Input
                            id="bank-name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="UBA"
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="account-name">Account name</Label>
                        <Input
                            id="account-name"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="Account holder's full name"
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="account-number">Account number</Label>
                        <Input
                            id="account-number"
                            inputMode="numeric"
                            value={accountNumber}
                            onChange={(e) =>
                                setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                            placeholder="0123456789"
                            className="mt-1.5 max-w-[14rem] font-mono tracking-wider"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            10 digits. {accountNumber.length}/10
                        </p>
                    </div>
                </div>
            </div>

            <Button onClick={() => void handleSave()} disabled={saving} className="mt-6">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save settings"}
            </Button>
        </div>
    );
};

export default PairingSettings;
