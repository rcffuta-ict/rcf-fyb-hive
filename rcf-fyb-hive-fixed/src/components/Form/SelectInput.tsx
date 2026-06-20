import { X } from "lucide-react";
import { useState } from "react";

interface SelectInputProps {
    name: string;
    label: string;
    placeholder?: string;
    tag?: boolean;
}

export function SelectInput(props: SelectInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    const predefinedHobbies = [
        "Reading",
        "Gaming",
        "Cooking",
        "Traveling",
        "Music",
        "Sports",
        "Art",
        "Photography",
    ];

    const filteredHobbies = predefinedHobbies.filter(
        (hobby) =>
            !selectedTags.includes(hobby) &&
            hobby.toLowerCase().includes(inputValue.toLowerCase())
    );

    const addTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            const newTags = [...selectedTags, tag];
            setSelectedTags(newTags);
            setInputValue("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue.trim());
        } else if (
            e.key === "Backspace" &&
            !inputValue &&
            selectedTags.length > 0
        ) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className="group relative animate-fade-in">
            <label
                htmlFor={props.name}
                className="block mb-2 font-elegant text-sm font-medium text-pearl-700 dark:text-pearl-200 transition-colors duration-300"
            >
                {props.label}
            </label>

            <div className="relative">
                {/* Main Container */}
                <div
                    className={`
          relative overflow-hidden rounded-2xl border-2 transition-all duration-400 ease-romantic min-h-14
          ${
              isOpen
                  ? "border-champagne-gold shadow-golden-glow bg-glass-warm backdrop-blur-md"
                  : "border-pearl-200 dark:border-pearl-700 bg-glass-warm backdrop-blur-sm"
          }
          hover:border-champagne-gold/50 hover:shadow-soft
        `}
                >
                    {/* Shimmer Effect */}
                    {isOpen && (
                        <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] opacity-20 animate-shimmer pointer-events-none" />
                    )}

                    {/* Selected Tags & Input */}
                    <div className="flex flex-wrap items-center gap-2 p-3">
                        {selectedTags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-champagne-gold text-white rounded-full text-sm font-medium animate-scale-in hover:bg-golden-600 transition-colors duration-300"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-error transition-colors duration-200"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}

                        <input
                            type="text"
                            placeholder={
                                selectedTags.length === 0
                                    ? props.placeholder ||
                                      "Select or type your hobbies"
                                    : ""
                            }
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            onBlur={() =>
                                setTimeout(() => setIsOpen(false), 150)
                            }
                            onKeyDown={handleInputKeyDown}
                            className="flex-1 min-w-32 bg-transparent border-none outline-none font-modern text-pearl-800 dark:text-pearl-100 placeholder:text-pearl-400"
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-glass-warm backdrop-blur-xl border border-white/20 rounded-2xl shadow-glass max-h-60 overflow-y-auto z-50 animate-slide-down">
                        {filteredHobbies.length > 0 ? (
                            filteredHobbies.map((hobby, index) => (
                                <button
                                    key={hobby}
                                    type="button"
                                    onMouseDown={() => addTag(hobby)}
                                    className={`
                    w-full px-4 py-3 text-left font-modern text-pearl-800 dark:text-pearl-100
                    hover:bg-champagne-gold/20 transition-colors duration-300
                    ${index === 0 ? "rounded-t-2xl" : ""}
                    ${
                        index === filteredHobbies.length - 1
                            ? "rounded-b-2xl"
                            : ""
                    }
                  `}
                                >
                                    {hobby}
                                </button>
                            ))
                        ) : inputValue.trim() ? (
                            <button
                                type="button"
                                onMouseDown={() => addTag(inputValue.trim())}
                                className="w-full px-4 py-3 text-left font-modern text-champagne-gold hover:bg-champagne-gold/20 transition-colors duration-300 rounded-2xl"
                            >
                                Add &quot;{inputValue.trim()}&quot;
                            </button>
                        ) : (
                            <div className="px-4 py-3 text-pearl-400 text-sm">
                                No options available
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}