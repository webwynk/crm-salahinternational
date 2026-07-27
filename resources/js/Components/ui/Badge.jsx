import React from 'react';

export default function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    className = '',
}) {
    const variants = {
        success: 'bg-success-50 text-success-700 border border-success-500/20',
        warning: 'bg-warning-50 text-warning-700 border border-warning-500/20',
        danger: 'bg-danger-50 text-danger-700 border border-danger-500/20',
        info: 'bg-info-50 text-info-700 border border-info-500/20',
        neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
        brand: 'bg-brand-50 text-brand-700 border border-brand-200',
    };

    const sizes = {
        sm: 'text-[11px] px-2 py-0.5 rounded-sm',
        md: 'text-xs px-2.5 py-1 rounded-sm font-medium',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </span>
    );
}
