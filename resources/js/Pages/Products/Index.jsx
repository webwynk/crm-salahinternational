import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import StatusPill from '@/Components/ui/StatusPill';
import MobileFAB from '@/Components/ui/MobileFAB';
import { Plus, Eye, Edit3, Image as ImageIcon } from 'lucide-react';

export default function Index({ products, categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [sort, setSort] = useState({
        column: filters.sort || 'created_at',
        direction: filters.direction || 'desc',
    });

    const navigate = (params) =>
        router.get(route('products.index'), { ...filters, page: 1, ...params }, { preserveState: true, replace: true });

    const handleSearch     = (val) => { setSearch(val);             navigate({ search: val }); };
    const handleCategory   = (cat) => { setSelectedCategory(cat);   navigate({ category: cat }); };
    const handleSort       = (col) => {
        const dir = sort.column === col && sort.direction === 'asc' ? 'desc' : 'asc';
        setSort({ column: col, direction: dir });
        navigate({ sort: col, direction: dir });
    };
    const handleClearFilters = () => {
        setSearch(''); setSelectedCategory('');
        router.get(route('products.index'), {}, { preserveState: true, replace: true });
    };

    const columns = [
        {
            header: 'Product',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    {row.image_url ? (
                        <img
                            src={row.image_url}
                            alt={row.name}
                            className="w-12 h-12 rounded-md object-cover border border-neutral-200 shrink-0 bg-neutral-0"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-400">
                            <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                    )}
                    <div className="min-w-0">
                        <span className="font-semibold text-neutral-900 block truncate">{row.name}</span>
                        <span className="font-sans font-bold text-xs text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/80 inline-block mt-0.5">
                            {row.code}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Category',
            accessor: 'category',
            sortable: true,
            render: (row) => (
                <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                    {row.category || 'General'}
                </span>
            ),
        },
        {
            header: 'BOM Items',
            accessor: 'materials',
            numeric: true,
            render: (row) => (
                <span className="text-xs font-semibold text-neutral-700 tabular-nums">
                    {row.materials?.length ?? 0} <span className="font-normal text-neutral-400">specs</span>
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row) => <StatusPill status={row.is_active ? 'ACTIVE' : 'INACTIVE'} />,
        },
    ];

    return (
        <AppLayout>
            <Head title="Products & BOM — Leather CRM" />

            <PageHeader
                title="Products & Bill of Materials"
                description="Manage leather goods definitions, code master, and crafting specifications"
                action={
                    <Link href={route('products.create')}>
                        <Button variant="primary">
                            <Plus className="w-4 h-4" />
                            New Product
                        </Button>
                    </Link>
                }
            />

            {/* Category filter chips */}
            {categories.length > 0 && (
                <FilterChips
                    options={categories.map((c) => ({ label: c, value: c }))}
                    value={selectedCategory}
                    onChange={handleCategory}
                    allLabel="All Categories"
                    className="mb-4"
                />
            )}

            <DataTable
                columns={columns}
                data={products.data}
                pagination={products}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search by product code or name…"
                activeSort={sort}
                onSort={handleSort}
                filters={{ category: selectedCategory }}
                onClearFilters={handleClearFilters}
                emptyTitle="No products defined yet"
                emptyDescription="Create your first leather product definition with Bill of Materials."
                emptyActionLabel="Add Product"
                onEmptyAction={() => router.visit(route('products.create'))}
                renderRowActions={(row) => (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('products.show', row.id)}>
                            <button className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="View details">
                                <Eye className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                        </Link>
                        <Link href={route('products.edit', row.id)}>
                            <button className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="Edit specifications">
                                <Edit3 className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                        </Link>
                    </div>
                )}
            />

            {/* Mobile Quick Action FAB */}
            <MobileFAB href={route('products.create')} label="Add Product" />
        </AppLayout>
    );
}
