import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select — styled <select> matching the Input component design system.
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - label, error, helperText, required, id, className, children, ...props
 */
export default function Select({
    label,
    error,
    helperText,
    id,
    size = 'md',
    required = false,
    className = '',
    children,
    ...props
}) {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    const sizeClasses = {
        sm: 'text-xs h-8.5 px-2.5 py-1 pr-7 leading-normal rounded-md',
        md: 'text-sm h-10 px-3.5 py-2 pr-10 leading-normal rounded-sm',
        lg: 'text-base h-12 px-4 py-2.5 pr-10 leading-normal rounded-sm',
    };

    const iconSizes = {
        sm: 'right-2 w-3.5 h-3.5',
        md: 'right-3 w-4 h-4',
        lg: 'right-3.5 w-4.5 h-4.5',
    };

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
            <div className="relative flex items-center">
                <select
                    id={selectId}
                    className={`w-full appearance-none border bg-white text-neutral-900 transition-colors focus:outline-none focus:ring-2 ${
                        sizeClasses[size] || sizeClasses.md
                    } ${
                        error
                            ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
                            : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500'
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none ${
                        iconSizes[size] || iconSizes.md
                    }`}
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
