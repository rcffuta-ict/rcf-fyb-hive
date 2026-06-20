import { VoteCofigType } from "@/data/voteConfig";
import { voteStore } from "@/stores/vote.store";
import { VoteRecord } from "@rcffuta/ict-lib";
import { CheckCircle } from "lucide-react";


type Props = {
    voteConfig: VoteCofigType[];
    onClick: (index: number) => void;
    currentCategoryIndex: number;
    // votes: VoteRecord[];
};


export default function CategoryNavigation(props: Props) {
    const {
        currentCategoryIndex,
        onClick,
        voteConfig,
        // votes
    } = props;
    return (
        <div className="mb-8">
            <h3 className="text-2xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-6 text-center">
                Award Categories
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voteConfig.map((category, index) => {
                    const vote = voteStore.getVoteForCategory(category.id);
                    return (
                        <button
                            key={category.id}
                            className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${
                      index === currentCategoryIndex
                          ? "border-champagne-gold-400 bg-champagne-gold-50/50 dark:bg-champagne-gold-900/20"
                          : "border-pearl-200 dark:border-pearl-700"
                  }
                  ${
                      vote
                          ? "bg-success-50/50 dark:bg-success-900/20 border-success-200"
                          : ""
                  }
                `}
                            onClick={() => onClick(index)}
                        >
                            <div className="flex items-start">
                                {vote && (
                                    <CheckCircle className="w-5 h-5 text-champagne-gold-300 mr-2 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <span
                                        className={`
                                                text-sm font-medium
                    ${
                        index === currentCategoryIndex
                            ? "text-champagne-gold-700 dark:text-champagne-gold-300"
                            : "text-pearl-600 dark:text-pearl-300"
                    }
                    ${vote ? "text-success-700 dark:text-success-300" : ""}
                                                `}
                                    >
                                        {category.name}
                                    </span>
                                    <span className="text-xs text-pearl-500 line-clamp-2">
                                        {category.description}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
