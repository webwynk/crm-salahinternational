import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, RefreshCw } from 'lucide-react';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { SkeletonTable } from '@/Components/ui/SkeletonTable';

export default function DataTable({
    columns = [],
    data = [],
    pagination = null,
    isLoading = false,
    error = null,
    onRetry = null,
    search = '',
    onSearchChange = null,
    searchPlaceholder = 'Search...',
    filters = null,
    onClearFilters = null,
    activeSort = { column: null, direction: 'asc' },
    onSort = null,
    emptyTitle = 'No data available',
    emptyDescription = 'There are no records to display.',
    emptyActionLabel = null,
    onEmptyAction = null,
    renderRowActions = null,
}) {
    if (isLoading) {
        return <SkeletonTable cols={columns.length + (renderRowActions ? 1 : 0)} rows={6} />;
    }

    if (error) {
        return (
            <div className="bg-white border border-danger-500/30 rounded-md p-8 text-center space-y-4 shadow-xs">
                <p className="text-sm text-danger-700 font-medium">{error}</p>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Retry Loading
                    </Button>
                )}
            </div>
        );
    }

    const hasData = data && data.length > 0;
    const isFiltered = Boolean(search || (filters && Object.values(filters).some(Boolean)));

    return (
        <div className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-xs">
            {/* Filter & Search Header */}
            {(onSearchChange || filters) && (
                <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {onSearchChange && (
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full text-sm pl-9 pr-3.5 py-2 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>
                    )}

                    {isFiltered && onClearFilters && (
                        <Button variant="ghost" size="sm" onClick={onClearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}

            {/* Table Content */}
            {!hasData ? (
                isFiltered ? (
                    <div className="p-12 text-center">
                        <Filter className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                        <h4 className="text-md font-semibold text-neutral-900 mb-1">
                            No results found for "{search}"
                        </h4>
                        <p className="text-sm text-neutral-500 mb-4">
                            Try adjusting your search terms or clearing active filters.
                        </p>
                        {onClearFilters && (
                            <Button variant="outline" size="sm" onClick={onClearFilters}>
                                Reset Search Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        actionLabel={emptyActionLabel}
                        onAction={onEmptyAction}
                    />
                )
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key || col.accessor}
                                        onClick={() => col.sortable && onSort && onSort(col.accessor)}
                                        className={`px-4 py-3 select-none ${
                                            col.sortable ? 'cursor-pointer hover:bg-neutral-100' : ''
                                        } ${col.className || ''}`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>{col.header}</span>
                                            {col.sortable && (
                                                <span className="text-neutral-400">
                                                    {activeSort.column === col.accessor ? (
                                                        activeSort.direction === 'asc' ? (
                                                            <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                                                        ) : (
                                                            <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                                                        )
                                                    ) : (
                                                        <ChevronsUpDown className="w-3.5 h-3.5 opacity-60" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {renderRowActions && <th className="px-4 py-3 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                            {data.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    className="hover:bg-neutral-50/80 transition-colors"
                                >
                                    {columns.map((col) => (
                                        <td key={col.key || col.accessor} className={`px-4 py-3.5 ${col.cellClassName || ''}`}>
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                    {renderRowActions && (
                                        <td className="px-4 py-3.5 text-right font-medium">
                                            {renderRowActions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
                <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
                    <div>
                        Showing <span className="font-semibold text-neutral-900">{pagination.from || 1}</span> to{' '}
                        <span className="font-semibold text-neutral-900">{pagination.to || data.length}</span> of{' '}
                        <span className="font-semibold text-neutral-900">{pagination.total}</span> entries
                    </div>

                    <div className="flex items-center gap-2">
                        {pagination.links && pagination.links.map((link, idx) => {
                            if (!link.url && !link.label) return null;
                            const isPageNumber = !isNaN(link.label);
                            return (
                                <a
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded border transition-colors ${
                                        link.active
                                            ? 'bg-brand-500 text-white border-brand-500 font-semibold'
                                            : link.url
                                            ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                            : 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
