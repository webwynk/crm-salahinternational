import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { Plus, Eye, FileText, Scissors } from 'lucide-react';

export default function Index({ assignments, filters = {} }) {
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
            render: (row) => (
                <Link href={route('assignments.show', row.id)} className="font-sans font-bold text-brand-700 hover:text-brand-900 underline text-xs">
                    {row.assignment_no}
                </Link>
            ),
        },
        {
            header: 'Product Target',
            accessor: 'product',
            render: (row) => (
                <div>
                    <span className="font-semibold text-neutral-900 block text-xs">{row.product?.name ?? '—'}</span>
                    <span className="text-[11px] text-neutral-500 font-sans">{row.product?.code ?? ''}</span>
                </div>
            ),
        },
        {
            header: 'Artisan Worker',
            accessor: 'labour',
            render: (row) => (
                <span className="text-xs text-neutral-700 font-medium">
                    {row.labour ? row.labour.name : '—'}
                </span>
            ),
        },
        {
            header: 'Target Qty',
            accessor: 'quantity',
            sortable: true,
            numeric: true,
            render: (row) => (
                <strong className="text-brand-700 text-xs font-sans tabular-nums">{row.quantity} Pcs</strong>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            render: (row) => {
                const variants = {
                    ASSIGNED: 'brand',
                    IN_PROGRESS: 'brand',
                    COMPLETED: 'success',
                    CANCELLED: 'danger',
                };
                return <Badge variant={variants[row.status] || 'neutral'} size="sm">{row.status}</Badge>;
            },
        },
        {
            header: 'Assigned Date',
            accessor: 'created_at',
            sortable: true,
            render: (row) => (
                <span className="text-xs text-neutral-500 font-sans">
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

    return (
        <AppLayout>
            <Head title="Work Order Assignments — Leather CRM" />

            <PageHeader
                title="Work Order Assignments"
                description="Track production assignments, deduct stock automatically, and print artisan job cards"
                action={
                    <Link href={route('assignments.create')}>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 mr-1.5" /> New Work Order
                        </Button>
                    </Link>
                }
            />

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
                searchPlaceholder="Search by Work Order #, product name, or artisan worker..."
                emptyTitle="No work orders found"
                emptyDescription="Assign your first product to an artisan worker to start tracking production."
                emptyActionLabel="New Work Order"
                onEmptyAction={() => router.get(route('assignments.create'))}
                renderRowActions={(row) => (
                    <div className="flex items-center gap-1.5 justify-end">
                        {row.status === 'ASSIGNED' ? (
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
                                className="text-xs border border-brand-300 rounded-md px-2 py-1 bg-brand-50/50 font-bold text-brand-800 hover:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-2xs transition-colors"
                            >
                                <option value="ASSIGNED">ASSIGNED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        ) : null}
                        <Link href={route('assignments.show', row.id)}>
                            <button className="p-1.5 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded cursor-pointer" title="View details">
                                <Eye className="w-4 h-4" />
                            </button>
                        </Link>
                        <a href={route('assignments.pdf', row.id)} target="_blank" rel="noreferrer" title="Download Full Work Order PDF">
                            <Button variant="outline" size="sm" className="text-xs">
                                <FileText className="w-3.5 h-3.5 mr-1" /> Work Order
                            </Button>
                        </a>
                        <a href={route('assignments.leather-pdf', row.id)} target="_blank" rel="noreferrer" title="Download Leather Cutting Voucher PDF">
                            <Button variant="secondary" size="sm" className="text-xs">
                                <Scissors className="w-3.5 h-3.5 mr-1 text-brand-700" /> Leather Slip
                            </Button>
                        </a>
                    </div>
                )}
            />
        </AppLayout>
    );
}
