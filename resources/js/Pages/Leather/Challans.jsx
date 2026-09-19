import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import DataTable from '@/Components/ui/DataTable';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import {
    FileText,
    Scissors,
    Download,
    XCircle,
    Plus,
    Calendar,
    User,
    Layers,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';

export default function Challans({ challans, filters = {} }) {
    const { flash } = usePage().props;
    const [cancelChallan, setCancelChallan] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Auto-trigger PDF download if returning from newly created Challan
    useEffect(() => {
        if (flash?.download_challan_id) {
            window.open(route('leather.challan.pdf', flash.download_challan_id), '_blank');
        }
    }, [flash]);

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
                },
            }
        );
    };

    const columns = [
        {
            header: 'Challan #',
            accessor: 'challan_no',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="font-bold text-neutral-900 dark:text-white">
                        #{row.challan_no}
                    </span>
                </div>
            ),
        },
        {
            header: 'Date',
            accessor: 'created_at',
            render: (row) => (
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {new Date(row.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
            ),
        },
        {
            header: 'Assigned Cutter',
            accessor: 'cutter',
            render: (row) => (
                <div>
                    <div className="font-semibold text-neutral-900 dark:text-white text-xs">
                        {row.cutter?.name || 'N/A'}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {row.cutter?.phone || '-'}
                    </div>
                </div>
            ),
        },
        {
            header: 'Leather Hide & Variant',
            accessor: 'material',
            render: (row) => (
                <div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                        {row.material?.name || 'N/A'}
                    </div>
                    <div className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                        {row.variant?.name ? row.variant.name : 'Standard'}
                    </div>
                </div>
            ),
        },
        {
            header: 'Leather Issued',
            accessor: 'total_sqft',
            render: (row) => (
                <span className="font-bold text-neutral-900 dark:text-white text-xs">
                    {Number(row.total_sqft).toFixed(2)} sq. ft
                </span>
            ),
        },
        {
            header: 'Products',
            accessor: 'items_count',
            render: (row) => (
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {row.items_count} {row.items_count === 1 ? 'Product' : 'Products'}
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const isIssued = row.status === 'ISSUED';
                return (
                    <Badge variant={isIssued ? 'success' : 'danger'}>
                        {row.status}
                    </Badge>
                );
            },
        },
        {
            header: 'Actions',
            accessor: 'id',
            className: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <a
                        href={route('leather.challan.pdf', row.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        title="Download PDF"
                    >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                    </a>

                    {row.status === 'ISSUED' && (
                        <button
                            type="button"
                            onClick={() => setCancelChallan(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors"
                            title="Cancel Challan & Refund Stock"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Cutting Challans — Salah International" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <LeatherTabNav />

                <PageHeader
                    title="Leather Cutting Challans"
                    description="Track all leather issued to cutting masters, download official challan vouchers, or cancel and refund stock."
                    action={
                        <Link href={route('leather.challan.create')}>
                            <Button variant="primary" className="flex items-center gap-2 text-xs font-bold">
                                <Plus className="w-4 h-4" />
                                Make Challan
                            </Button>
                        </Link>
                    }
                />

                <DataTable
                    columns={columns}
                    data={challans.data}
                    pagination={challans}
                    initialSearch={filters.search}
                    searchPlaceholder="Search by challan #, cutter, or leather hide..."
                    onSearch={(val) => {
                        router.get(
                            route('leather.challans.index'),
                            { ...filters, search: val, page: 1 },
                            { preserveState: true, replace: true }
                        );
                    }}
                    emptyTitle="No cutting challans issued yet"
                    emptyDescription="Issue raw leather to your cutting masters to start tracking cut parts and inventory deductions."
                    emptyAction={
                        <Link href={route('leather.challan.create')}>
                            <Button variant="primary" size="sm" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Make First Challan
                            </Button>
                        </Link>
                    }
                />
            </div>

            {/* Cancel Challan & Refund Stock Modal */}
            <Modal
                isOpen={!!cancelChallan}
                onClose={() => setCancelChallan(null)}
                title="Cancel Challan & Refund Stock?"
            >
                <div className="space-y-4 text-sm">
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Are you sure you want to cancel Challan{' '}
                        <strong className="text-neutral-900 dark:text-white font-bold">
                            #{cancelChallan?.challan_no}
                        </strong>
                        ?
                    </p>

                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Automatic Stock Refund:</strong>
                            <div className="mt-0.5">
                                {Number(cancelChallan?.total_sqft || 0).toFixed(2)} sq. ft will be immediately refunded back to the inventory of{' '}
                                <strong>{cancelChallan?.material?.name}</strong> (
                                {cancelChallan?.variant?.name || 'Standard'}).
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCancelChallan(null)}
                            disabled={isCancelling}
                        >
                            Nevermind
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
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
