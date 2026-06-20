import React, { forwardRef, useId, useState } from "react";

type BaseProps = {
    name: string;
    label: string;
    hint?: string;
    error?: string; // string message to show
    icon?: React.ReactNode; // left icon
    prefix?: string; // e.g. "+234"
    maxLength?: number;
    textarea?: boolean;
    rows?: number;
    className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<
    HTMLInputElement | HTMLTextAreaElement,
    BaseProps
>(
    (
        {
            name,
            label,
            hint,
            error,
            icon,
            prefix,
            maxLength,
            textarea,
            rows = 4,
            className,
            ...inputProps
        },
        ref
    ) => {
        const autoId = useId();
        const id = inputProps.id ?? `${name}-${autoId}`;
        const describedByIds: string[] = [];
        if (hint) describedByIds.push(`${id}-hint`);
        if (error) describedByIds.push(`${id}-error`);

        const leftPad = prefix ? "pl-16" : icon ? "pl-12" : "pl-4";

        return (
            <div className={`w-full ${className ?? ""}`}>
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-medium text-pearl-700 dark:text-pearl-200"
                >
                    {label}
                    {inputProps.required && (
                        <span className="ml-1 text-rose-gold-500">*</span>
                    )}
                </label>

                <div
                    className={[
                        "relative rounded-xl border bg-white/70 dark:bg-luxury-800/70",
                        error
                            ? "border-red-400 focus-within:border-red-500"
                            : "border-pearl-300 dark:border-pearl-600 focus-within:border-champagne-gold",
                    ].join(" ")}
                >
                    {/* Left icon (non-interactive) */}
                    {icon && (
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-y-0 left-3 flex items-center text-pearl-400 ${
                                prefix ? "left-12" : ""
                            }`}
                        >
                            {icon}
                        </span>
                    )}

                    {/* Prefix (e.g. +234) */}
                    {prefix && (
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-3 flex items-center rounded-l-xl bg-pearl-100/60 px-2 text-xs font-semibold text-pearl-700 dark:bg-pearl-800/40 dark:text-pearl-200"
                        >
                            {prefix}
                        </span>
                    )}

                    {/* The actual control */}
                    {textarea ? (
                        <textarea
                            ref={ref as React.Ref<HTMLTextAreaElement>}
                            id={id}
                            name={name}
                            rows={rows}
                            maxLength={maxLength}
                            aria-invalid={!!error || undefined}
                            aria-describedby={
                                describedByIds.join(" ") || undefined
                            }
                            className={`block w-full resize-y bg-transparent py-3 pr-12 ${leftPad} text-pearl-900 placeholder:text-pearl-400 outline-none dark:text-pearl-100`}
                            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                    ) : (
                        <input
                            ref={ref as React.Ref<HTMLInputElement>}
                            id={id}
                            name={name}
                            maxLength={maxLength}
                            aria-invalid={!!error || undefined}
                            aria-describedby={
                                describedByIds.join(" ") || undefined
                            }
                            className={`block w-full bg-transparent py-3 pr-12 ${leftPad} text-pearl-900 placeholder:text-pearl-400 outline-none dark:text-pearl-100`}
                            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
                        />
                    )}
                </div>

                {/* Hint & error (assistive tech friendly) */}
                {hint && !error && (
                    <p
                        id={`${id}-hint`}
                        className="mt-1 text-xs text-pearl-500"
                    >
                        {hint}
                    </p>
                )}
                {error && (
                    <p
                        id={`${id}-error`}
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </p>
                )}

                {/* Char counter */}
                {maxLength && (
                    <div
                        className="mt-1 text-right text-xs text-pearl-400"
                        aria-live="polite"
                    >
                        {/* You can compute length outside with RHF if needed */}
                    </div>
                )}
            </div>
        );
    }
);

TextField.displayName = "TextField";


export const PasswordField = forwardRef<
    HTMLInputElement,
    Omit<BaseProps, "type" | "textarea">
>(({ icon, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const type = show ? "text" : "password";

    return (
        <div className="relative">
            <TextField ref={ref} {...props} type={type} icon={icon} />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute right-3 top-9 -translate-y-1/2 rounded-md p-1 text-pearl-500 hover:bg-pearl-100/60 dark:hover:bg-pearl-800/40"
            >
                {show ? (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M12 6c5 0 9 6 9 6s-4 6-9 6s-9-6-9-6s4-6 9-6m0 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8"
                        />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M2 5.27L3.28 4L20 20.72L18.73 22l-2.46-2.46A11.74 11.74 0 0 1 12 18c-5 0-9-6-9-6a19.77 19.77 0 0 1 5.32-5.18zM12 6c5 0 9 6 9 6a19.64 19.64 0 0 1-3.52 4.14L15.9 14.56A4 4 0 0 0 9.43 8.1L7.86 6.53A11.6 11.6 0 0 1 12 6Z"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
});
PasswordField.displayName = "PasswordField";
