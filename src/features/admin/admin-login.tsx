"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import Logo from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/store/admin.store";

const AdminLogin = (): React.JSX.Element => {
    const [email, setEmail] = useState("");
    const loggingIn = useAdminStore((s) => s.loggingIn);
    const error = useAdminStore((s) => s.error);
    const login = useAdminStore((s) => s.login);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!email.trim()) return;
        await login(email.trim());
    };

    return (
        <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:py-28">
            <form onSubmit={handleSubmit} className="surface w-full animate-fade-in p-8">
                <div className="flex flex-col items-center text-center">
                    <Logo size={56} withWordmark={false} href={null} />
                    <span className="eyebrow mt-5">Organizers</span>
                    <h1 className="mt-2 font-luxury text-2xl text-foreground">Admin access</h1>
                    <p className="mt-2 text-sm text-foreground/70">
                        Enter your authorized admin email to view registrations.
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@email.com"
                        autoComplete="email"
                        required
                    />

                    {error && (
                        <div className="flex items-center gap-2 rounded-token border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <Button type="submit" size="lg" className="w-full sheen" disabled={loggingIn}>
                        {loggingIn ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Verifying…
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={18} /> Continue <ArrowRight size={18} />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AdminLogin;
