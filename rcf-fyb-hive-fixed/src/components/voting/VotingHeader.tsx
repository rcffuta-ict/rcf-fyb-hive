// components/voting/VotingHeader.tsx
import { Sparkles, Award, Star } from "lucide-react";

interface VotingHeaderProps {
    currentCategoryIndex: number;
    voteConfigTotal: number;
    voteCategories: number;
    progress: number;
    lastVotedCategory?: string | null;
}

export default function VotingHeader({
    currentCategoryIndex,
    voteConfigTotal,
    voteCategories,
    progress,
    lastVotedCategory,
}: VotingHeaderProps) {
    return (
        <div className="text-center mb-12">
            <div className="relative mb-8">
                <div className="absolute left-1/4 top-0 w-12 h-12 bg-champagne-gold-300 rounded-full opacity-20 blur-lg animate-float"></div>
                <div className="absolute right-1/4 bottom-0 w-12 h-12 bg-rose-gold-300 rounded-full opacity-20 blur-lg animate-float-slow"></div>

                <h1 className="text-4xl md:text-5xl font-luxury font-bold text-gradient-gold mb-6 relative z-10">
                    Fellowship Awards Voting
                </h1>
            </div>

            <div className="bg-glass-warm backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-3xl mx-auto">
                <p className="text-xl font-elegant text-pearl-800 dark:text-pearl-100 mb-4 leading-relaxed">
                    Celebrate excellence by voting for your peers in each
                    category
                </p>

                {/* Progress with celebration */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-pearl-600 dark:text-pearl-300">
                            Your Progress
                        </span>
                        <span className="text-sm font-semibold text-champagne-gold-600">
                            {voteCategories} / {voteConfigTotal}
                        </span>
                    </div>

                    <div className="w-full bg-pearl-200 dark:bg-pearl-700 rounded-full h-3 mb-2">
                        <div
                            className="bg-gradient-to-r from-champagne-gold-400 to-rose-gold-400 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Animated shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>

                    {/* Celebration messages */}
                    {progress >= 100 && (
                        <div className="flex items-center justify-center text-success-600 mt-2">
                            <Sparkles className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                                All categories completed! 🎉
                            </span>
                        </div>
                    )}

                    {progress >= 50 && progress < 100 && (
                        <div className="flex items-center justify-center text-amber-600 mt-2">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                                Halfway there! Keep going! ✨
                            </span>
                        </div>
                    )}
                </div>

                {lastVotedCategory && (
                    <div className="text-sm text-pearl-500 dark:text-pearl-400">
                        Last voted:{" "}
                        <span className="font-medium">{lastVotedCategory}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
