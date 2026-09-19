import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { SkeletonLine } from '@/Components/ui/Skeleton';

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
    isFiltered = false,
    onClearFilters = null,
    activeSort = { column: null, direction: 'asc' },
    onSort = null,
    emptyTitle = 'No data available',
    emptyDescription = 'There are no records to display.',
    emptyActionLabel = null,
    onEmptyAction = null,
    renderRowActions = null,
    compact = false,
    itemLabel = 'records',
}) {
    // Internal debounced search state to ensure typing is 100% uninterrupted
    const [localSearch, setLocalSearch] = useState(search || '');
    const isInitialMount = useRef(true);
    const inputRef = useRef(null);

    // Sync local state when external search prop changes (e.g. Clear Filters or reset)
    useEffect(() => {
        if (document.activeElement !== inputRef.current || search === '') {
            setLocalSearch(search || '');
        }
    }, [search]);

    // Debounced search dispatch (300ms)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (onSearchChange && localSearch !== (search || '')) {
                onSearchChange(localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch]);

    const handleClearSearch = () => {
        setLocalSearch('');
        if (onSearchChange) {
            onSearchChange('');
        }
    };

    if (error) {
        return (
            <div className="bg-white border border-red-100 rounded-xl p-10 text-center space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-1">
                    <RefreshCw className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-[13px] font-semibold text-neutral-700">Something went wrong</p>
                <p className="text-[12px] text-neutral-400">{error}</p>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Loading
                    </Button>
                )}
            </div>
        );
    }

    const hasData = data && data.length > 0;
    const _isFiltered = isFiltered || Boolean(localSearch || (filters && Object.values(filters).some(Boolean)));

    // Build pagination prev/next links from Laravel paginator links array
    const prevLink = pagination?.links?.find(l => l.label.includes('Previous') || l.label.includes('&laquo;'));
    const nextLink = pagination?.links?.find(l => l.label.includes('Next') || l.label.includes('&raquo;'));
    const pageLinks = pagination?.links?.filter(l => !l.label.includes('Previous') && !l.label.includes('Next') &&
        !l.label.includes('&laquo;') && !l.label.includes('&raquo;'));

    return (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs relative">
            {/* Slim top indeterminate loading bar */}
            {isLoading && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-100 overflow-hidden z-20">
                    <div className="h-full bg-brand-600 animate-pulse w-full" />
                </div>
            )}

            {/* Filter & Search Header — stays permanently mounted */}
            {(onSearchChange || filters) && (
                <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {onSearchChange && (
                        <div className="relative flex-1 max-w-md">
                            {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-600 animate-spin pointer-events-none" />
                            ) : (
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        handleClearSearch();
                                    }
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full text-[12.5px] pl-8 pr-8 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-neutral-300 shadow-2xs transition-colors"
                            />
                            {localSearch && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                                    title="Clear search (Esc)"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    {_isFiltered && onClearFilters && (
                        <Button variant="ghost" size="sm" onClick={() => {
                            handleClearSearch();
                            onClearFilters();
                        }}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}

            {/* Table Content */}
            {!hasData ? (
                isLoading ? (
                    <div className="p-6 space-y-3 animate-pulse">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 bg-neutral-100/80 rounded-lg w-full flex items-center px-4 gap-4">
                                <div className="w-10 h-10 bg-neutral-200 rounded-md shrink-0" />
                                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                                <div className="h-4 bg-neutral-200 rounded w-1/4 ml-auto" />
                            </div>
                        ))}
                    </div>
                ) : _isFiltered ? (
                    <div className="py-16 text-center">
                        <Filter className="w-7 h-7 text-neutral-300 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-neutral-700 mb-1">
                            No results{localSearch ? ` for "${localSearch}"` : ''}
                        </h4>
                        <p className="text-[12.5px] text-neutral-400 mb-4">
                            Try adjusting your search or clearing active filters.
                        </p>
                        {onClearFilters && (
                            <Button variant="outline" size="sm" onClick={() => {
                                handleClearSearch();
                                onClearFilters();
                            }}>
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
                            {/* Sticky Header */}
                            <thead className={`bg-neutral-50/90 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10 ${compact ? 'text-[10.5px]' : 'text-xs'}`}>
                                <tr>
                                    {columns.map((col, colIdx) => (
                                        <th
                                            key={col.key || col.accessor}
                                            onClick={() => col.sortable && onSort && onSort(col.accessor)}
                                            className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} select-none whitespace-nowrap font-semibold text-neutral-400 uppercase tracking-widest ${
                                                col.sortable ? 'cursor-pointer hover:text-neutral-600' : ''
                                            } ${colIdx === 0 ? 'pl-4' : ''} ${col.className || ''}`}
                                        >
                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                <span>{col.header}</span>
                                                {col.sortable && (
                                                    <span className="text-neutral-300">
                                                        {activeSort.column === col.accessor ? (
                                                            activeSort.direction === 'asc' ? (
                                                                <ChevronUp className="w-3 h-3 text-brand-500" />
                                                            ) : (
                                                                <ChevronDown className="w-3 h-3 text-brand-500" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="w-3 h-3 opacity-40" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    {renderRowActions && (
                                        <th className={`${compact ? 'px-3 py-2 text-[10.5px]' : 'px-4 py-3 text-xs'} text-right whitespace-nowrap font-semibold text-neutral-400 uppercase tracking-widest`}>
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-neutral-100 text-neutral-800 ${compact ? 'text-xs' : 'text-sm'} transition-opacity duration-150 ${
                                isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
                            }`}>
                                {data.map((row, index) => (
                                    <tr
                                        key={row.id || index}
                                        className={`group transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'
                                        } hover:bg-amber-50/25`}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={col.key || col.accessor}
                                                className={`${
                                                    compact ? 'px-3 py-1.5' : 'px-4 py-3.5'
                                                } ${colIdx === 0
                                                    ? 'border-l-2 border-transparent group-hover:border-brand-400 transition-colors pl-4'
                                                    : ''
                                                } ${col.numeric ? 'tabular-nums' : ''} ${col.cellClassName || ''}`}
                                            >
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </td>
                                        ))}
                                        {renderRowActions && (
                                            <td className={`${compact ? 'px-3 py-1.5' : 'px-4 py-3.5'} text-right font-medium`}>
                                                {renderRowActions(row)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout — visible only below md */}
                    <div className={`md:hidden divide-y divide-neutral-200 transition-opacity duration-150 ${
                        isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
                    }`}>
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
                <div className="px-4 py-3 border-t border-neutral-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Showing X–Y of Z */}
                    <p className="text-[11.5px] text-neutral-400">
                        Showing{' '}
                        <span className="font-semibold text-neutral-600">{pagination.from || 1}</span>
                        {' '}–{' '}
                        <span className="font-semibold text-neutral-600">{pagination.to || data.length}</span>
                        {' '}of{' '}
                        <span className="font-semibold text-neutral-600">{pagination.total}</span>
                        {' '}{itemLabel}
                    </p>

                    {/* Ghost-style Prev / Page numbers / Next */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center gap-0.5">
                            {prevLink && (
                                <a
                                    href={prevLink.url || '#'}
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs transition-colors ${
                                        prevLink.url
                                            ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                            : 'text-neutral-200 pointer-events-none'
                                    }`}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </a>
                            )}

                            {pageLinks && pageLinks.map((link, idx) => {
                                const isEllipsis = link.label === '...';
                                return isEllipsis ? (
                                    <span key={idx} className="px-1 text-[11px] text-neutral-300">…</span>
                                ) : (
                                    <a
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[11.5px] font-medium transition-colors ${
                                            link.active
                                                ? 'bg-brand-600 text-white shadow-xs'
                                                : link.url
                                                ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                                : 'text-neutral-200 pointer-events-none'
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}

                            {nextLink && (
                                <a
                                    href={nextLink.url || '#'}
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs transition-colors ${
                                        nextLink.url
                                            ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                            : 'text-neutral-200 pointer-events-none'
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

