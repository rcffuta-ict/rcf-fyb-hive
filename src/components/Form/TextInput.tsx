import {
    Eye,
    EyeOff,
    Mail,
    Phone,
    User,
    X,
    Check,
    Lock,
    Hash,
    Calendar,
    MapPin,
    BookOpen,
    Heart,
} from "lucide-react";
import { FormElement } from "./form.interface";
import { ReactNode, useState } from "react";

interface TextInputProps extends FormElement {
    name: string;
    label: string;
    placeholder?: string;
    email?: boolean;
    tel?: boolean;
    password?: boolean;
    number?: boolean;
    date?: boolean;
    textarea?: boolean;
    maxLength?: number;
    toUpperCase?: boolean;
    icon?: React.ReactNode;
    rows?: number;
}

export function TextInput(props: TextInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    // Determine input type and icon
    let type = "text";
    let IconComponent: ReactNode = props.icon;

    if (props.email) {
        type = "email";
        IconComponent = <Mail/>;
    } else if (props.tel) {
        type = "tel";
        // IconComponent = <Phone/>;
    } else if (props.password) {
        type = showPassword ? "text" : "password";
        IconComponent = <Lock/>;
    } else if (props.number) {
        type = "number";
        IconComponent = <Hash/>;
    } else if (props.date) {
        type = "date";
        IconComponent = <Calendar/>;
    }

    const hasError = revealError();
    const value = props.getValue(props.name) as string;
    const hasValue = Boolean(value);
    const isDisabled = props.disable;

    // Calculate textarea height
    const textareaHeight = props.rows ? props.rows * 24 : 100;

    return (
        <div className="group relative animate-fade-in">
            <label
                htmlFor={props.name}
                className={`block mb-3 font-elegant text-sm font-medium transition-colors duration-300 ${
                    hasError
                        ? "text-error"
                        : isDisabled
                        ? "text-pearl-400"
                        : "text-pearl-700 dark:text-pearl-200"
                }`}
            >
                {props.label}
                {props.required && (
                    <span className="text-rose-gold-500 ml-1">*</span>
                )}
            </label>

            <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Input Container */}
                <div
                    className={`
                        relative overflow-hidden rounded-2xl border-2 transition-all duration-400 ease-romantic
                        backdrop-blur-sm
                        ${
                            isFocused
                                ? "border-champagne-gold shadow-golden-glow bg-glass-gold/20"
                                : hasError
                                ? "border-error/70 shadow-rose-glow bg-error-light/10"
                                : "border-pearl-200/70 dark:border-pearl-600/50 bg-glass-warm"
                        }
                        ${
                            isDisabled
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:border-champagne-gold/60 hover:shadow-soft cursor-text"
                        }
                        ${hasValue && !hasError ? "border-success/50" : ""}
                    `}
                >
                    {/* Animated Background Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-champagne-gold-30/10 to-transparent animate-shimmer" />
                    </div>

                    {/* Phone Number Prefix */}
                    {props.tel && (
                        <div className="absolute left-0 top-0 h-full flex items-center px-4 bg-champagne-gold/15 border-r border-champagne-gold/30 text-champagne-gold font-semibold text-sm">
                            +234
                        </div>
                    )}

                    {/* Icon */}
                    <div
                        className={`
                        absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300
                        ${
                            isFocused
                                ? "text-champagne-gold scale-110"
                                : "text-pearl-400"
                        }
                        ${hasError ? "text-error" : ""}
                        ${hasValue && !hasError ? "text-success" : ""}
                        ${props.tel ? "left-16" : ""}
                        ${props.textarea ? "top-6 translate-y-0" : ""}
                    `}
                    >
                        {IconComponent}
                    </div>

                    {/* Input/Textarea */}
                    {props.textarea ? (
                        <textarea
                            id={props.name}
                            placeholder={props.placeholder}
                            disabled={isDisabled}
                            maxLength={props.maxLength || 1000}
                            value={value || ""}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => {
                                props.onChange(props.name, e.target.value);
                            }}
                            rows={props.rows || 4}
                            className={`
                                w-full bg-transparent border-none outline-none font-modern 
                                text-pearl-800 dark:text-pearl-100 resize-none
                                ${props.tel ? "pl-20" : "pl-12"} 
                                pr-12 py-4 placeholder:text-pearl-400/70
                                ${props.toUpperCase ? "uppercase" : ""}
                                disabled:cursor-not-allowed
                                scrollbar-thin scrollbar-thumb-pearl-300 scrollbar-track-transparent
                            `}
                            style={{ minHeight: textareaHeight }}
                        />
                    ) : (
                        <input
                            id={props.name}
                            type={type}
                            placeholder={props.placeholder}
                            disabled={isDisabled}
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
                                w-full h-14 bg-transparent border-none outline-none font-modern 
                                text-pearl-800 dark:text-pearl-100
                                ${props.tel ? "pl-20" : "pl-12"} 
                                pr-12 placeholder:text-pearl-400/70
                                ${props.toUpperCase ? "uppercase" : ""}
                                disabled:cursor-not-allowed
                            `}
                        />
                    )}

                    {/* Action Buttons Container */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        {/* Password Toggle */}
                        {props.password && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isDisabled}
                                className="p-1.5 rounded-lg transition-all duration-300 hover:bg-champagne-gold/20 hover:text-champagne-gold disabled:cursor-not-allowed"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        )}

                        {/* Clear Button */}
                        {!props.password && hasValue && !isDisabled && (
                            <button
                                type="button"
                                onClick={() => props.onChange(props.name, "")}
                                className="p-1.5 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-error/20 hover:text-error"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Success Checkmark */}
                        {hasValue && !hasError && !isDisabled && (
                            <div className="text-success animate-scale-in">
                                <Check size={18} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Character Count */}
                {props.maxLength && hasValue && (
                    <div className="absolute -bottom-6 right-0 text-xs text-pearl-400 font-medium">
                        {value.length}/{props.maxLength}
                    </div>
                )}

                {/* Floating Label Animation */}
                {hasValue && isFocused && (
                    <div className="absolute -top-2 left-3 px-2 bg-white dark:bg-luxury-800 text-xs text-champagne-gold font-medium animate-fade-in">
                        {props.label}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {hasError && (
                <div className="mt-3 flex items-center space-x-2 text-error animate-slide-down">
                    <div className="w-1.5 h-1.5 bg-error rounded-full animate-pulse-romantic" />
                    <span className="text-sm font-medium">{hasError}</span>
                </div>
            )}

            {/* Helper Text */}
            {!hasError && props.placeholder && !hasValue && (
                <p className="mt-2 text-xs text-pearl-400/70 italic">
                    {props.placeholder}
                </p>
            )}
        </div>
    );
}

// Additional specialized input components using the base TextInput
export function EmailInput(props: Omit<TextInputProps, "email">) {
    return <TextInput {...props} email />;
}

export function PhoneInput(props: Omit<TextInputProps, "tel">) {
    return <TextInput {...props} tel />;
}

export function PasswordInput(props: Omit<TextInputProps, "password">) {
    return <TextInput {...props} password />;
}

export function NumberInput(props: Omit<TextInputProps, "number">) {
    return <TextInput {...props} number />;
}

export function DateInput(props: Omit<TextInputProps, "date">) {
    return <TextInput {...props} date />;
}

export function TextAreaInput(props: Omit<TextInputProps, "textarea">) {
    return <TextInput {...props} textarea />;
}
