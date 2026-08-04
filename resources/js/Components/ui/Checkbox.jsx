import React from 'react';

/**
 * Checkbox — styled checkbox matching the design system.
 *
 * Props:
 *   id       — input id (required for label association)
 *   label    — text label rendered beside the checkbox
 *   error    — validation error string
 *   checked  — controlled value
 *   onChange — change handler
 *   ...rest  — passed to the <input>
 */
export default function Checkbox({
    id,
    label,
    error,
    checked,
    onChange,
    className = '',
    ...props
}) {
    const inputId = id || Math.random().toString(36).substring(7);

    return (
        <div className={`space-y-1 ${className}`}>
            <div className="flex items-center gap-2.5">
                <input
                    type="checkbox"
                    id={inputId}
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 transition-colors cursor-pointer"
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-neutral-700 cursor-pointer select-none"
                    >
                        {label}
                    </label>
                )}
            </div>
            {error && <p className="text-xs text-danger-700 pl-6">{error}</p>}
        </div>
    );
}
