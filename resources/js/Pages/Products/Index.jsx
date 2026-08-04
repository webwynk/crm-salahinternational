import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { Plus, Eye, Edit3 } from 'lucide-react';

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
            header: 'Code',
            accessor: 'code',
            sortable: true,
            numeric: true,
            render: (row) => (
                <span className="font-mono font-bold text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded border border-brand-200/80 tabular-nums">
                    {row.code}
                </span>
            ),
        },
        {
            header: 'Product Name',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-semibold text-neutral-900 block">{row.name}</span>
                    {row.description && (
                        <span className="text-xs text-neutral-500 truncate max-w-xs block">{row.description}</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Category',
            accessor: 'category',
            sortable: true,
            render: (row) => <Badge variant="neutral">{row.category || 'General'}</Badge>,
        },
        {
            header: 'BOM',
            accessor: 'materials',
            numeric: true,
            render: (row) => (
                <span className="text-xs font-semibold text-neutral-600 tabular-nums">
                    {row.materials?.length ?? 0} <span className="font-normal text-neutral-400">items</span>
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row) => (
                <Badge variant={row.is_active ? 'success' : 'danger'}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
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

            {/* Category filter chips — shared component, replaces inline duplication */}
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
                            <button className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="View">
                                <Eye className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                        </Link>
                        <Link href={route('products.edit', row.id)}>
                            <button className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="Edit">
                                <Edit3 className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                        </Link>
                    </div>
                )}
            />
        </AppLayout>
    );
}
