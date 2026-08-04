import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select — styled <select> matching the Input component design system.
 *
 * Props: same API as Input (label, error, helperText, required, id, ...rest)
 */
export default function Select({
    label,
    error,
    helperText,
    id,
    required = false,
    className = '',
    children,
    ...props
}) {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-neutral-700"
                >
                    {label} {required && <span className="text-danger-500">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    className={`w-full appearance-none text-base px-3.5 py-2.5 pr-10 rounded-sm border bg-neutral-0 text-neutral-900 transition-colors focus:outline-none focus:ring-2 ${
                        error
                            ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
                            : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500'
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                />
            </div>
            {error ? (
                <p className="text-xs text-danger-700 mt-1">{error}</p>
            ) : helperText ? (
                <p className="text-xs text-neutral-500 mt-1">{helperText}</p>
            ) : null}
        </div>
    );
}
