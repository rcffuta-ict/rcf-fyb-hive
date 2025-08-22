import { Eye, EyeOff, Mail, Phone, User, X, Check } from "lucide-react";
import { FormElement } from "./form.interface";
import { useState } from "react";

interface TextInputProps extends FormElement {
    name: string;
    label: string;
    placeholder?: string;
    email?: boolean;
    tel?: boolean;
    password?: boolean;
    maxLength?: number;
    toUpperCase?: boolean;
}

export function TextInput(props: TextInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    function revealError() {
        if (!props.error) return;
        if (!props.error[props.name]) return;
        return props.error[props.name] || "";
    }

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/[^\d]/g, "");
        const n = Number(digits);
        return n === 0 ? "" : n.toString();
    };

    let type = "text";
    let IconComponent = User;

    if (props.email) {
        type = "email";
        IconComponent = Mail;
    }
    if (props.tel) {
        type = "tel";
        IconComponent = Phone;
    }
    if (props.password) {
        type = showPassword ? "text" : "password";
    }

    const hasError = revealError();
    const value = props.getValue(props.name) as string;

    return (
        <div className="group relative animate-fade-in">
            <label
                htmlFor={props.name}
                className="block mb-2 font-elegant text-sm font-medium text-pearl-700 dark:text-pearl-200 transition-colors duration-300"
            >
                {props.label}
            </label>

            <div className="relative">
                {/* Input Field */}
                <div
                    className={`
          relative overflow-hidden rounded-2xl border-2 transition-all duration-400 ease-romantic
          ${
              isFocused
                  ? "border-champagne-gold shadow-golden-glow bg-glass-warm backdrop-blur-md"
                  : hasError
                  ? "border-error shadow-error-glow bg-error-light/5"
                  : "border-pearl-200 dark:border-pearl-700 bg-glass-warm backdrop-blur-sm"
          }
          ${
              props.disable
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-champagne-gold/50 hover:shadow-soft"
          }
        `}
                >
                    {/* Shimmer Effect */}
                    {isFocused && (
                        <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] opacity-20 animate-shimmer pointer-events-none" />
                    )}

                    {/* Phone Number Prefix */}
                    {props.tel && (
                        <div className="absolute left-0 top-0 h-full flex items-center px-4 bg-champagne-gold/10 border-r border-champagne-gold/20 text-champagne-gold font-semibold">
                            +234
                        </div>
                    )}

                    {/* Icon */}
                    {!props.tel && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pearl-400 transition-colors duration-300 group-focus-within:text-champagne-gold">
                            <IconComponent size={20} />
                        </div>
                    )}

                    {/* Input */}
                    <input
                        id={props.name}
                        type={type}
                        placeholder={props.placeholder}
                        disabled={props.disable}
                        maxLength={props.maxLength || 200}
                        value={value || ""}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            if (type === "email") {
                                props.onChange(
                                    props.name,
                                    inputValue.toLowerCase()
                                );
                            } else if (type === "tel") {
                                props.onChange(
                                    props.name,
                                    formatPhoneNumber(inputValue)
                                );
                            } else {
                                props.onChange(props.name, inputValue);
                            }
                        }}
                        className={`
              w-full h-14 bg-transparent border-none outline-none font-modern text-pearl-800 dark:text-pearl-100
              ${props.tel ? "pl-20" : "pl-12"} pr-12 placeholder:text-pearl-400
              ${props.toUpperCase ? "uppercase" : ""}
              disabled:cursor-not-allowed
            `}
                    />

                    {/* Password Toggle */}
                    {props.password && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={props.disable}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-pearl-400 hover:text-champagne-gold transition-colors duration-300 disabled:cursor-not-allowed"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    )}

                    {/* Clear Button */}
                    {!props.password && value && !props.disable && (
                        <button
                            type="button"
                            onClick={() => props.onChange(props.name, "")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-pearl-400 hover:text-error transition-colors duration-300 opacity-0 group-hover:opacity-100"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Character Count */}
                {props.maxLength && value && (
                    <div className="absolute -bottom-6 right-0 text-xs text-pearl-400 font-medium">
                        {value.length}/{props.maxLength}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {hasError && (
                <div className="mt-2 flex items-center space-x-2 text-error animate-slide-down">
                    <div className="w-1.5 h-1.5 bg-error rounded-full animate-pulse-romantic" />
                    <span className="text-sm font-medium">{hasError}</span>
                </div>
            )}

            {/* Success Indicator */}
            {!hasError && value && !props.disable && (
                <div className="absolute top-14 right-4 -translate-y-1/2 text-success animate-scale-in">
                    <Check size={18} />
                </div>
            )}
        </div>
    );
}
