// components/voting/ContestantCards.tsx
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { CheckCircle, Download, Users, User } from "lucide-react";

export const IndividualContestantCard = observer(
    ({
        contestant,
        selected,
        onSelect,
        canDownload = false,
    }: {
        contestant: any;
        selected: boolean;
        onSelect: () => void;
        canDownload?: boolean;
    }) => {
        const downloadImage = async () => {
            try {
                const link = document.createElement("a");
                link.href = contestant.picture;
                link.download = `${contestant.firstname}_${contestant.lastname}_nominee.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Failed to download image:", error);
            }
        };

        return (
            <div
                className={`
        relative rounded-3xl p-6 transition-all duration-300 transform cursor-pointer
        border-2 ${
            selected
                ? "border-champagne-gold-400 shadow-golden-glow scale-[1.02]"
                : "border-pearl-200 dark:border-pearl-700 hover:border-champagne-gold-300"
        }
        group
        bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80
        backdrop-blur-sm hover:shadow-elevated
      `}
                onClick={onSelect}
            >
                {/* Selection indicator */}
                {selected && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-success text-white rounded-full p-2 shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                )}

                {/* Download button */}
                {canDownload && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadImage();
                            }}
                            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                            title="Download contestant image"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Contestant Image */}
                <div className="relative mx-auto mb-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-champagne-gold-300 shadow-golden-glow">
                    <img
                        src={contestant.picture}
                        alt={`${contestant.firstname} ${contestant.lastname}`}
                        className="w-full h-full object-cover"
                        // fill
                    />
                </div>

                {/* Contestant Info */}
                <div className="text-center">
                    <h3 className="text-xl font-luxury font-semibold text-pearl-800 dark:text-pearl-100 mb-2">
                        {contestant.firstname} {contestant.lastname}
                    </h3>

                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <span
                            className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${
                contestant.isWorker
                    ? "bg-glass-warm text-pearl-700 dark:text-pearl-200"
                    : "bg-pearl-100/50 text-pearl-600 dark:bg-pearl-800/50 dark:text-pearl-300"
            }
          `}
                        >
                            {contestant.isWorker ? (
                                <>
                                    <Users className="w-3 h-3 mr-1" />
                                    {contestant.unit || "Worker"}
                                </>
                            ) : (
                                <>
                                    <User className="w-3 h-3 mr-1" />
                                    Non-Worker
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);

export const GroupContestantCard = observer(
    ({
        contestants,
        selected,
        onSelect,
        canDownload = false,
    }: {
        contestants: any[];
        selected: boolean;
        onSelect: () => void;
        canDownload?: boolean;
    }) => {
        const downloadImage = async () => {
            try {
                console.log(
                    "Download group image for:",
                    contestants.map((c) => c.firstname).join(", ")
                );
            } catch (error) {
                console.error("Failed to download image:", error);
            }
        };

        return (
            <div
                className={`
        relative rounded-3xl p-6 transition-all duration-300 transform cursor-pointer
        border-2 ${
            selected
                ? "border-champagne-gold-400 shadow-golden-glow scale-[1.02]"
                : "border-pearl-200 dark:border-pearl-700 hover:border-champagne-gold-300"
        }
        group
        bg-gradient-to-br from-white/95 to-rose-50/30 dark:from-luxury-900/95 dark:to-luxury-800/80
        backdrop-blur-sm hover:shadow-elevated
      `}
                onClick={onSelect}
            >
                {/* Selection indicator */}
                {selected && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-success text-white rounded-full p-2 shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                )}

                {/* Download button */}
                {canDownload && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadImage();
                            }}
                            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                            title="Download group image"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Group Images */}
                <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3 mx-auto w-fit">
                        {contestants.map((contestant) => (
                            <div key={contestant.id} className="relative">
                                <div className="w-20 h-20 relative mx-auto mb-4 overflow-hidden border-2 border-champagne-gold-300 shadow-golden-glow">
                                    <Image
                                        src={contestant.picture}
                                        alt={`${contestant.firstname} ${contestant.lastname}`}
                                        className="w-full h-full object-cover"
                                        fill
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group Info */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-pearl-800 dark:text-pearl-100 mb-2">
                        {contestants
                            .map((c) => `${c.firstname} ${c.lastname}`)
                            .join(", ")}
                    </h3>

                    <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pearl-100/50 text-pearl-600 dark:bg-pearl-800/50 dark:text-pearl-300">
                            <Users className="w-3 h-3 mr-1" />
                            {contestants.length} Members
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);
