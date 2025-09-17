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
import { wait } from "@rcffuta/ict-lib";
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

function VotingPage() {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [isSessionCompleted, setIsSessionCompleted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const currentCategory = VOTE_CONFIG[currentCategoryIndex];
    const user = authStore.member;
    const userId = user?.id;
    const userMail = user?.email;

    const contestants = voteStore.contestants;

    // Initialize voting session
    useEffect(() => {
        const initializeVoting = async () => {
            if (userId && userMail) {
                await voteStore.loadVotingSession(userMail);

                try {
                    const allHandles = getAllEmails(VOTE_CONFIG);
                    // Load contestants logic here
                    voteStore.setContestants([]);
                } catch (error) {
                    console.error("Failed to load contestants:", error);
                }

                setIsInitialized(true);
            }
        };

        initializeVoting();
    }, [userId, userMail]);

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

    if (voteStore.loading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pearl-50 to-rose-50/30">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-champagne-gold-400 mx-auto mb-4" />
                        <Sparkles className="w-8 h-8 text-rose-gold-400 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-luxury text-pearl-700 mb-2">
                        Preparing Your Ballot
                    </h2>
                    <p className="text-pearl-600">
                        Loading your voting session...
                    </p>
                </div>
            </div>
        );
    }

    if (isSessionCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 to-success-100">
                <div className="text-center max-w-2xl mx-4">
                    <div className="relative mb-6">
                        <CheckCircle className="w-20 h-20 text-success mx-auto mb-2" />
                        <div className="absolute -top-2 -right-2">
                            <Sparkles className="w-8 h-8 text-champagne-gold-400 animate-bounce" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-luxury font-bold text-success-800 mb-4">
                        Voting Complete!
                    </h1>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
                        <Trophy className="w-12 h-12 text-champagne-gold-600 mx-auto mb-4" />
                        <p className="text-lg text-pearl-700 mb-4">
                            Thank you for participating in the fellowship awards
                            voting. Your votes help recognize excellence in our
                            community.
                        </p>
                        <p className="text-pearl-600">
                            Results will be announced at the annual dinner
                            ceremony.
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                        View Voting Summary
                    </button>
                </div>
            </div>
        );
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
                                              key={contestant.id}
                                              contestant={contestant}
                                              selected={
                                                  selection === contestant.id
                                              }
                                              onSelect={() =>
                                                  handleSelectChoice(
                                                      contestant.id
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

                                      return (
                                          <GroupContestantCard
                                              key={index}
                                              contestants={groupContestants}
                                              selected={
                                                  selection ===
                                                  JSON.stringify(
                                                      groupContestants.map(
                                                          (c) => c.id
                                                      )
                                                  )
                                              }
                                              onSelect={() =>
                                                  handleSelectChoice(
                                                      groupContestants.map(
                                                          (c) => c.id
                                                      )
                                                  )
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
                                You&#39;ve completed {voteStore.votedCategories} out
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
