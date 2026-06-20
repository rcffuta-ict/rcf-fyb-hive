/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import {
    Search,
    Users,
    UserCheck,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { profileStore } from "@/stores/profileStore";
// import NotEligible from "@/app/components/ui/NotEligible";
import Loading from "@/app/components/ui/Loading";
import {
    DinnerProfileRecord,
    getDinnerProfile,
    wait
} from "@rcffuta/ict-lib";
import { authStore } from "@/stores/authStore";
import NotEligible from "@/app/components/ui/NotEligible";
import { MANAGERS } from "@/data/meta";
import { EmptyState, ErrorState, SearchState } from "@/components/Manage/state";
// import NotAvailableYet from "@/app/components/ui/NotAvailableYet";

// State components

type SinglePairProps = {
    picture: string;
    name: string;
}

const SinglePair = (props: SinglePairProps) => {
    const {
        name,
        picture
    } = props;
    return (
        <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-champagne-gold to-rose-gold p-0.5">
                <img
                    src={picture}
                    alt={name}
                    className="w-full h-full rounded-full object-cover bg-white"
                />
            </div>

            <h3 className="text-lg font-semibold text-pearl-800 dark:text-pearl-100 truncate">
                {name}
            </h3>
        </div>
    );
}

const PairCard = ({ profile }: { profile: DinnerProfileRecord }) => (
    <div className="bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-2xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-6 transition-all duration-300 hover:shadow-elevated hover-lift relative">
        <div className="">
            <div className="flex items-center justify-between mb-2">
                <SinglePair
                    name="Precious Olusola"
                    picture="/images/male.svg"
                />
                <SinglePair
                    name="Precious Olusola"
                    picture="/images/female.svg"
                />
            </div>

            <span
                className={`absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    profile.isFinalist
                        ? "bg-champagne-gold/20 text-champagne-gold-700 dark:text-champagne-gold-300"
                        : "bg-rose-gold/20 text-rose-gold-700 dark:text-rose-gold-300"
                }`}
            >
                {profile.isFinalist ? (
                    <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Finalist
                    </>
                ) : (
                    <>
                        <Users className="w-3 h-3 mr-1" />
                        Associate
                    </>
                )}
            </span>
        </div>

        <div className="mt-4 pt-4 border-t border-pearl-200 dark:border-pearl-700">
            <p className="text-xs text-pearl-500 dark:text-pearl-400">
                Registered on {new Date(profile.createdAt).toLocaleDateString()}
            </p>
        </div>
    </div>
);


function DinnerPairsManager() {
    const profiles = profileStore.allProfiles;
    const user = authStore.member;
    const isAuthing = authStore.isLoading;

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProfiles, setFilteredProfiles] = useState<
        DinnerProfileRecord[]
    >([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const profilesPerPage = 9;

    

    // Load dinner profiles
    const loadDinnerProfiles = useCallback(async () => {
        try {
            await profileStore.loadAllProfiles();
        } catch (error) {
            console.error("Failed to load dinner profiles:", error);
        }
    }, []);

    useEffect(() => {
        loadDinnerProfiles();

    }, [loadDinnerProfiles]);

    // Filter profiles based on search term
    useEffect(() => {
        if (profiles.length === 0) return;

        setIsSearching(true);
        const timer = setTimeout(() => {

            let filtered = profiles;

            if (searchTerm) {
                filtered = profiles.filter(
                    (profile: DinnerProfileRecord) =>
                        profile.firstname
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        profile.lastname
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        profile.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                );
            }
            setFilteredProfiles(filtered);
            setIsSearching(false);
            setCurrentPage(1); // Reset to first page when search changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, profiles.length]);

    // Pagination logic
    const indexOfLastProfile = currentPage * profilesPerPage;
    const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
    const currentProfiles = filteredProfiles.slice(
        indexOfFirstProfile,
        indexOfLastProfile
    );
    const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Render appropriate state based on conditions
    if (profileStore.loading || isAuthing) return <Loading />;
    if (profileStore.error) return <ErrorState message={profileStore.error} />;

    if (!user) return <NotEligible coordinatorName="300 level coordinator"/>

    if (!MANAGERS.includes(user.email)) return <NotEligible coordinatorName="ICT coordinator" />;

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-champagne-gold to-rose-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Users className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-2">
                        Dinner Registrations
                    </h1>
                    <p className="text-pearl-600 dark:text-pearl-300 max-w-2xl mx-auto">
                        Manage and view all registered dinner participants
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-glass-warm backdrop-blur-md border border-pearl-700/30 rounded-2xl shadow-soft p-6 mb-8 max-w-2xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pearl-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-pearl-800/50 border border-pearl-300 dark:border-pearl-600 rounded-xl focus:ring-2 focus:ring-champagne-gold focus:border-transparent transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-pearl-600 font-semibold dark:text-pearl-300">
                            {profiles.length} registration
                            {profiles.length !== 1 ? "s" : ""}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-champagne-gold hover:text-golden-600 text-sm"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                </div>

                {/* Profiles Grid */}
                {isSearching ? (
                    <SearchState count={filteredProfiles.length} />
                ) : (
                    <>
                        {currentProfiles.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                                    {currentProfiles.map((profile) => (
                                        <PairCard
                                            key={profile.id}
                                            profile={profile}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-2 mt-8">
                                        <button
                                            onClick={() =>
                                                paginate(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg bg-white/80 dark:bg-pearl-800/50 border border-pearl-300 dark:border-pearl-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-pearl-800 transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1
                                        ).map((page) => (
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
                                        ))}

                                        <button
                                            onClick={() =>
                                                paginate(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="p-2 rounded-lg bg-white/80 dark:bg-pearl-800/50 border border-pearl-300 dark:border-pearl-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-pearl-800 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default observer(DinnerPairsManager);
