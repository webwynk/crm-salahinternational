import React from 'react';

export default function Input({
    label,
    error,
    helperText,
    id,
    type = 'text',
    className = '',
    required = false,
    ...props
}) {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-neutral-700"
                >
                    {label} {required && <span className="text-danger-500">*</span>}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={`w-full text-base px-3.5 py-2.5 rounded-sm border bg-white text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                    error
                        ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500 animate-shake'
                        : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500'
                } ${className}`}
                {...props}
            />
            {error ? (
                <p className="text-xs text-danger-700 mt-1">{error}</p>
            ) : helperText ? (
                <p className="text-xs text-neutral-500 mt-1">{helperText}</p>
            ) : null}
        </div>
    );
}
