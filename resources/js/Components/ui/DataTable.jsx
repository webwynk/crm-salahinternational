import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { SkeletonTable } from '@/Components/ui/Skeleton';

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
    compact = false,
}) {
    if (isLoading) {
        return <SkeletonTable cols={columns.length + (renderRowActions ? 1 : 0)} rows={6} />;
    }

    if (error) {
        return (
            <div className="bg-neutral-0 border border-danger-500/30 rounded-md p-8 text-center space-y-4 shadow-xs">
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

    // Build pagination prev/next links from Laravel paginator links array
    const prevLink = pagination?.links?.find(l => l.label.includes('Previous') || l.label.includes('&laquo;'));
    const nextLink = pagination?.links?.find(l => l.label.includes('Next') || l.label.includes('&raquo;'));
    const pageLinks = pagination?.links?.filter(l => !l.label.includes('Previous') && !l.label.includes('Next') &&
        !l.label.includes('&laquo;') && !l.label.includes('&raquo;'));

    return (
        <div className="bg-neutral-0 border border-neutral-200 rounded-md overflow-hidden shadow-xs">
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
                                className="w-full text-sm pl-9 pr-3.5 py-2 border border-neutral-300 rounded-md bg-neutral-0 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                            No results for "{search}"
                        </h4>
                        <p className="text-sm text-neutral-500 mb-4">
                            Try adjusting your search terms or clearing active filters.
                        </p>
                        {onClearFilters && (
                            <Button variant="outline" size="sm" onClick={onClearFilters}>
                                Reset Filters
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
                <>
                    {/* Desktop Table — hidden below md */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className={`bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-500 uppercase tracking-wider ${compact ? 'text-[11px]' : 'text-xs'}`}>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key || col.accessor}
                                            onClick={() => col.sortable && onSort && onSort(col.accessor)}
                                            className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} select-none ${
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
                                                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    {renderRowActions && <th className={`${compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-3 text-xs'} text-right`}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-neutral-200 text-neutral-800 ${compact ? 'text-xs' : 'text-sm'}`}>
                                {data.map((row, index) => (
                                    <tr
                                        key={row.id || index}
                                        className="hover:bg-neutral-50/80 transition-colors"
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key || col.accessor}
                                                className={`${compact ? 'px-3 py-2' : 'px-4 py-3.5'} ${col.numeric ? 'tabular-nums' : ''} ${col.cellClassName || ''}`}
                                            >
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </td>
                                        ))}
                                        {renderRowActions && (
                                            <td className={`${compact ? 'px-3 py-2' : 'px-4 py-3.5'} text-right font-medium`}>
                                                {renderRowActions(row)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout — visible only below md */}
                    <div className="md:hidden divide-y divide-neutral-200">
                        {data.map((row, index) => (
                            <div
                                key={row.id || index}
                                className="px-4 py-4 space-y-3 hover:bg-neutral-50 transition-colors"
                            >
                                {columns.map((col) => (
                                    <div key={col.key || col.accessor} className="flex items-start justify-between gap-4">
                                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide shrink-0 pt-0.5 w-28">
                                            {col.header}
                                        </span>
                                        <span className={`text-sm text-right flex-1 ${col.numeric ? 'tabular-nums' : ''}`}>
                                            {col.render ? col.render(row) : (row[col.accessor] ?? '—')}
                                        </span>
                                    </div>
                                ))}
                                {renderRowActions && (
                                    <div className="pt-2 border-t border-neutral-100 flex justify-end">
                                        {renderRowActions(row)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
                <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Showing X–Y of Z */}
                    <p className="text-xs text-neutral-500">
                        Showing{' '}
                        <span className="font-semibold text-neutral-800">{pagination.from || 1}</span>
                        {' '}–{' '}
                        <span className="font-semibold text-neutral-800">{pagination.to || data.length}</span>
                        {' '}of{' '}
                        <span className="font-semibold text-neutral-800">{pagination.total}</span>
                        {' '}entries
                    </p>

                    {/* Prev / Page numbers / Next */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center gap-1">
                            {/* Prev */}
                            {prevLink && (
                                <a
                                    href={prevLink.url || '#'}
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded border text-xs transition-colors ${
                                        prevLink.url
                                            ? 'bg-neutral-0 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                            : 'bg-neutral-100 border-neutral-200 text-neutral-300 pointer-events-none'
                                    }`}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </a>
                            )}

                            {/* Page numbers — show up to 7, ellipsis for large sets */}
                            {pageLinks && pageLinks.map((link, idx) => {
                                const isEllipsis = link.label === '...';
                                return isEllipsis ? (
                                    <span key={idx} className="px-1 text-xs text-neutral-400">…</span>
                                ) : (
                                    <a
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`inline-flex items-center justify-center w-8 h-8 rounded border text-xs font-medium transition-colors ${
                                            link.active
                                                ? 'bg-brand-500 text-white border-brand-500'
                                                : link.url
                                                ? 'bg-neutral-0 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                                : 'bg-neutral-100 border-neutral-200 text-neutral-300 pointer-events-none'
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}

                            {/* Next */}
                            {nextLink && (
                                <a
                                    href={nextLink.url || '#'}
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded border text-xs transition-colors ${
                                        nextLink.url
                                            ? 'bg-neutral-0 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                            : 'bg-neutral-100 border-neutral-200 text-neutral-300 pointer-events-none'
                                    }`}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

