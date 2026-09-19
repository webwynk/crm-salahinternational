import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import {
    FileText,
    Download,
    XCircle,
    Plus,
    AlertTriangle,
    Search,
    X,
    Eye,
    Phone,
    Package,
    Calendar,
    User,
    Layers,
    MessageSquare,
} from 'lucide-react';

/**
 * Challans — Modern Enterprise SaaS Leather Cutting Challans Dashboard.
 * 
 * Features:
 * - Status Filter Tabs (All, Issued, Cancelled) & Real-time Debounced Search
 * - High-Density SaaS Data Table with Amber Code Badges, Cutter Avatars, and Product Previews
 * - Interactive Slide-Over / Modal Challan Inspector
 * - Real-Time Stock Refund & Cancellation Confirmation Modal
 */
export default function Challans({ challans, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [cancelChallan, setCancelChallan] = useState(null);
    const [previewChallan, setPreviewChallan] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || '');

    // Auto-trigger PDF download if returning from newly created Challan
    useEffect(() => {
        if (flash?.download_challan_id) {
            window.open(route('leather.challan.pdf', flash.download_challan_id), '_blank');
        }
    }, [flash]);

    // Handle Search Filter Dispatch
    const handleFilterChange = (newSearch, newStatus) => {
        router.get(
            route('leather.challans.index'),
            {
                search: newSearch !== undefined ? newSearch : searchQuery,
                status: newStatus !== undefined ? newStatus : activeStatus,
                page: 1,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleConfirmCancel = () => {
        if (!cancelChallan) return;
        setIsCancelling(true);

        router.post(
            route('leather.challan.cancel', cancelChallan.id),
            {},
            {
                onFinish: () => {
                    setIsCancelling(false);
                    setCancelChallan(null);
                    if (previewChallan?.id === cancelChallan.id) {
                        setPreviewChallan(null);
                    }
                },
            }
        );
    };

    // Calculate Cutter Initials
    const getInitials = (name) => {
        if (!name) return 'CW';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <AppLayout>
            <Head title="Leather Cutting Challans — Salah International" />

            <div className="space-y-4">
                <LeatherTabNav />

                {/* SaaS Header & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-2xs">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight leading-tight">
                                Leather Cutting Challans
                            </h1>
                            <p className="text-xs text-neutral-500 leading-tight">
                                Manage raw leather hide allocation vouchers, cutter assignments, and atomic stock deductions.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('leather.challan.create')}>
                            <Button variant="primary" className="flex items-center gap-1.5 text-xs font-bold shadow-xs">
                                <Plus className="w-4 h-4" />
                                Make New Challan
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleFilterChange(e.target.value, activeStatus);
                            }}
                            placeholder="Search by challan #, cutter name, phone, or leather..."
                            className="w-full text-xs pl-8 pr-8 py-1.5 rounded-md border border-neutral-300 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 placeholder:text-neutral-400 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    handleFilterChange('', activeStatus);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter Segmented Buttons */}
                    <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveStatus('');
                                handleFilterChange(searchQuery, '');
                            }}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                !activeStatus
                                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                                    : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            All ({stats.total_challans ?? challans.total ?? 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveStatus('ISSUED');
                                handleFilterChange(searchQuery, 'ISSUED');
                            }}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                                activeStatus === 'ISSUED'
                                    ? 'bg-white text-success-800 shadow-2xs font-bold'
                                    : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                            Issued
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveStatus('CANCELLED');
                                handleFilterChange(searchQuery, 'CANCELLED');
                            }}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                                activeStatus === 'CANCELLED'
                                    ? 'bg-white text-danger-700 shadow-2xs font-bold'
                                    : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-danger-500"></span>
                            Cancelled
                        </button>
                    </div>
                </div>

                {/* High-Density Data Grid Container */}
                <div className="bg-white border border-neutral-200/90 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-neutral-50/90 border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                                    <th className="py-2.5 px-3">Challan #</th>
                                    <th className="py-2.5 px-3">Date</th>
                                    <th className="py-2.5 px-3">Assigned Cutter</th>
                                    <th className="py-2.5 px-3">Leather Hide & Variant</th>
                                    <th className="py-2.5 px-3 text-right">Leather Issued</th>
                                    <th className="py-2.5 px-3">Products</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/80">
                                {challans.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-neutral-500 space-y-2">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <p className="font-bold text-sm text-neutral-800">No cutting challans found</p>
                                            <p className="text-xs text-neutral-400">
                                                {searchQuery || activeStatus
                                                    ? 'Try adjusting your search or filters.'
                                                    : 'Issue raw leather hides to start tracking cutting allocations.'}
                                            </p>
                                            {!searchQuery && !activeStatus && (
                                                <div className="pt-2">
                                                    <Link href={route('leather.challan.create')}>
                                                        <Button variant="primary" size="sm" className="gap-1.5">
                                                            <Plus className="w-3.5 h-3.5" />
                                                            Make First Challan
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    challans.data.map((row) => {
                                        const isIssued = row.status === 'ISSUED';
                                        return (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-neutral-50/70 transition-colors group cursor-pointer"
                                                onClick={() => setPreviewChallan(row)}
                                            >
                                                {/* Challan # */}
                                                <td className="py-2.5 px-3">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs">
                                                        <FileText className="w-3 h-3 text-amber-700" />
                                                        #{row.challan_no}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-2.5 px-3 text-neutral-600 font-mono text-[11px]">
                                                    {new Date(row.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                {/* Assigned Cutter */}
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {getInitials(row.cutter?.name)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-neutral-900 text-xs truncate">
                                                                {row.cutter?.name || 'Unassigned'}
                                                            </div>
                                                            {row.cutter?.phone && (
                                                                <div className="text-[10px] text-neutral-400 font-mono">
                                                                    {row.cutter.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Leather Hide & Variant */}
                                                <td className="py-2.5 px-3">
                                                    <div className="font-semibold text-neutral-800 text-xs">
                                                        {row.material?.name || 'Raw Leather'}
                                                    </div>
                                                    <div className="text-[10.5px] font-medium text-brand-700 font-mono">
                                                        {row.variant?.name ? row.variant.name : 'Standard Hide'}
                                                    </div>
                                                </td>

                                                {/* Leather Issued */}
                                                <td className="py-2.5 px-3 text-right">
                                                    <span className="font-black text-brand-900 font-mono text-xs">
                                                        {Number(row.total_sqft).toFixed(2)}{' '}
                                                        <span className="text-[10px] text-neutral-500 font-normal font-sans">sq. ft</span>
                                                    </span>
                                                </td>

                                                {/* Products */}
                                                <td className="py-2.5 px-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                        <Package className="w-3 h-3 text-neutral-400" />
                                                        {row.items_count} {row.items_count === 1 ? 'Product' : 'Products'}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-2.5 px-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            isIssued
                                                                ? 'bg-success-50 text-success-800 border border-success-200'
                                                                : 'bg-danger-50 text-danger-700 border border-danger-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                isIssued ? 'bg-success-500' : 'bg-danger-500'
                                                            }`}
                                                        ></span>
                                                        {row.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={route('leather.challan.pdf', row.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 bg-white text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors shadow-2xs"
                                                            title="Download PDF Voucher"
                                                        >
                                                            <Download className="w-3 h-3 text-neutral-500" />
                                                            PDF
                                                        </a>

                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewChallan(row)}
                                                            className="p-1 rounded text-neutral-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                                                            title="Inspect Challan Details"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>

                                                        {isIssued && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setCancelChallan(row)}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-danger-200 bg-danger-50 text-[11px] font-semibold text-danger-700 hover:bg-danger-100 transition-colors"
                                                                title="Cancel Challan & Refund Stock"
                                                            >
                                                                <XCircle className="w-3 h-3" />
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {challans.total > 0 && (
                        <div className="p-3 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                            <div>
                                Showing <strong className="font-semibold text-neutral-900">{challans.from || 0}</strong> to{' '}
                                <strong className="font-semibold text-neutral-900">{challans.to || 0}</strong> of{' '}
                                <strong className="font-semibold text-neutral-900">{challans.total}</strong> records
                            </div>

                            {challans.links && challans.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {challans.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            preserveState
                                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                                link.active
                                                    ? 'bg-brand-700 text-white font-bold'
                                                    : link.url
                                                    ? 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                                    : 'text-neutral-300 pointer-events-none'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Challan Quick Inspector Modal */}
            <Modal
                isOpen={!!previewChallan}
                onClose={() => setPreviewChallan(null)}
                title={`Challan Voucher #${previewChallan?.challan_no}`}
                maxWidth="max-w-2xl"
            >
                {previewChallan && (
                    <div className="space-y-4 text-xs">
                        {/* Hero Status & KPI Banner */}
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-50 via-neutral-50/80 to-brand-50/40 border border-neutral-200/80 flex items-center justify-between shadow-xs">
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    Challan Status
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            previewChallan.status === 'ISSUED'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                previewChallan.status === 'ISSUED'
                                                    ? 'bg-emerald-500 animate-pulse'
                                                    : 'bg-rose-500'
                                            }`}
                                        />
                                        {previewChallan.status}
                                    </span>
                                    {previewChallan.created_at && (
                                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-neutral-400" />
                                            {new Date(previewChallan.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right space-y-0.5">
                                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    Total Leather Allocated
                                </div>
                                <div className="flex items-baseline justify-end gap-1.5">
                                    <span className="text-xl font-black text-neutral-900 font-mono tracking-tight">
                                        {Number(previewChallan.total_sqft).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/70 px-1.5 py-0.5 rounded">
                                        SQ. FT
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cutter & Material Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border border-neutral-200/80 bg-white shadow-xs space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold text-neutral-400 tracking-wider">
                                    <User className="w-3.5 h-3.5 text-brand-600" />
                                    <span>Assigned Cutter</span>
                                </div>
                                <div className="font-bold text-neutral-900 text-sm">
                                    {previewChallan.cutter?.name || 'N/A'}
                                </div>
                                <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-neutral-400" />
                                        {previewChallan.cutter?.phone || 'No phone'}
                                    </span>
                                    {previewChallan.cutter?.address && (
                                        <span className="text-neutral-400 text-[10.5px] uppercase truncate">
                                            • {previewChallan.cutter.address}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 rounded-xl border border-neutral-200/80 bg-white shadow-xs space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold text-neutral-400 tracking-wider">
                                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                                    <span>Leather Hide &amp; Variation</span>
                                </div>
                                <div className="font-bold text-neutral-900 text-sm truncate">
                                    {previewChallan.material?.name || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center text-[11px] font-semibold text-brand-800 bg-brand-50/80 border border-brand-200/70 px-2 py-0.5 rounded-md font-mono">
                                        {previewChallan.variant?.name || 'Standard'}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 uppercase">
                                        • Raw Hide
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cut Parts & Product Breakdown Table */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10.5px] uppercase font-bold text-neutral-500 tracking-wider">
                                    Cut Parts &amp; Product Breakdown
                                </span>
                                <span className="text-[11px] text-neutral-400 font-medium">
                                    {previewChallan.items?.length || 0} product lines
                                </span>
                            </div>
                            <div className="border border-neutral-200/90 rounded-xl overflow-hidden shadow-xs bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-neutral-50/90 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[9.5px] tracking-wider">
                                            <th className="py-2.5 px-2.5 text-center w-8">#</th>
                                            <th className="py-2.5 px-2 text-center w-14">Part No</th>
                                            <th className="py-2.5 px-2.5">Product Description</th>
                                            <th className="py-2.5 px-2 w-20">Code</th>
                                            <th className="py-2.5 px-2 text-right w-16">Qty</th>
                                            <th className="py-2.5 px-2 text-right w-20">Sq.Ft/Pc</th>
                                            <th className="py-2.5 px-3 text-right w-24">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {previewChallan.items?.map((item, i) => (
                                            <tr key={i} className="hover:bg-neutral-50/60 transition-colors">
                                                <td className="py-2.5 px-2.5 text-center text-neutral-400 font-mono text-[11px]">
                                                    {i + 1}
                                                </td>
                                                <td className="py-2.5 px-2 text-center">
                                                    <span className="font-mono text-[11px] font-bold text-neutral-800">
                                                        {item.product?.part_no || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-2.5 font-semibold text-neutral-900">
                                                    {item.product?.name || 'Product'}
                                                </td>
                                                <td className="py-2.5 px-2">
                                                    {item.product?.code ? (
                                                        <span className="font-mono text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                                            {item.product.code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-2 text-right font-bold font-mono text-neutral-900">
                                                    {item.quantity} <span className="text-[10px] font-normal text-neutral-400">pcs</span>
                                                </td>
                                                <td className="py-2.5 px-2 text-right font-mono text-neutral-600">
                                                    {Number(item.leather_sqft_per_pc).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-brand-800 font-mono">
                                                    {Number(item.total_sqft).toFixed(2)} <span className="text-[9.5px] font-normal text-neutral-400">sq.ft</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-neutral-50/90 border-t border-neutral-200 font-semibold text-neutral-800 text-[11px]">
                                            <td colSpan={4} className="py-2.5 px-3 text-right text-neutral-500 font-bold uppercase text-[9.5px]">
                                                Total Summary:
                                            </td>
                                            <td className="py-2.5 px-2 text-right font-mono font-bold text-neutral-900">
                                                {previewChallan.items?.reduce((sum, it) => sum + Number(it.quantity || 0), 0)} pcs
                                            </td>
                                            <td className="py-2.5 px-2"></td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-brand-900">
                                                {Number(previewChallan.total_sqft).toFixed(2)} sq.ft
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Notes if present */}
                        {previewChallan.notes && (
                            <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    <MessageSquare className="w-3 h-3 text-neutral-400" />
                                    <span>Notes / Instructions</span>
                                </div>
                                <p className="text-neutral-700 text-xs italic pl-4 border-l-2 border-brand-400">
                                    {previewChallan.notes}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3.5 border-t border-neutral-200">
                            {previewChallan.status === 'ISSUED' && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setCancelChallan(previewChallan)}
                                    className="gap-1.5"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Cancel &amp; Refund
                                </Button>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                                <a
                                    href={route('leather.challan.pdf', previewChallan.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 shadow-xs hover:shadow-sm transition-all"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download PDF
                                </a>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setPreviewChallan(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Cancel Challan & Refund Stock Modal */}
            <Modal
                isOpen={!!cancelChallan}
                onClose={() => setCancelChallan(null)}
                title="Cancel Challan & Refund Stock?"
            >
                <div className="space-y-4 text-sm">
                    <p className="text-neutral-600 text-xs">
                        Are you sure you want to cancel Challan{' '}
                        <strong className="text-neutral-900 font-bold">
                            #{cancelChallan?.challan_no}
                        </strong>
                        ?
                    </p>

                    <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 flex items-start gap-2.5 text-xs text-warning-800">
                        <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Automatic Stock Refund:</strong>
                            <div className="mt-0.5 text-[11px]">
                                {Number(cancelChallan?.total_sqft || 0).toFixed(2)} sq. ft will be immediately refunded back to the inventory of{' '}
                                <strong>{cancelChallan?.material?.name}</strong> (
                                {cancelChallan?.variant?.name || 'Standard Hide'}).
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setCancelChallan(null)}
                            disabled={isCancelling}
                        >
                            Nevermind
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Cancelling & Refunding...' : 'Yes, Cancel & Refund Stock'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
