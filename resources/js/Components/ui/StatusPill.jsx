import React from 'react';

/**
 * StatusPill — Enterprise semantic status indicator pill.
 */
export default function StatusPill({ status, variant, className = '' }) {
    const statusMap = {
        ACTIVE: { variant: 'success', label: 'Active' },
        INACTIVE: { variant: 'danger', label: 'Inactive' },
        ASSIGNED: { variant: 'brand', label: 'Assigned' },
        IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
        COMPLETED: { variant: 'success', label: 'Completed' },
        CANCELLED: { variant: 'danger', label: 'Cancelled' },
        LOW_STOCK: { variant: 'danger', label: 'Low Stock' },
        HEALTHY: { variant: 'success', label: 'Healthy' },
    };

    const config = statusMap[status] || { variant: variant || 'neutral', label: status };

    const variants = {
        success: 'bg-success-50 text-success-700 border-success-500/30',
        warning: 'bg-warning-50 text-warning-700 border-warning-500/30',
        danger:  'bg-danger-50 text-danger-700 border-danger-500/30',
        brand:   'bg-brand-50 text-brand-700 border-brand-200',
        info:    'bg-info-50 text-info-700 border-info-200',
        neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[config.variant]} ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
            {config.label}
        </span>
    );
}
