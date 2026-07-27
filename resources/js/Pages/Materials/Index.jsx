import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Drawer from '@/Components/ui/Drawer';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import { Plus, RefreshCw, Layers, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Index({ materials, categories = [], filters = {} }) {
    const { props } = usePage();
    const isAdmin = props.auth?.user?.is_admin;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [restockMaterial, setRestockMaterial] = useState(null);

    // Form for Adding Material
    const addForm = useForm({
        name: '',
        category: 'LEATHER',
        base_unit: 'cm2',
        reorder_level: '1000',
        initial_stock: '5000',
    });

    // Form for Restocking Stock
    const restockForm = useForm({
        add_quantity: '',
        note: '',
    });

    const handleSearch = (val) => {
        setSearch(val);
        router.get(route('materials.index'), { ...filters, search: val, page: 1 }, { preserveState: true, replace: true });
    };

    const handleCategoryFilter = (cat) => {
        setSelectedCategory(cat);
        router.get(route('materials.index'), { ...filters, category: cat, page: 1 }, { preserveState: true, replace: true });
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('materials.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddDrawerOpen(false);
            },
        });
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (!restockMaterial) return;

        restockForm.post(route('materials.restock', restockMaterial.id), {
            onSuccess: () => {
                restockForm.reset();
                setRestockMaterial(null);
            },
        });
    };

    const columns = [
        {
            header: 'Material Name',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-bold text-neutral-900 block">{row.name}</span>
                    <span className="text-xs text-neutral-500">Base Unit: {row.base_unit}</span>
                </div>
            ),
        },
        {
            header: 'Category',
            accessor: 'category',
            render: (row) => <Badge variant="neutral">{row.category}</Badge>,
        },
        {
            header: 'Stock On Hand',
            accessor: 'inventory',
            render: (row) => {
                const stock = parseFloat(row.inventory?.quantity_on_hand || 0);
                const reorder = parseFloat(row.reorder_level || 0);
                const isLow = stock <= reorder;

                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isLow ? 'text-danger-700' : 'text-neutral-900'}`}>
                                {stock.toLocaleString()} {row.base_unit}
                            </span>
                            {isLow && (
                                <Badge variant="danger">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                                </Badge>
                            )}
                        </div>
                        <span className="text-[11px] text-neutral-400">Reorder threshold: {reorder.toLocaleString()} {row.base_unit}</span>
                    </div>
                );
            },
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
            <Head title="Materials Master & Stock - Leather CRM" />

            <PageHeader
                title="Materials Master & Stock Inventory"
                description="Track raw materials, stock on hand, and replenishment thresholds"
                action={
                    isAdmin ? (
                        <Button variant="primary" onClick={() => setIsAddDrawerOpen(true)}>
                            <Plus className="w-4 h-4 mr-1.5" /> Add New Material
                        </Button>
                    ) : (
                        <div title="Only Admins can add or restock materials">
                            <Button variant="secondary" disabled>
                                <ShieldAlert className="w-4 h-4 mr-1.5" /> Admin Access Only
                            </Button>
                        </div>
                    )
                }
            />

            {!isAdmin && (
                <Alert variant="info" className="mb-4">
                    You are logged in as <strong>Staff</strong>. You can view raw material stock levels, but only <strong>Admin</strong> users can add new materials or restock inventory.
                </Alert>
            )}

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

            {/* Datatable */}
            <DataTable
                columns={columns}
                data={materials.data}
                pagination={materials}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search material by name..."
                emptyTitle="No raw materials added yet"
                emptyDescription="Add leather hides, threads, glues, and hardware to your master list."
                emptyActionLabel={isAdmin ? "+ Add Material" : null}
                onEmptyAction={() => setIsAddDrawerOpen(true)}
                renderRowActions={(row) => (
                    isAdmin ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestockMaterial(row)}
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restock
                        </Button>
                    ) : null
                )}
            />

            {/* Add Material Drawer */}
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Add New Raw Material"
                subtitle="Define a new raw material master record for inventory tracking"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <Input
                        label="Material Name"
                        required
                        placeholder="e.g. Full-Grain Calfskin Leather"
                        value={addForm.data.name}
                        onChange={(e) => addForm.setData('name', e.target.value)}
                        error={addForm.errors.name}
                    />

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
                        <select
                            value={addForm.data.category}
                            onChange={(e) => addForm.setData('category', e.target.value)}
                            className="w-full text-base px-3.5 py-2.5 rounded-sm border border-neutral-300 bg-white"
                        >
                            <option value="LEATHER">LEATHER</option>
                            <option value="THREAD">THREAD</option>
                            <option value="GLUE">GLUE</option>
                            <option value="HARDWARE">HARDWARE</option>
                            <option value="LINING">LINING</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Base Unit"
                            required
                            placeholder="cm2, m, g, pcs"
                            value={addForm.data.base_unit}
                            onChange={(e) => addForm.setData('base_unit', e.target.value)}
                            error={addForm.errors.base_unit}
                        />
                        <Input
                            label="Reorder Threshold"
                            type="number"
                            required
                            value={addForm.data.reorder_level}
                            onChange={(e) => addForm.setData('reorder_level', e.target.value)}
                            error={addForm.errors.reorder_level}
                        />
                    </div>

                    <Input
                        label="Initial Stock Quantity On Hand"
                        type="number"
                        required
                        value={addForm.data.initial_stock}
                        onChange={(e) => addForm.setData('initial_stock', e.target.value)}
                        error={addForm.errors.initial_stock}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsAddDrawerOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={addForm.processing}>
                            Save Material
                        </Button>
                    </div>
                </form>
            </Drawer>

            {/* Restock Modal */}
            <Modal
                isOpen={Boolean(restockMaterial)}
                onClose={() => setRestockMaterial(null)}
                title={`Restock Stock: ${restockMaterial?.name}`}
            >
                <form onSubmit={handleRestockSubmit} className="space-y-4">
                    <p className="text-xs text-neutral-500">
                        Current Stock On Hand:{' '}
                        <strong className="text-neutral-900">
                            {restockMaterial?.inventory?.quantity_on_hand} {restockMaterial?.base_unit}
                        </strong>
                    </p>

                    <Input
                        label={`Replenish Quantity (${restockMaterial?.base_unit})`}
                        type="number"
                        step="0.001"
                        required
                        placeholder="e.g. 5000"
                        value={restockForm.data.add_quantity}
                        onChange={(e) => restockForm.setData('add_quantity', e.target.value)}
                        error={restockForm.errors.add_quantity}
                    />

                    <Input
                        label="Restock Reference / Note"
                        placeholder="e.g. Supplier Invoice #INV-8891"
                        value={restockForm.data.note}
                        onChange={(e) => restockForm.setData('note', e.target.value)}
                        error={restockForm.errors.note}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setRestockMaterial(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={restockForm.processing}>
                            Confirm Restock
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
