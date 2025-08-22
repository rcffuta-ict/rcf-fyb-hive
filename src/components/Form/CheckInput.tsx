import { Check } from "lucide-react";
import { FormElement } from "./form.interface";

interface CheckInputProps extends FormElement {
    name: string;
    label: string;
    className?: string;
    options: {
        id: string;
        label: string;
        icon?: string;
        value: string | boolean;
        disable?: boolean;
    }[];
}

export function CheckInput(props: CheckInputProps) {
    function revealError() {
        if (!props.error) return;
        if (!props.error[props.name]) return;
        return props.error[props.name];
    }

    const hasError = revealError();
    const currentValue = props.getValue(props.name);

    return (
        <fieldset className={`group animate-fade-in ${props.className || ""}`}>
            <legend className="mb-4 font-elegant text-sm font-medium text-champagne-gold dark:text-champagne-gold-200">
                {props.label}
            </legend>

            <div className="space-y-3">
                {props.options.map((item, index) => {
                    const isSelected = currentValue === item.value;
                    const isDisabled = item.disable || props.disable;

                    return (
                        <label
                            key={item.id}
                            htmlFor={item.id}
                            className={`
                group/option relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-400 ease-romantic
                ${
                    isSelected
                        ? "border-champagne-gold bg-champagne-gold/10 shadow-golden-glow"
                        : hasError
                        ? "border-error/30 hover:border-error"
                        : "border-pearl-200 dark:border-pearl-700 hover:border-champagne-gold/50"
                }
                ${
                    isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-soft hover:scale-[1.02]"
                }
                ${isSelected ? "animate-glow-pulse" : ""}
              `}
                        >
                            {/* Radio Input */}
                            <input
                                type="radio"
                                name={props.name}
                                id={item.id}
                                value={
                                    props.disable
                                        ? "false"
                                        : item.value.toString()
                                }
                                onChange={() =>
                                    !props.disable &&
                                    props.onChange(
                                        props.name,
                                        props.disable ? false : item.value
                                    )
                                }
                                checked={!props.disable && isSelected}
                                disabled={isDisabled}
                                className="sr-only"
                            />

                            {/* Custom Radio Button */}
                            <div
                                className={`
                relative w-6 h-6 rounded-full border-2 transition-all duration-300 mr-4
                ${
                    isSelected
                        ? "border-champagne-gold bg-champagne-gold"
                        : "border-pearl-300 dark:border-pearl-600 group-hover/option:border-champagne-gold"
                }
              `}
                            >
                                {isSelected && (
                                    <div className="absolute inset-1 rounded-full bg-white animate-scale-in" />
                                )}

                                {/* Shimmer effect for selected */}
                                {isSelected && (
                                    <div className="absolute inset-0 rounded-full bg-shimmer-gold bg-[length:200%_100%] opacity-30 animate-shimmer" />
                                )}
                            </div>

                            {/* Icon */}
                            {item.icon && (
                                <div
                                    className={`
                  mr-3 text-lg transition-colors duration-300
                  ${
                      isSelected
                          ? "text-champagne-gold"
                          : "text-pearl-400 group-hover/option:text-champagne-gold"
                  }
                `}
                                >
                                    {item.icon}
                                </div>
                            )}

                            {/* Label */}
                            <span
                                className={`
                font-modern font-medium transition-colors duration-300 capitalize
                ${
                    isSelected
                        ? "text-champagne-gold"
                        : "text-pearl-700 dark:text-pearl-200 group-hover/option:text-champagne-gold"
                }
              `}
                            >
                                {item.label}
                            </span>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="ml-auto text-champagne-gold animate-scale-in">
                                    <Check size={20} />
                                </div>
                            )}

                            {/* Hover Glow Effect */}
                            <div
                                className={`
                absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none
                ${
                    isSelected
                        ? "bg-champagne-gold/5 opacity-100"
                        : "bg-champagne-gold/5 opacity-0 group-hover/option:opacity-100"
                }
              `}
                            />
                        </label>
                    );
                })}
            </div>

            {/* Error Message */}
            {hasError && (
                <div className="mt-3 flex items-center space-x-2 text-error animate-slide-down">
                    <div className="w-1.5 h-1.5 bg-error rounded-full animate-pulse-romantic" />
                    <span className="text-sm font-medium">{hasError}</span>
                </div>
            )}
        </fieldset>
    );
}