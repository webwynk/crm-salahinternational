import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Alert({
    title,
    children,
    variant = 'info',
    onClose,
    className = '',
}) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-success-700 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-warning-700 shrink-0" />,
        danger: <AlertCircle className="w-5 h-5 text-danger-700 shrink-0" />,
        info: <Info className="w-5 h-5 text-info-700 shrink-0" />,
    };

    const variants = {
        success: 'bg-success-50 border-success-500/30 text-success-700',
        warning: 'bg-warning-50 border-warning-500/30 text-warning-700',
        danger: 'bg-danger-50 border-danger-500/30 text-danger-700',
        info: 'bg-info-50 border-info-500/30 text-info-700',
    };

    return (
        <div
            className={`p-4 rounded-md border text-sm flex items-start gap-3 relative ${variants[variant]} ${className}`}
        >
            {icons[variant]}
            <div className="flex-1">
                {title && <h5 className="font-semibold mb-1">{title}</h5>}
                <div>{children}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-neutral-500 hover:text-neutral-700 p-0.5 rounded focus:outline-none"
                    aria-label="Dismiss alert"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
