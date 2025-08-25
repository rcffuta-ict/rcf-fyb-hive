import { Check } from "lucide-react";
import { FormElement } from "./form.interface";

interface CheckInputProps extends FormElement {
    name: string;
    label: string;
    className?: string;
    options: {
        id: string;
        label: string;
        icon?: React.ReactNode;
        value: string | boolean;
        disable?: boolean;
    }[];
}

export function CheckInput({
    name,
    label,
    options,
    error,
    getValue,
    onChange,
    disable,
    className,
}: CheckInputProps) {
    const currentValue = getValue(name);
    const hasError = Boolean(error);

    return (
        <fieldset className={`animate-fade-in ${className || ""}`}>
            {/* Legend */}
            <legend className="mb-4 font-elegant text-sm font-medium text-champagne-gold dark:text-champagne-gold-200">
                {label}
            </legend>

            {/* Options */}
            <div className="space-y-3">
                {options.map((item) => {
                    const isSelected = currentValue === item.value;
                    const isDisabled = item.disable || disable;

                    return (
                        <label
                            key={item.id}
                            htmlFor={item.id}
                            className={`
                relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all
                ${
                    isSelected
                        ? "border-champagne-gold bg-champagne-gold/10 shadow-golden-glow"
                        : hasError
                        ? "border-error/40 hover:border-error"
                        : "border-pearl-300 dark:border-pearl-700 hover:border-champagne-gold/40"
                }
                ${
                    isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-soft"
                }
              `}
                        >
                            {/* Radio */}
                            <input
                                type="radio"
                                id={item.id}
                                name={name}
                                value={item.value.toString()}
                                onChange={() =>
                                    !isDisabled && onChange(name, item.value)
                                }
                                checked={isSelected}
                                disabled={isDisabled}
                                className="sr-only"
                            />

                            {/* Custom Circle */}
                            <span
                                className={`
                  relative w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center
                  ${
                      isSelected
                          ? "border-champagne-gold bg-champagne-gold"
                          : "border-pearl-300 dark:border-pearl-600"
                  }
                `}
                            >
                                {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                )}
                            </span>

                            {/* Optional Icon */}
                            {item.icon && (
                                <span
                                    className={`mr-3 text-lg ${
                                        isSelected
                                            ? "text-champagne-gold"
                                            : "text-pearl-400 group-hover:text-champagne-gold"
                                    }`}
                                >
                                    {item.icon}
                                </span>
                            )}

                            {/* Label */}
                            <span
                                className={`font-medium capitalize transition-colors ${
                                    isSelected
                                        ? "text-champagne-gold"
                                        : "text-pearl-700 dark:text-pearl-200"
                                }`}
                            >
                                {item.label}
                            </span>

                            {/* Check Icon */}
                            {isSelected && (
                                <Check
                                    className="ml-auto text-champagne-gold"
                                    size={20}
                                />
                            )}
                        </label>
                    );
                })}
            </div>

            {/* Error */}
            {hasError && (
                <p className="mt-3 text-sm text-error flex items-center gap-2 animate-slide-down">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    {hasError}
                </p>
            )}
        </fieldset>
    );
}
