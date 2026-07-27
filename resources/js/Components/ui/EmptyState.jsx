import React from 'react';
import Button from '@/Components/ui/Button';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
    icon: Icon = FolderOpen,
    title = 'No records found',
    description = 'Get started by creating your first entry.',
    actionLabel,
    onAction,
    className = '',
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-neutral-200 rounded-md shadow-xs ${className}`}
        >
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-md font-semibold text-neutral-900 mb-1">{title}</h3>
            <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button variant="primary" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
