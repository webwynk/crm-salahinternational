import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { Plus, Eye, Edit3, Trash2, Package } from 'lucide-react';

export default function Index({ products, categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [sort, setSort] = useState({ column: filters.sort || 'created_at', direction: filters.direction || 'desc' });

    const handleSearch = (val) => {
        setSearch(val);
        router.get(route('products.index'), { ...filters, search: val, page: 1 }, { preserveState: true, replace: true });
    };

    const handleCategoryFilter = (cat) => {
        setSelectedCategory(cat);
        router.get(route('products.index'), { ...filters, category: cat, page: 1 }, { preserveState: true, replace: true });
    };

    const handleSort = (accessor) => {
        const direction = sort.column === accessor && sort.direction === 'asc' ? 'desc' : 'asc';
        setSort({ column: accessor, direction });
        router.get(route('products.index'), { ...filters, sort: accessor, direction }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        router.get(route('products.index'), {}, { preserveState: true, replace: true });
    };

    const columns = [
        {
            header: 'Product Code',
            accessor: 'code',
            sortable: true,
            render: (row) => (
                <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded border border-brand-200">
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
                    {row.description && <span className="text-xs text-neutral-500 truncate max-w-xs block">{row.description}</span>}
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
            header: 'BOM Items',
            accessor: 'materials',
            render: (row) => (
                <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                    {row.materials?.length || 0} specifications
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
            <Head title="Products & BOM - Leather CRM" />

            <PageHeader
                title="Products & Bill of Materials (BOM)"
                description="Manage leather goods definitions, code master, and crafting specifications"
                action={
                    <Link href={route('products.create')}>
                        <Button variant="primary">
                            <Plus className="w-4 h-4 mr-1.5" /> + New Product
                        </Button>
                    </Link>
                }
            />

            {/* Category Chips Bar */}
            {categories.length > 0 && (
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                    <button
                        onClick={() => handleCategoryFilter('')}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                            !selectedCategory
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryFilter(cat)}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                                selectedCategory === cat
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Datatable with 10 UI states */}
            <DataTable
                columns={columns}
                data={products.data}
                pagination={products}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search product by code or name (e.g. WAL-BF-001)..."
                activeSort={sort}
                onSort={handleSort}
                onClearFilters={handleClearFilters}
                emptyTitle="No products defined yet"
                emptyDescription="Create your first leather product definition with Bill of Materials."
                emptyActionLabel="+ Add Product"
                onEmptyAction={() => router.visit(route('products.create'))}
                renderRowActions={(row) => (
                    <div className="flex items-center justify-end gap-2">
                        <Link href={route('products.show', row.id)}>
                            <button className="p-1.5 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded">
                                <Eye className="w-4 h-4" />
                            </button>
                        </Link>
                        <Link href={route('products.edit', row.id)}>
                            <button className="p-1.5 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded">
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                )}
            />
        </AppLayout>
    );
}
