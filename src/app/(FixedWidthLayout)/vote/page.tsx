// app/voting/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import {
    Vote,
    Award,
    CheckCircle,
    Loader2,
    Sparkles,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { authStore } from "@/stores/authStore";
import { VOTE_CONFIG } from "@/data/voteConfig";
import { voteStore } from "@/stores/vote.store";
import {
    GroupContestantCard,
    IndividualContestantCard,
} from "@/components/voting/ContestantCards";
import CategoryNavigation from "@/components/voting/CategoryNavigation";
import VotingHeader from "@/components/voting/VotingHeader";
import { loadContestants, wait } from "@rcffuta/ict-lib";
import { getAllEmails } from "@/lib/function";

// Confetti effect function
const launchConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#DAA520", "#FFA500", "#B8860B"],
    });
};

// Loading Component
const VotingLoadingState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-50 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 p-4">
        <div className="max-w-md mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center animate-fade-in">
            {/* Animated Spinner */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="bg-champagne-gold/10 text-champagne-gold-600 dark:text-champagne-gold-400 p-4 rounded-full">
                        <Loader2 className="w-12 h-12 animate-spin" />
                    </div>
                    <Sparkles className="w-6 h-6 text-rose-gold-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-3">
                Preparing Your Ballot
            </h2>

            {/* Message */}
            <p className="text-pearl-600 dark:text-pearl-300">
                We&apos;re setting up your voting experience
                <span className="block font-semibold text-champagne-gold-600 dark:text-champagne-gold-400 mt-2">
                    This won&apos;t take long ✨
                </span>
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mt-6">
                {[1, 2, 3].map((dot) => (
                    <div
                        key={dot}
                        className="w-2 h-2 bg-champagne-gold-300 rounded-full animate-pulse"
                        style={{ animationDelay: `${dot * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// Enhanced Error Component
const VotingErrorState = ({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-50 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 p-4">
        <div className="max-w-md mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center animate-fade-in">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
                <div className="bg-rose-gold-100/20 text-rose-gold-600 dark:text-rose-gold-400 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-3">
                Something Went Wrong
            </h2>

            {/* Error Message */}
            <p className="text-pearl-600 dark:text-pearl-300 mb-6">{message}</p>

            {/* Retry Button */}
            <button
                onClick={onRetry}
                className="btn btn-primary transform-romantic hover-lift"
            >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
            </button>

            {/* Support Text */}
            <p className="text-sm text-pearl-500 dark:text-pearl-400 mt-4">
                If this persists, please contact support
            </p>
        </div>
    </div>
);

// Enhanced Voting Not Commenced State
const VotingNotCommencedState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-50 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 p-4">
        <div className="max-w-md mx-auto bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-white/20 p-8 text-center animate-fade-in">
            {/* Calendar Icon */}
            <div className="flex justify-center mb-6">
                <div className="bg-champagne-gold-100/20 text-champagne-gold-600 dark:text-champagne-gold-400 p-4 rounded-full">
                    <Calendar className="w-12 h-12" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-pearl-800 dark:text-pearl-100 mb-3">
                Voting Not Started Yet
            </h2>

            {/* Message */}
            <p className="text-pearl-600 dark:text-pearl-300 mb-6">
                The dinner awards voting hasn&apos;t commenced yet. Please check
                back later for updates.
            </p>

            {/* Countdown/Info */}
            <div className="bg-glass-warm backdrop-blur-sm rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center text-pearl-500 dark:text-pearl-400">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                        Stay tuned for the announcement
                    </span>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => window.location.reload()}
                className="btn btn-outline transform-romantic hover-lift"
            >
                Check Again
            </button>
        </div>
    </div>
);

// Enhanced Voting Completed State
const VotingCompletedState = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50/80 to-success-100/60 dark:from-success-900/30 dark:to-success-800/20 p-4">
        <div className="max-w-md mx-auto bg-gradient-to-br from-white/95 to-success-50/30 dark:from-luxury-900/95 dark:to-success-900/20 rounded-3xl shadow-glass overflow-hidden backdrop-blur-sm border border-success-200/30 p-8 text-center animate-fade-in">
            {/* Success Icon with Sparkles */}
            <div className="relative flex justify-center mb-6">
                <div className="bg-success-100/30 text-success-600 dark:text-success-400 p-4 rounded-full">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <Sparkles className="w-6 h-6 text-champagne-gold-400 absolute -top-2 -right-2 animate-bounce" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-luxury font-bold text-success-800 dark:text-success-200 mb-3">
                Voting Complete!
            </h2>

            {/* Message */}
            <p className="text-success-600 dark:text-success-300 mb-6">
                Thank you for participating in the dinner awards voting.
                Your votes has helped a lot, thank you.
            </p>

            {/* Additional Info */}
            <div className="bg-success-50/50 dark:bg-success-900/30 rounded-xl p-4 mb-6">
                <Trophy className="w-8 h-8 text-success-600 dark:text-success-400 mx-auto mb-2" />
                <p className="text-sm text-success-700 dark:text-success-300">
                    Results will be announced at the dinner ceremony
                </p>
            </div>

            {/* Action Button */}
            {/* <button
                onClick={() => window.location.reload()}
                className="btn btn-primary transform-romantic hover-lift"
            >
                View Voting Summary
            </button> */}
        </div>
    </div>
);

function VotingPage() {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [isSessionCompleted, setIsSessionCompleted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loadingState, setLoadingState] = useState<
        "idle" | "loading" | "error"
    >("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const currentCategory = VOTE_CONFIG[currentCategoryIndex];
    const user = authStore.member;
    const userId = user?.id;
    const userMail = user?.email;

    const contestants = voteStore.contestants;
    const hasContestants = contestants.length > 0;

    // Initialize voting session
    const initializeVoting = useCallback(async () => {
        if (!userId || !userMail) return;

        setLoadingState("loading");

        try {
            const allHandles = getAllEmails(VOTE_CONFIG);

            const {
                message,
                success,
                data
            } = await loadContestants(allHandles);

            if (!success) {
                // throw new Error(message);
                voteStore.setContestants([]);
            } else {
                voteStore.setContestants(data);
            }

            // console.debug({data})


            setIsInitialized(true);
            setLoadingState("idle");
        } catch (error: any) {
            setErrorMessage(
                error.message || "Failed to load voting session"
            );
            setLoadingState("error");
        }
    }, [userId, userMail]);

    useEffect(() => {
        initializeVoting();
    }, [initializeVoting]);

    const handleSelectChoice = useCallback(
        (choice: string | string[]) => {
            if (!userId) return;

            voteStore.addVote(currentCategory.id, choice.toString());

            // Show mini celebration for each vote
            if (voteStore.votedCategories % 5 === 0) {
                launchConfetti();
            }
        },
        [userId, currentCategory.id]
    );

    const handleCategoryClick = useCallback((index: number) => {
        setCurrentCategoryIndex(index);
        const element = document.getElementById(
            `category-${VOTE_CONFIG[index].id}`
        );
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    const handleNextCategory = useCallback(() => {
        if (currentCategoryIndex < VOTE_CONFIG.length - 1) {
            handleCategoryClick(currentCategoryIndex + 1);
        }
    }, [currentCategoryIndex, handleCategoryClick]);

    const handlePrevCategory = useCallback(() => {
        if (currentCategoryIndex > 0) {
            handleCategoryClick(currentCategoryIndex - 1);
        }
    }, [currentCategoryIndex, handleCategoryClick]);

    const handleSubmitVotes = async () => {
        if (!user?.id) return;

        const success = await voteStore.submitVotes(userMail!);
        if (success) {
            setIsSessionCompleted(true);
            setShowConfetti(true);
            launchConfetti();

            // Continuous confetti for celebration
            setTimeout(() => launchConfetti(), 1000);
            setTimeout(() => launchConfetti(), 2000);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNextCategory();
            if (e.key === "ArrowLeft") handlePrevCategory();
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleNextCategory, handlePrevCategory]);

    // Show loading state
    if (loadingState === "loading") {
        return <VotingLoadingState />;
    }

    // Show error state
    if (loadingState === "error") {
        return (
            <VotingErrorState
                message={errorMessage}
                onRetry={initializeVoting}
            />
        );
    }

    // Show voting not commenced state if no contestants
    if (!hasContestants && isInitialized) {
        return <VotingNotCommencedState />;
    }

    // Show completed state
    if (isSessionCompleted) {
        return <VotingCompletedState />;
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-pearl-50 via-white to-rose-50/50 dark:from-luxury-900 dark:via-luxury-800 dark:to-romance-900">
            <div className="max-w-6xl mx-auto">
                <VotingHeader
                    currentCategoryIndex={currentCategoryIndex}
                    voteConfigTotal={VOTE_CONFIG.length}
                    voteCategories={voteStore.votedCategories}
                    progress={voteStore.progress}
                    lastVotedCategory={voteStore.lastVotedCategory}
                />

                {/* Navigation Arrows */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={handlePrevCategory}
                        disabled={currentCategoryIndex === 0}
                        className="flex items-center text-pearl-600 hover:text-champagne-gold-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 mr-2" />
                        Previous
                    </button>

                    <span className="text-sm text-pearl-500">
                        Use ← → arrow keys to navigate
                    </span>

                    <button
                        onClick={handleNextCategory}
                        disabled={
                            currentCategoryIndex === VOTE_CONFIG.length - 1
                        }
                        className="flex items-center text-pearl-600 hover:text-champagne-gold-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ChevronRight className="w-6 h-6 ml-2" />
                    </button>
                </div>

                {/* Current Category */}
                <div className="mb-16" id={`category-${currentCategory.id}`}>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-champagne-gold-400 to-rose-gold-400 rounded-full mb-4">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-luxury font-bold text-gradient-gold mb-4">
                            {currentCategory.name}
                        </h2>
                        <p className="text-pearl-600 dark:text-pearl-300 max-w-2xl mx-auto leading-relaxed">
                            {currentCategory.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentCategory.type === "individual"
                            ? contestants
                                  .filter((contestant) =>
                                      (
                                          currentCategory.candidates as string[]
                                      ).includes(contestant.email)
                                  )
                                  .map((contestant) => {
                                      const selection =
                                          voteStore.getVoteForCategory(
                                              currentCategory.id
                                          );
                                      return (
                                          <IndividualContestantCard
                                              key={contestant.email}
                                              contestant={contestant}
                                              selected={
                                                  selection === contestant.email
                                              }
                                              onSelect={() =>
                                                  handleSelectChoice(
                                                      contestant.email
                                                  )
                                              }
                                              canDownload={true}
                                          />
                                      );
                                  })
                            : (currentCategory.candidates as string[][]).map(
                                  (groupEmails, index) => {
                                      const groupContestants =
                                          contestants.filter((contestant) =>
                                              groupEmails.includes(
                                                  contestant.email
                                              )
                                          );
                                      const selection =
                                          voteStore.getVoteForCategory(
                                              currentCategory.id
                                          );
                                          const mails = groupContestants.map(
                                              (c) => c.email
                                          ).toString();

                                      return (
                                          <GroupContestantCard
                                              key={index}
                                              contestants={groupContestants}
                                              selected={selection === mails}
                                              onSelect={() =>
                                                  handleSelectChoice(mails)
                                              }
                                              canDownload={true}
                                          />
                                      );
                                  }
                              )}
                    </div>
                </div>

                {/* Navigation and Submit */}
                <div className="flex flex-col items-center space-y-6">
                    <CategoryNavigation
                        voteConfig={VOTE_CONFIG}
                        currentCategoryIndex={currentCategoryIndex}
                        // votes={voteStore.votes}
                        onClick={handleCategoryClick}
                    />

                    <div className="flex flex-col items-center space-y-4">
                        <button
                            onClick={handleSubmitVotes}
                            disabled={
                                voteStore.votedCategories === 0 ||
                                voteStore.isSubmitting
                            }
                            className="btn btn-romantic px-8 py-4 text-lg relative overflow-hidden group"
                        >
                            {voteStore.isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Submitting Votes...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Vote className="w-5 h-5" />
                                    <span>
                                        Submit All Votes (
                                        {voteStore.votedCategories}/
                                        {VOTE_CONFIG.length})
                                    </span>
                                </div>
                            )}

                            {/* Animated sparkle effect */}
                            <span className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                            </span>
                        </button>

                        {voteStore.votedCategories > 0 && (
                            <p className="text-sm text-pearl-500 text-center">
                                You&lsquo;ve completed {voteStore.votedCategories} out
                                of {VOTE_CONFIG.length} categories
                            </p>
                        )}
                    </div>
                </div>

                {/* Progress Celebration */}
                {voteStore.progress === 100 && (
                    <div className="fixed bottom-4 right-4 bg-success/90 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                        <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm">
                                All categories completed! 🎉
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default observer(VotingPage);
