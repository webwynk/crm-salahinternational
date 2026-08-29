import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Drawer from '@/Components/ui/Drawer';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Plus, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { BASE_UNITS } from '@/constants/units';
import { STANDARD_CATEGORIES } from '@/constants/categories';

export default function Index({ materials, categories = [], filters = {} }) {


    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [restockMaterial, setRestockMaterial] = useState(null);
    const [deleteMaterial, setDeleteMaterial] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryInput, setCustomCategoryInput] = useState('');

    const availableCategories = Array.from(new Set([...STANDARD_CATEGORIES, ...categories]));

    // Form for Adding Material
    const addForm = useForm({
        name: '',
        category: 'LEATHER',
        base_unit: 'pcs',
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

    const handleCloseDrawer = () => {
        setIsAddDrawerOpen(false);
        setIsCustomCategory(false);
        setCustomCategoryInput('');
        addForm.reset();
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('materials.store'), {
            onSuccess: () => {
                handleCloseDrawer();
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

    const handleDeleteConfirm = () => {
        if (!deleteMaterial) return;
        setIsDeleting(true);
        router.delete(route('materials.destroy', deleteMaterial.id), {
            onSuccess: () => {
                setDeleteMaterial(null);
            },
            onFinish: () => {
                setIsDeleting(false);
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
                    <Button variant="primary" onClick={() => setIsAddDrawerOpen(true)}>
                        <Plus className="w-4 h-4 mr-1.5" /> Add New Material
                    </Button>
                }
            />


            {/* Category filter chips */}
            {categories.length > 0 && (
                <FilterChips
                    options={categories.map((c) => ({ label: c, value: c }))}
                    value={selectedCategory}
                    onChange={handleCategoryFilter}
                    allLabel="All Categories"
                    className="mb-4"
                />
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
                emptyActionLabel="+ Add Material"
                onEmptyAction={() => setIsAddDrawerOpen(true)}
                renderRowActions={(row) => (
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestockMaterial(row)}
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restock
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-400 hover:text-danger-600 hover:bg-danger-50 px-2"
                            onClick={() => setDeleteMaterial(row)}
                            title="Delete Material"
                        >
                            <Trash2 className="w-4 h-4 text-danger-500" />
                        </Button>
                    </div>
                )}
            />

            {/* Add Material Drawer */}
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={handleCloseDrawer}
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

                    <div className="space-y-3">
                        <Select
                            label="Category"
                            required
                            value={isCustomCategory ? '__CUSTOM__' : addForm.data.category}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '__CUSTOM__') {
                                    setIsCustomCategory(true);
                                    addForm.setData('category', customCategoryInput.trim().toUpperCase());
                                } else {
                                    setIsCustomCategory(false);
                                    addForm.setData('category', val);
                                }
                            }}
                            error={!isCustomCategory ? addForm.errors.category : undefined}
                        >
                            {availableCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                            <option value="__CUSTOM__">+ Custom Category...</option>
                        </Select>

                        {isCustomCategory && (
                            <Input
                                label="Custom Category Name"
                                required
                                placeholder="e.g. PACKAGING, ZIPPER, FOAM, CANVAS"
                                value={customCategoryInput}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    setCustomCategoryInput(raw);
                                    addForm.setData('category', raw.toUpperCase());
                                }}
                                error={addForm.errors.category}
                                helperText="Enter category name (max 40 characters)"
                                autoFocus
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Select
                            label="Base Unit"
                            required
                            value={addForm.data.base_unit}
                            onChange={(e) => addForm.setData('base_unit', e.target.value)}
                            error={addForm.errors.base_unit}
                        >
                            {BASE_UNITS.map((u) => (
                                <option key={u.value} value={u.value}>
                                    {u.label}
                                </option>
                            ))}
                        </Select>
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
                        <Button type="button" variant="outline" onClick={handleCloseDrawer}>
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={Boolean(deleteMaterial)}
                onClose={() => !isDeleting && setDeleteMaterial(null)}
                title={`Delete Material: ${deleteMaterial?.name}`}
            >
                <div className="space-y-4 text-left">
                    <div className="p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-danger-900 space-y-1">
                            <p className="font-semibold">Are you sure you want to permanently delete this raw material?</p>
                            <p className="text-danger-700">
                                This action will permanently remove this material and its inventory records from the database.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Material Name:</span>
                            <strong className="text-neutral-900">{deleteMaterial?.name}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Category:</span>
                            <Badge variant="neutral">{deleteMaterial?.category}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Current Stock:</span>
                            <span className="tabular-nums font-bold text-neutral-800">
                                {parseFloat(deleteMaterial?.inventory?.quantity_on_hand || 0).toLocaleString()} {deleteMaterial?.base_unit}
                            </span>
                        </div>
                    </div>

                    <div className="pt-3 flex justify-end gap-3 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => setDeleteMaterial(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            isLoading={isDeleting}
                            onClick={handleDeleteConfirm}
                        >
                            Delete Material
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
