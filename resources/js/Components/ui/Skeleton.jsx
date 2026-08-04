import React from 'react';

export function SkeletonLine({ className = 'h-4 w-full' }) {
    return <div className={`bg-neutral-200 animate-pulse rounded ${className}`} />;
}

export function SkeletonBlock({ className = 'h-24 w-full' }) {
    return <div className={`bg-neutral-200 animate-pulse rounded-md ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="bg-neutral-0 border border-neutral-200 rounded-md p-5 space-y-3 shadow-xs">
            <SkeletonLine className="h-3 w-1/3" />
            <SkeletonLine className="h-7 w-1/2" />
        </div>
    );
}

export function SkeletonTable({ cols = 5, rows = 6 }) {
    return (
        <div className="bg-neutral-0 border border-neutral-200 rounded-md overflow-hidden shadow-xs">
            <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                <SkeletonLine className="h-9 w-64 rounded-md" />
                <SkeletonLine className="h-8 w-24 rounded-md" />
            </div>
            <div className="divide-y divide-neutral-200">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="p-4 flex items-center gap-4">
                        {Array.from({ length: cols }).map((_, c) => (
                            <SkeletonLine key={c} className={`h-4 flex-1 ${c === 0 ? 'w-1/3 font-semibold' : ''}`} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
