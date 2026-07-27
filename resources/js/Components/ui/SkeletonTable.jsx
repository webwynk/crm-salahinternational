import React from 'react';

export function SkeletonRow({ cols = 5 }) {
    return (
        <tr className="animate-pulse border-b border-neutral-200">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3.5">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </td>
            ))}
        </tr>
    );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center animate-pulse">
                <div className="h-8 bg-neutral-200 rounded w-64"></div>
                <div className="h-8 bg-neutral-200 rounded w-24"></div>
            </div>
            <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-4 py-3">
                                <div className="h-3 bg-neutral-200 rounded w-20 animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonRow key={i} cols={cols} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
