import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/ui/DataTable';
import Button from '@/Components/ui/Button';
import {
    Plus, Eye, FileText, Scissors,
    ClipboardList, CheckCircle2, Clock, Package,
    CheckCheck, XCircle,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Dynamic Leather Color Palette Resolver
───────────────────────────────────────────── */
const getColorConfig = (name = '') => {
    const lower = (name || '').toLowerCase().trim();
    if (lower.includes('cherry') || lower.includes('burgundy') || lower.includes('wine') || lower.includes('red'))
        return { dot: '#991b1b', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
    if (lower.includes('tan') || lower.includes('cognac') || lower.includes('camel') || lower.includes('whiskey') || lower.includes('amber'))
        return { dot: '#b45309', bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
    if (lower.includes('brown') || lower.includes('espresso') || lower.includes('chocolate') || lower.includes('havana') || lower.includes('tobacco'))
        return { dot: '#5c3a21', bg: '#fbf7f4', text: '#451a03', border: '#e8d7c8' };
    if (lower.includes('black') || lower.includes('noir') || lower.includes('onyx'))
        return { dot: '#18181b', bg: '#f4f4f5', text: '#09090b', border: '#d4d4d8' };
    if (lower.includes('green') || lower.includes('olive') || lower.includes('forest') || lower.includes('emerald') || lower.includes('sage'))
        return { dot: '#15803d', bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
    if (lower.includes('blue') || lower.includes('navy') || lower.includes('indigo') || lower.includes('sapphire') || lower.includes('ocean'))
        return { dot: '#1d4ed8', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
    if (lower.includes('white') || lower.includes('blanc') || lower.includes('ivory') || lower.includes('cream'))
        return { dot: '#a1a1aa', bg: '#fafaf9', text: '#3f3f46', border: '#e4e4e7' };
    if (lower.includes('grey') || lower.includes('gray') || lower.includes('charcoal'))
        return { dot: '#4b5563', bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' };
    if (lower.includes('yellow') || lower.includes('mustard') || lower.includes('gold'))
        return { dot: '#ca8a04', bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
    if (lower.includes('pink') || lower.includes('rose') || lower.includes('blush'))
        return { dot: '#e11d48', bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' };
    if (lower.includes('orange') || lower.includes('terracotta') || lower.includes('rust'))
        return { dot: '#c2410c', bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' };
    return { dot: '#b45309', bg: '#fffbeb', text: '#78350f', border: '#fde68a' };
};

/* ─────────────────────────────────────────────
   Premium KPI Card — left accent bar + gradient
───────────────────────────────────────────── */
function KpiCard({ label, value, unit, icon: Icon, accentColor, valueColor }) {
    return (
        <div
            className="relative bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden flex items-center gap-3.5 px-4 py-3.5"
            style={{ borderLeft: `3px solid ${accentColor}` }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${accentColor}12 0%, transparent 55%)` }}
            />
            <div
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}1a` }}
            >
                <Icon className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0 relative">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest leading-none mb-1.5">
                    {label}
                </div>
                <div className="flex items-baseline gap-1 leading-none">
                    <span className="text-[22px] font-bold tabular-nums leading-none" style={{ color: valueColor }}>
                        {value}
                    </span>
                    {unit && (
                        <span className="text-[10px] font-medium text-neutral-400 uppercase">{unit}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Modern Square Status Badge with icon
───────────────────────────────────────────── */
function StatusBadge({ status }) {
    const map = {
        ASSIGNED:  { label: 'Assigned',  bg: '#fffbeb', text: '#92400e', border: '#fde68a', Icon: Clock },
        COMPLETED: { label: 'Completed', bg: '#ecfdf5', text: '#047857', border: '#6ee7b7', Icon: CheckCheck },
        CANCELLED: { label: 'Cancelled', bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5', Icon: XCircle },
    };
    const cfg = map[status] || { label: status, bg: '#f3f4f6', text: '#374151', border: '#d1d5db', Icon: null };
    const { label, bg, text, border, Icon } = cfg;
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border leading-tight whitespace-nowrap"
            style={{ backgroundColor: bg, color: text, borderColor: border }}
        >
            {Icon && <Icon className="w-3 h-3 shrink-0" />}
            {label}
        </span>
    );
}

/* ─────────────────────────────────────────────
   Modern Icon-Only Action Hub
───────────────────────────────────────────── */
function WorkOrderActionHub({ row }) {
    return (
        <div className="flex items-center gap-1.5 justify-end shrink-0 whitespace-nowrap">
            {row.status === 'ASSIGNED' && (
                <select
                    value={row.status}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CANCELLED') {
                            if (confirm(`Cancel Work Order ${row.assignment_no} and refund all deducted raw materials back to inventory stock?`)) {
                                router.patch(route('assignments.status', row.id), { status: val });
                            }
                        } else {
                            router.patch(route('assignments.status', row.id), { status: val });
                        }
                    }}
                    className="text-[10px] h-[22px] border border-neutral-200 rounded-md px-1.5 py-0 bg-white font-semibold text-neutral-600 hover:border-brand-400 hover:bg-brand-50 focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-2xs transition-all"
                >
                    <option value="ASSIGNED">Assigned</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            )}

            {/* Icon buttons */}
            <div className="flex items-center gap-px">
                <Link
                    href={route('assignments.show', row.id)}
                    title="View Work Order details"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
                >
                    <Eye className="w-3.5 h-3.5" />
                </Link>
                <a
                    href={route('assignments.pdf', { assignment: row.id, type: 'exporter' })}
                    target="_blank" rel="noreferrer"
                    title="Exporter Copy PDF"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
                >
                    <FileText className="w-3.5 h-3.5" />
                </a>
                <a
                    href={route('assignments.pdf', { assignment: row.id, type: 'fabricator' })}
                    target="_blank" rel="noreferrer"
                    title="Fabricator Copy PDF"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >
                    <FileText className="w-3.5 h-3.5" />
                </a>
                <a
                    href={route('assignments.leather-pdf', row.id)}
                    target="_blank" rel="noreferrer"
                    title="Leather Cutting Slip"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-brand-600 hover:text-brand-800 hover:bg-brand-50 transition-all"
                >
                    <Scissors className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
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

    const handleClearFilters = () => {
        setSearch('');
        setSelectedStatus('');
        router.get(route('assignments.index'), {}, { preserveState: true, replace: true });
    };

    /* ── KPI numbers ── */
    const totalCount     = stats?.total          ?? assignments?.total ?? 0;
    const assignedCount  = stats?.assigned        ?? 0;
    const completedCount = stats?.completed       ?? 0;
    const cancelledCount = stats?.cancelled       ?? 0;
    const totalQuantity  = stats?.total_quantity  ?? 0;

    /* ── Table columns ── */
    const columns = [
        {
            header: 'Work Order',
            accessor: 'assignment_no',
            sortable: true,
            className: 'whitespace-nowrap',
            render: (row) => (
                <Link
                    href={route('assignments.show', row.id)}
                    className="font-mono font-bold text-[11.5px] text-brand-700 hover:text-brand-900 hover:underline underline-offset-2 transition-colors"
                    title="View full work order"
                >
                    {row.assignment_no}
                </Link>
            ),
        },
        {
            header: 'Product / Variation',
            accessor: 'product',
            className: 'min-w-[200px]',
            render: (row) => {
                const colorConfig = row.color?.color_name ? getColorConfig(row.color.color_name) : null;
                return (
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span
                            className="font-medium text-neutral-900 text-[12px] truncate max-w-[175px]"
                            title={row.product?.name}
                        >
                            {row.product?.name ?? '—'}
                        </span>
                        {row.product?.code && (
                            <span className="font-mono text-[9.5px] text-neutral-400 bg-neutral-100 px-1 py-px rounded border border-neutral-200 shrink-0">
                                {row.product.code}
                            </span>
                        )}
                        {row.color?.color_name ? (
                            <span
                                className="inline-flex items-center gap-1 px-1.5 py-px rounded-md text-[10px] font-semibold border leading-tight shrink-0"
                                style={{ backgroundColor: colorConfig.bg, color: colorConfig.text, borderColor: colorConfig.border }}
                            >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorConfig.dot }} />
                                {row.color.color_name}
                            </span>
                        ) : (
                            <span className="text-[9.5px] text-neutral-300 font-medium italic shrink-0">Standard</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Artisan',
            accessor: 'labour',
            className: 'whitespace-nowrap',
            render: (row) => {
                if (!row.labour) return <span className="text-neutral-300 text-xs">—</span>;
                const nameParts = row.labour.name.trim().split(/\s+/);
                const initials = nameParts.length >= 2
                    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : row.labour.name.substring(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-brand-800 border border-brand-300/60 text-[9px] font-bold flex items-center justify-center shrink-0 shadow-2xs select-none">
                            {initials}
                        </div>
                        <span className="text-[12px] text-neutral-700 font-medium">{row.labour.name}</span>
                    </div>
                );
            },
        },
        {
            header: 'Qty',
            accessor: 'quantity',
            sortable: true,
            numeric: true,
            className: 'whitespace-nowrap',
            cellClassName: 'text-center',
            render: (row) => (
                <span className="font-bold text-neutral-800 text-[12px] tabular-nums">
                    {row.quantity}
                    <span className="text-[9.5px] font-normal text-neutral-400 ml-0.5">pcs</span>
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            className: 'whitespace-nowrap',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            header: 'Date',
            accessor: 'created_at',
            sortable: true,
            className: 'whitespace-nowrap',
            render: (row) => (
                <span className="text-[11px] text-neutral-400 font-medium tabular-nums whitespace-nowrap">
                    {row.created_at
                        ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                </span>
            ),
        },
    ];

    /* ── Filter tabs with live count badges ── */
    const filterTabs = [
        { value: '',           label: 'All',         count: totalCount },
        { value: 'ASSIGNED',   label: 'In Progress', count: assignedCount },
        { value: 'COMPLETED',  label: 'Completed',   count: completedCount },
        { value: 'CANCELLED',  label: 'Cancelled',   count: cancelledCount },
    ];

    const isFiltered = Boolean(search || selectedStatus);

    return (
        <AppLayout>
            <Head title="Work Orders — Leather CRM" />

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Work Orders</h1>
                    <p className="text-[12.5px] text-neutral-400 mt-0.5">
                        Production batch tracking · raw stock deduction · artisan job cards
                    </p>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <KpiCard label="Total Orders"  value={totalCount}     icon={ClipboardList} accentColor="#64748b" valueColor="#1e293b" />
                <KpiCard label="In Progress"   value={assignedCount}  icon={Clock}         accentColor="#d97706" valueColor="#92400e" />
                <KpiCard label="Completed"     value={completedCount} icon={CheckCircle2}  accentColor="#10b981" valueColor="#047857" />
                <KpiCard label="Total Units"   value={totalQuantity}  unit="pcs" icon={Package} accentColor="#6366f1" valueColor="#3730a3" />
            </div>

            {/* ── Unified Toolbar: Search + Filter Tabs + New Button ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">

                {/* Search input */}
                <div className="relative flex-shrink-0 w-full sm:w-72">
                    <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search orders, products, artisans…"
                        className="w-full text-[12.5px] pl-8 pr-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-neutral-300 shadow-2xs transition-all"
                    />
                </div>

                {/* Underline filter tabs with count badges */}
                <div className="flex items-end border-b border-neutral-200 gap-0 overflow-x-auto flex-shrink-0">
                    {filterTabs.map((tab) => {
                        const isActive = selectedStatus === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => handleStatusFilter(tab.value)}
                                className={`relative flex items-center gap-1.5 px-3 pb-2 pt-1 text-[11.5px] font-semibold whitespace-nowrap transition-all ${
                                    isActive ? 'text-brand-700' : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                            >
                                {tab.label}
                                <span className={`text-[9px] font-bold px-1 py-px rounded-full leading-none min-w-[16px] text-center ${
                                    isActive ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-400'
                                }`}>
                                    {tab.count}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {isFiltered && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-[11px] text-neutral-400 hover:text-neutral-700 font-medium transition-colors whitespace-nowrap flex-shrink-0"
                    >
                        Clear
                    </button>
                )}

                {/* Spacer */}
                <div className="flex-1 hidden sm:block" />

                {/* New Work Order */}
                <Link href={route('assignments.create')} className="shrink-0">
                    <Button variant="primary" size="sm">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        New Work Order
                    </Button>
                </Link>
            </div>

            {/* ── Data Table ── */}
            <DataTable
                columns={columns}
                data={assignments?.data || []}
                pagination={assignments}
                search={search}
                isFiltered={isFiltered}
                onClearFilters={handleClearFilters}
                emptyTitle="No work orders found"
                emptyDescription="Create your first work order to start tracking production batches."
                emptyActionLabel="New Work Order"
                compact={true}
                onEmptyAction={() => router.get(route('assignments.create'))}
                renderRowActions={(row) => <WorkOrderActionHub row={row} />}
            />
        </AppLayout>
    );
}

