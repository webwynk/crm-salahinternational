import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none whitespace-nowrap flex-nowrap shrink-0';

    const variants = {
        primary:   'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-xs focus:ring-brand-500',
        secondary: 'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 focus:ring-neutral-400',
        outline:   'border border-neutral-300 bg-neutral-0 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 shadow-xs focus:ring-brand-500',
        ghost:     'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus:ring-neutral-400',
        danger:    'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-xs focus:ring-danger-500',
        link:      'bg-transparent text-brand-600 hover:text-brand-700 hover:underline p-0 focus:ring-0 shadow-none',
    };

    const sizes = {
        sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
        md: 'text-sm px-4 py-2 gap-2 h-10',
        lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
    };

    const isButtonDisabled = disabled || isLoading;

    return (
        <button
            type={type}
            disabled={isButtonDisabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : null}
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">{children}</span>
        </button>
    );
}
