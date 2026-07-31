import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { Plus, Eye, FileText, Download, UserCheck, Package } from 'lucide-react';

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
                <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                    {row.assignment_no}
                </span>
            ),
        },
        {
            header: 'Product Definition',
            accessor: 'product',
            render: (row) => (
                <div>
                    <span className="font-semibold text-neutral-900 block">{row.product?.name}</span>
                    <span className="text-xs text-neutral-500 font-mono">Code: {row.product?.code}</span>
                </div>
            ),
        },
        {
            header: 'Assigned Artisan',
            accessor: 'labour',
            render: (row) => (
                <div>
                    <span className="font-semibold text-neutral-900 block">{row.labour?.name}</span>
                    <span className="text-xs text-neutral-500">{row.labour?.phone}</span>
                </div>
            ),
        },
        {
            header: 'Quantity',
            accessor: 'quantity',
            render: (row) => <span className="font-bold text-neutral-900">{row.quantity} Pcs</span>,
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const statusVariants = {
                    ASSIGNED: 'brand',
                    IN_PROGRESS: 'warning',
                    COMPLETED: 'success',
                    CANCELLED: 'danger',
                };
                return <Badge variant={statusVariants[row.status] || 'neutral'}>{row.status}</Badge>;
            },
        },
        {
            header: 'Assigned Date',
            accessor: 'created_at',
            render: (row) => (
                <span className="text-xs text-neutral-500">
                    {new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            ),
        },
    ];

    const statuses = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    return (
        <AppLayout>
            <Head title="Work Order Assignments - Leather CRM" />

            <PageHeader
                title="Work Order Assignments"
                description="Assign products to labour artisans with automatic stock deduction and PDF work order generation"
                action={
                    <Link href={route('assignments.create')}>
                        <Button variant="primary">
                            <Plus className="w-4 h-4 mr-1.5" /> + New Assignment Work Order
                        </Button>
                    </Link>
                }
            />

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                <button
                    onClick={() => handleStatusFilter('')}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        !selectedStatus
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                    All Statuses
                </button>
                {statuses.map((st) => (
                    <button
                        key={st}
                        onClick={() => handleStatusFilter(st)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                            selectedStatus === st
                                ? 'bg-brand-500 text-white'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        {st}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={assignments.data}
                pagination={assignments}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search by Work Order #, product name/code, or artisan..."
                emptyTitle="No work order assignments created yet"
                emptyDescription="Assign products to workers with auto-stock deduction and PDF generation."
                emptyActionLabel="+ New Assignment Work Order"
                onEmptyAction={() => router.visit(route('assignments.create'))}
                renderRowActions={(row) => (
                    <div className="flex items-center justify-end gap-2">
                        <select
                            value={row.status}
                            disabled={row.status === 'COMPLETED' || row.status === 'CANCELLED'}
                            onChange={(e) => router.patch(route('assignments.status', row.id), { status: e.target.value })}
                            className="text-xs border border-neutral-300 rounded px-2 py-1 bg-white cursor-pointer disabled:bg-neutral-100 disabled:cursor-not-allowed"
                        >
                            {statuses.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                        <Link href={route('assignments.show', row.id)}>
                            <button className="p-1.5 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded" title="View details">
                                <Eye className="w-4 h-4" />
                            </button>
                        </Link>
                        <a href={route('assignments.pdf', row.id)} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm">
                                <FileText className="w-3.5 h-3.5 mr-1" /> PDF Work Order
                            </Button>
                        </a>
                    </div>
                )}
            />
        </AppLayout>
    );
}
