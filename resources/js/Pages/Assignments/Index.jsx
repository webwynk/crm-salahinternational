import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import StatusPill from '@/Components/ui/StatusPill';
import { Plus, Eye, FileText, Scissors, ClipboardList, CheckCircle2, Clock, Package } from 'lucide-react';

/**
 * Dynamic Leather Color Palette Resolver
 * Resolves color variation names into authentic leather color dots, badges, and contrast borders.
 */
const getColorConfig = (name = '') => {
    const lower = (name || '').toLowerCase().trim();

    if (lower.includes('cherry') || lower.includes('burgundy') || lower.includes('wine') || lower.includes('red')) {
        return { dot: '#991b1b', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
    }
    if (lower.includes('tan') || lower.includes('cognac') || lower.includes('camel') || lower.includes('whiskey') || lower.includes('amber')) {
        return { dot: '#b45309', bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
    }
    if (lower.includes('brown') || lower.includes('espresso') || lower.includes('chocolate') || lower.includes('havana') || lower.includes('tobacco')) {
        return { dot: '#5c3a21', bg: '#fbf7f4', text: '#451a03', border: '#e8d7c8' };
    }
    if (lower.includes('black') || lower.includes('noir') || lower.includes('onyx')) {
        return { dot: '#18181b', bg: '#f4f4f5', text: '#09090b', border: '#d4d4d8' };
    }
    if (lower.includes('green') || lower.includes('olive') || lower.includes('forest') || lower.includes('emerald') || lower.includes('sage')) {
        return { dot: '#15803d', bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
    }
    if (lower.includes('blue') || lower.includes('navy') || lower.includes('indigo') || lower.includes('sapphire') || lower.includes('ocean')) {
        return { dot: '#1d4ed8', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
    }
    if (lower.includes('white') || lower.includes('blanc') || lower.includes('ivory') || lower.includes('cream')) {
        return { dot: '#a1a1aa', bg: '#fafaf9', text: '#3f3f46', border: '#e4e4e7' };
    }
    if (lower.includes('grey') || lower.includes('gray') || lower.includes('charcoal')) {
        return { dot: '#4b5563', bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' };
    }
    if (lower.includes('yellow') || lower.includes('mustard') || lower.includes('gold')) {
        return { dot: '#ca8a04', bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
    }
    if (lower.includes('pink') || lower.includes('rose') || lower.includes('blush')) {
        return { dot: '#e11d48', bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' };
    }
    if (lower.includes('orange') || lower.includes('terracotta') || lower.includes('rust')) {
        return { dot: '#c2410c', bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' };
    }

    // Default warm leather fallback
    return { dot: '#b45309', bg: '#fffbeb', text: '#78350f', border: '#fde68a' };
};

/**
 * Factory Direct 1-Click Micro-Action Bar
 * Ultra-compact 24px segmented toolbar with instant 1-click printing and zero popover scrollbar bugs
 */
function WorkOrderActionHub({ row }) {
    return (
        <div className="flex items-center gap-1.5 justify-end shrink-0 whitespace-nowrap">
            {row.status === 'ASSIGNED' && (
                <select
                    value={row.status}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CANCELLED') {
                            if (confirm(`Cancel Work Order #${row.assignment_no} and refund all deducted raw materials back to inventory stock?`)) {
                                router.patch(route('assignments.status', row.id), { status: val });
                            }
                        } else {
                            router.patch(route('assignments.status', row.id), { status: val });
                        }
                    }}
                    className="text-[10px] h-[24px] border border-brand-300 rounded px-1 py-0 bg-brand-50/60 font-bold text-brand-800 hover:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-2xs transition-colors"
                >
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
            )}

            {/* Contiguous Segmented Micro-Toolbar (24px height) */}
            <div className="inline-flex items-center rounded border border-neutral-300 bg-white shadow-2xs divide-x divide-neutral-200 overflow-hidden h-[24px]">
                {/* 1. View Full Details */}
                <Link
                    href={route('assignments.show', row.id)}
                    className="px-1.5 h-full flex items-center justify-center text-neutral-500 hover:text-brand-800 hover:bg-neutral-50 transition-colors"
                    title="View Work Order details"
                >
                    <Eye className="w-3.5 h-3.5" />
                </Link>

                {/* 2. Exporter Copy (1-Click) */}
                <a
                    href={route('assignments.pdf', { assignment: row.id, type: 'exporter' })}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 h-full flex items-center gap-1 text-[10.5px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    title="Download Exporter Copy PDF (Commercial & BOM costing)"
                >
                    <FileText className="w-3 h-3 text-neutral-500" />
                    <span>Exp</span>
                </a>

                {/* 3. Fabricator Copy (1-Click) */}
                <a
                    href={route('assignments.pdf', { assignment: row.id, type: 'fabricator' })}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 h-full flex items-center gap-1 text-[10.5px] font-semibold text-amber-800 hover:bg-amber-50 hover:text-amber-950 transition-colors"
                    title="Download Fabricator Copy PDF (Artisan workshop job card)"
                >
                    <FileText className="w-3 h-3 text-amber-600" />
                    <span>Fab</span>
                </a>

                {/* 4. Leather Cutting Slip (1-Click) */}
                <a
                    href={route('assignments.leather-pdf', row.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 h-full flex items-center gap-1 text-[10.5px] font-semibold text-brand-900 hover:bg-brand-50 hover:text-brand-950 transition-colors"
                    title="Download Leather Cutting Slip (Workshop hide voucher)"
                >
                    <Scissors className="w-3 h-3 text-brand-700" />
                    <span>Lthr</span>
                </a>
            </div>
        </div>
    );
}

export default function Index({ assignments, filters = {}, stats = null }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleSearch = (val) => {
        setSearch(val);
        router.get(route('assignments.index'), { ...filters, search: val, page: 1 }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get(route('assignments.index'), { ...filters, status, page: 1 }, { preserveState: true, replace: true });
    };

    const columns = [
        {
            header: 'Work Order #',
            accessor: 'assignment_no',
            sortable: true,
            className: 'whitespace-nowrap',
            render: (row) => (
                <Link
                    href={route('assignments.show', row.id)}
                    className="inline-flex items-center gap-1 font-mono font-bold text-xs text-brand-800 bg-brand-50/80 hover:bg-brand-100 hover:text-brand-950 border border-brand-200/80 hover:border-brand-400 px-2 py-0.5 rounded shadow-2xs transition-all"
                    title="View full work order"
                >
                    #{row.assignment_no}
                </Link>
            ),
        },
        {
            header: 'Product Target',
            accessor: 'product',
            className: 'min-w-[180px]',
            render: (row) => {
                const colorConfig = row.color?.color_name ? getColorConfig(row.color.color_name) : null;
                return (
                    <div className="flex items-center gap-1.5 whitespace-nowrap py-0.5">
                        <span className="font-semibold text-neutral-900 text-xs tracking-tight">
                            {row.product?.name ?? '—'}
                        </span>
                        {row.product?.code && (
                            <span className="font-mono text-[10px] text-neutral-500 bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200">
                                {row.product.code}
                            </span>
                        )}

                        {/* Inline Highlighted Product Variation Badge */}
                        {row.color?.color_name ? (
                            <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10.5px] font-bold border shadow-2xs leading-tight transition-all"
                                style={{
                                    backgroundColor: colorConfig.bg,
                                    color: colorConfig.text,
                                    borderColor: colorConfig.border,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full ring-1 ring-black/15 shrink-0"
                                    style={{ backgroundColor: colorConfig.dot }}
                                />
                                <span>{row.color.color_name}</span>
                            </span>
                        ) : (
                            <span className="text-[10px] text-neutral-400 font-medium italic">
                                Standard
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Artisan Worker',
            accessor: 'labour',
            className: 'whitespace-nowrap',
            render: (row) => {
                if (!row.labour) return <span className="text-neutral-400 text-xs">—</span>;

                const nameParts = row.labour.name.trim().split(/\s+/);
                const initials = nameParts.length >= 2
                    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : row.labour.name.substring(0, 2).toUpperCase();

                return (
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 border border-brand-300/80 text-[9.5px] font-bold flex items-center justify-center shrink-0 shadow-2xs select-none">
                            {initials}
                        </div>
                        <span className="text-xs text-neutral-800 font-medium whitespace-nowrap">
                            {row.labour.name}
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Target Qty',
            accessor: 'quantity',
            sortable: true,
            numeric: true,
            className: 'whitespace-nowrap',
            render: (row) => (
                <span className="inline-flex items-baseline gap-1 px-1.5 py-0.2 rounded bg-neutral-100/90 border border-neutral-200/80 font-bold text-neutral-900 text-xs tabular-nums">
                    {row.quantity}
                    <span className="text-[9.5px] font-normal text-neutral-500 uppercase">Pcs</span>
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            className: 'whitespace-nowrap',
            render: (row) => (
                <StatusPill status={row.status} className="text-[10.5px] px-2 py-0.2" />
            ),
        },
        {
            header: 'Assigned Date',
            accessor: 'created_at',
            sortable: true,
            className: 'whitespace-nowrap',
            render: (row) => (
                <span className="text-[11.5px] text-neutral-500 font-sans tabular-nums whitespace-nowrap block">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
            ),
        },
    ];

    const statusOptions = [
        { value: 'ASSIGNED', label: 'Assigned' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

    // Compute summary stats with fallbacks
    const totalCount = stats?.total ?? assignments?.total ?? 0;
    const assignedCount = stats?.assigned ?? (assignments?.data?.filter(a => a.status === 'ASSIGNED').length || 0);
    const completedCount = stats?.completed ?? (assignments?.data?.filter(a => a.status === 'COMPLETED').length || 0);
    const totalQuantity = stats?.total_quantity ?? (assignments?.data?.reduce((acc, a) => acc + (parseInt(a.quantity) || 0), 0) || 0);

    return (
        <AppLayout>
            <Head title="Work Order Assignments — Leather CRM" />

            <PageHeader
                title="Work Order Assignments"
                description="Track production batches, deduct stock automatically, and print artisan job cards"
                action={
                    <Link href={route('assignments.create')}>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 mr-1.5" /> New Work Order
                        </Button>
                    </Link>
                }
            />

            {/* Quick KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white border border-neutral-200 rounded-md px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Orders</div>
                        <div className="text-base font-bold text-neutral-900 tabular-nums">{totalCount}</div>
                    </div>
                    <ClipboardList className="w-5 h-5 text-neutral-400" />
                </div>

                <div className="bg-white border border-neutral-200 rounded-md px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">In Progress</div>
                        <div className="text-base font-bold text-brand-700 tabular-nums">{assignedCount}</div>
                    </div>
                    <Clock className="w-5 h-5 text-brand-500" />
                </div>

                <div className="bg-white border border-neutral-200 rounded-md px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Completed</div>
                        <div className="text-base font-bold text-emerald-700 tabular-nums">{completedCount}</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="bg-white border border-neutral-200 rounded-md px-3.5 py-2.5 shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Target Units</div>
                        <div className="text-base font-bold text-neutral-900 tabular-nums">{totalQuantity} <span className="text-xs font-normal text-neutral-500">Pcs</span></div>
                    </div>
                    <Package className="w-5 h-5 text-neutral-400" />
                </div>
            </div>

            <FilterChips
                options={statusOptions}
                value={selectedStatus}
                onChange={handleStatusFilter}
                allLabel="All Statuses"
                className="mb-4"
            />

            <DataTable
                columns={columns}
                data={assignments?.data || []}
                pagination={assignments}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search by Work Order #, product, color, or artisan worker..."
                emptyTitle="No work orders found"
                emptyDescription="Assign your first product to an artisan worker to start tracking production."
                emptyActionLabel="New Work Order"
                compact={true}
                onEmptyAction={() => router.get(route('assignments.create'))}
                renderRowActions={(row) => <WorkOrderActionHub row={row} />}
            />
        </AppLayout>
    );
}

