/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import {
    Car,
    MapPin,
    Search,
    Users,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight,
    Loader2,
    UserX,
} from "lucide-react";
import { profileStore } from "@/stores/profileStore";
import Loading from "@/app/components/ui/Loading";
import { DinnerProfileRecord } from "@rcffuta/ict-lib";
import { authStore } from "@/stores/authStore";
import NotEligible from "@/app/components/ui/NotEligible";
import { MANAGERS } from "@/data/meta";

// ── Types ────────────────────────────────────────────────────────────────────
// DinnerProfileRecord extended with the vehicle fields we save during registration
type ProfileWithVehicle = DinnerProfileRecord & {
    wantsVehicle?: boolean;
    pickupAddress?: string;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const EmptyState = () => (
    <div className="max-w-xl mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass backdrop-blur-sm border border-white/20 p-8 text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-champagne-gold/10 text-champagne-gold-600 dark:text-champagne-gold-400 p-4 rounded-full">
                <UserX className="w-10 h-10" />
            </div>
        </div>
        <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-3">
            No Vehicle Requests
        </h2>
        <p className="text-pearl-600 dark:text-pearl-300">
            No one has opted in for a vehicle pickup yet.
        </p>
    </div>
);

const VehicleCard = ({ profile }: { profile: ProfileWithVehicle }) => (
    <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-2xl shadow-glass backdrop-blur-sm border border-white/20 p-6 transition-all duration-300 hover:shadow-elevated hover-lift">
        <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-champagne-gold to-rose-gold p-0.5">
                    <img
                        src={profile.picture || "/default-avatar.png"}
                        alt={`${profile.firstname} ${profile.lastname}`}
                        className="w-full h-full rounded-full object-cover bg-white"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-pearl-800 dark:text-pearl-100 truncate">
                        {profile.firstname} {profile.lastname}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-champagne-gold/20 text-champagne-gold-700 dark:text-champagne-gold-300">
                        <Car className="w-3 h-3" />
                        Pickup
                    </span>
                </div>

                <div className="space-y-1.5 text-sm text-pearl-600 dark:text-pearl-300">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profile.email}</span>
                    </div>
                    {profile.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-champagne-gold" />
                        <span className="font-medium text-pearl-700 dark:text-pearl-200">
                            {profile.pickupAddress || "No address provided"}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-pearl-200 dark:border-pearl-700">
            <p className="text-xs text-pearl-500 dark:text-pearl-400">
                Registered on{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}
            </p>
        </div>
    </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

function VehiclePickupManager() {
    const allProfiles = profileStore.allProfiles as ProfileWithVehicle[];
    const user = authStore.member;
    const isAuthing = authStore.isLoading;

    const [searchTerm, setSearchTerm] = useState("");
    const [filtered, setFiltered] = useState<ProfileWithVehicle[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const perPage = 9;

    const loadProfiles = useCallback(async () => {
        try {
            await profileStore.loadAllProfiles();
        } catch (err) {
            console.error("Failed to load profiles:", err);
        }
    }, []);

    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);

    // Filter to only people who opted in for vehicle pickup
    useEffect(() => {
        const vehicleProfiles = allProfiles.filter((p) => p.wantsVehicle === true);

        setIsSearching(true);
        const t = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFiltered(vehicleProfiles);
            } else {
                const q = searchTerm.toLowerCase();
                setFiltered(
                    vehicleProfiles.filter(
                        (p) =>
                            p.firstname.toLowerCase().includes(q) ||
                            p.lastname.toLowerCase().includes(q) ||
                            p.email.toLowerCase().includes(q) ||
                            (p.pickupAddress || "").toLowerCase().includes(q)
                    )
                );
            }
            setIsSearching(false);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(t);
    }, [searchTerm, allProfiles.length]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );
    const paginate = (n: number) => {
        if (n < 1 || n > totalPages) return;
        setCurrentPage(n);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (profileStore.loading || isAuthing) return <Loading />;
    if (!user) return <NotEligible coordinatorName="ICT coordinator" />;
    if (!MANAGERS.includes(user.email))
        return <NotEligible coordinatorName="ICT coordinator" />;

    const totalVehicleRequests = (allProfiles as ProfileWithVehicle[]).filter(
        (p) => p.wantsVehicle
    ).length;

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-champagne-gold to-rose-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Car className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2">
                        Vehicle Pickup List
                    </h1>
                    <p className="text-pearl-600 dark:text-pearl-300 max-w-2xl mx-auto">
                        Attendees who have requested a vehicle pickup
                    </p>
                </div>

                {/* Stats bar */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 text-champagne-gold-700 dark:text-champagne-gold-300">
                        <Car className="w-5 h-5" />
                        <span className="font-semibold">
                            {totalVehicleRequests} vehicle request
                            {totalVehicleRequests !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-glass-warm backdrop-blur-md border border-pearl-700/30 rounded-2xl shadow-soft p-6 mb-8 max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pearl-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-pearl-800/50 border border-pearl-300 dark:border-pearl-600 rounded-xl focus:ring-2 focus:ring-champagne-gold focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-pearl-600 font-semibold dark:text-pearl-300 text-sm">
                            Showing {filtered.length} of {totalVehicleRequests} request
                            {totalVehicleRequests !== 1 ? "s" : ""}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-champagne-gold hover:text-golden-600 text-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                {isSearching ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-champagne-gold/20 text-champagne-gold-700 dark:text-champagne-gold-300">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>Searching...</span>
                        </div>
                    </div>
                ) : paginated.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {paginated.map((profile) => (
                                <VehicleCard key={profile.id} profile={profile} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-white/80 dark:bg-pearl-800/50 border border-pearl-300 dark:border-pearl-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-pearl-800 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => paginate(page)}
                                            className={`w-10 h-10 rounded-lg border transition-colors ${
                                                currentPage === page
                                                    ? "bg-champagne-gold text-white border-champagne-gold"
                                                    : "bg-white/80 dark:bg-pearl-800/50 border-pearl-300 dark:border-pearl-600 hover:bg-white dark:hover:bg-pearl-800"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-white/80 dark:bg-pearl-800/50 border border-pearl-300 dark:border-pearl-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-pearl-800 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default observer(VehiclePickupManager);
