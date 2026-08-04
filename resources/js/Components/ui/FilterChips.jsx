import React from 'react';

/**
 * FilterChips — shared pill-style filter bar
 *
 * Props:
 *   options     — array of { label, value } objects
 *   value       — currently active value ('' = All)
 *   onChange    — (value) => void
 *   allLabel    — label for the "all" chip (default "All")
 *   className   — extra wrapper classes
 */
export default function FilterChips({
    options = [],
    value = '',
    onChange,
    allLabel = 'All',
    className = '',
}) {
    if (!options || options.length === 0) return null;

    const activeBase  = 'bg-brand-600 text-white border-brand-600';
    const inactiveBase = 'bg-neutral-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400';

    return (
        <div className={`flex items-center gap-2 flex-wrap pb-1 ${className}`}>
            {/* All chip */}
            <button
                type="button"
                onClick={() => onChange('')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 select-none whitespace-nowrap ${
                    value === '' ? activeBase : inactiveBase
                }`}
            >
                {allLabel}
            </button>

            {options.map((opt) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                return (
                    <button
                        key={optValue}
                        type="button"
                        onClick={() => onChange(optValue)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 select-none whitespace-nowrap ${
                            value === optValue ? activeBase : inactiveBase
                        }`}
                    >
                        {optLabel}
                    </button>
                );
            })}
        </div>
    );
}
