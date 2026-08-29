import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Drawer from '@/Components/ui/Drawer';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import EmptyState from '@/Components/ui/EmptyState';
import {
    Plus,
    RefreshCw,
    AlertTriangle,
    Trash2,
    ChevronDown,
    ChevronRight,
    Search,
    Layers,
    Tag,
    Boxes,
    PlusCircle,
    X,
} from 'lucide-react';
import { BASE_UNITS } from '@/constants/units';
import { STANDARD_CATEGORIES } from '@/constants/categories';

export default function Index({ materials, categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    
    // UI Drawer and Modal States
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [addVariantMaterial, setAddVariantMaterial] = useState(null);
    const [restockVariant, setRestockVariant] = useState(null);
    const [deleteMaterial, setDeleteMaterial] = useState(null);
    const [deleteVariant, setDeleteVariant] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    const availableCategories = Array.from(new Set([...STANDARD_CATEGORIES, ...categories]));

    // Multi-Variant Initial Form State for New Material
    const addForm = useForm({
        name: '',
        category: 'LEATHER',
        base_unit: 'pcs',
        variants: [
            { name: 'Standard', sku: '', reorder_level: '100', initial_stock: '500' }
        ],
    });

    // Form for Adding a New Variant to Existing Material
    const newVariantForm = useForm({
        name: '',
        sku: '',
        reorder_level: '100',
        initial_stock: '0',
    });

    // Form for Restocking a Specific Variant
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

    const toggleRow = (materialId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [materialId]: !prev[materialId],
        }));
    };

    // Variant Row Builder Helpers in Add Drawer
    const handleAddVariantRow = () => {
        addForm.setData('variants', [
            ...addForm.data.variants,
            { name: '', sku: '', reorder_level: '100', initial_stock: '0' },
        ]);
    };

    const handleRemoveVariantRow = (index) => {
        if (addForm.data.variants.length <= 1) return;
        const updated = addForm.data.variants.filter((_, i) => i !== index);
        addForm.setData('variants', updated);
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...addForm.data.variants];
        updated[index][field] = value;
        addForm.setData('variants', updated);
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

    const handleCreateVariantSubmit = (e) => {
        e.preventDefault();
        if (!addVariantMaterial) return;

        newVariantForm.post(route('materials.variants.store', addVariantMaterial.id), {
            onSuccess: () => {
                newVariantForm.reset();
                setAddVariantMaterial(null);
            },
        });
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (!restockVariant) return;

        restockForm.post(route('materials.variants.restock', restockVariant.id), {
            onSuccess: () => {
                restockForm.reset();
                setRestockVariant(null);
            },
        });
    };

    const handleDeleteMaterialConfirm = () => {
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

    const handleDeleteVariantConfirm = () => {
        if (!deleteVariant) return;
        setIsDeleting(true);
        router.delete(route('materials.variants.destroy', deleteVariant.id), {
            onSuccess: () => {
                setDeleteVariant(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Materials Master & Stock Variations - Leather CRM" />

            <PageHeader
                title="Materials Master & Stock Variations"
                description="Manage raw materials and track independent stock levels for each variation (colors, sizes, finishes)"
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

            {/* Main Materials & Variant Table Container */}
            <div className="bg-neutral-0 border border-neutral-200 rounded-md overflow-hidden shadow-xs w-full">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by material name, variation color, or SKU..."
                            className="w-full text-sm pl-9 pr-3.5 py-2 border border-neutral-300 rounded-md bg-neutral-0 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>

                    {(search || selectedCategory) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setSelectedCategory('');
                                router.get(route('materials.index'), {}, { preserveState: true, replace: true });
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Table Records */}
                {materials.data.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            title="No raw materials found"
                            description="Add leather hides, hardware, zips, or threads to manage multi-variation stocks."
                            actionLabel="+ Add Raw Material"
                            onAction={() => setIsAddDrawerOpen(true)}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                <tr>
                                    <th className="w-10 px-3 py-3 text-center"></th>
                                    <th className="px-4 py-3">Material Master & Category</th>
                                    <th className="px-4 py-3">Variations Count</th>
                                    <th className="px-4 py-3">Total Stock On Hand</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                                {materials.data.map((material) => {
                                    const variants = material.variants || [];
                                    const variantCount = variants.length;
                                    const isExpanded = Boolean(expandedRows[material.id]);

                                    // Calculate aggregated stock across all variants
                                    const totalStock = variants.reduce((sum, v) => {
                                        return sum + parseFloat(v.inventory?.quantity_on_hand || 0);
                                    }, 0);

                                    // Check if any variant has low stock
                                    const hasLowStockVariant = variants.some((v) => {
                                        const stock = parseFloat(v.inventory?.quantity_on_hand || 0);
                                        const reorder = parseFloat(v.reorder_level || 0);
                                        return stock <= reorder;
                                    });

                                    return (
                                        <React.Fragment key={material.id}>
                                            {/* Parent Material Master Row */}
                                            <tr className="hover:bg-neutral-50/80 transition-colors group">
                                                <td className="px-3 py-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRow(material.id)}
                                                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
                                                        title={isExpanded ? 'Collapse Variations' : 'Expand Variations'}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4 text-brand-600" strokeWidth={2.5} />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" strokeWidth={2} />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 shrink-0">
                                                            <Boxes className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-neutral-900 block leading-tight">
                                                                {material.name}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="neutral" size="sm">
                                                                    {material.category}
                                                                </Badge>
                                                                <span className="text-[11px] text-neutral-400">
                                                                    Base Unit: <strong className="text-neutral-600">{material.base_unit}</strong>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRow(material.id)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                                                    >
                                                        <Layers className="w-3.5 h-3.5 text-neutral-500" />
                                                        <span>{variantCount} {variantCount === 1 ? 'Variation' : 'Variations'}</span>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold text-sm ${hasLowStockVariant ? 'text-danger-700' : 'text-neutral-900'}`}>
                                                            {totalStock.toLocaleString()} {material.base_unit}
                                                        </span>
                                                        {hasLowStockVariant && (
                                                            <Badge variant="danger" size="sm">
                                                                <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-neutral-400">Combined balance across variants</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setAddVariantMaterial(material)}
                                                            className="text-xs"
                                                        >
                                                            <PlusCircle className="w-3.5 h-3.5 mr-1" /> + Variation
                                                        </Button>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 hover:border-danger-300 transition-all shadow-xs"
                                                            onClick={() => setDeleteMaterial(material)}
                                                            title="Delete Entire Material"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-danger-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable Variations Ledger Sub-Table */}
                                            {isExpanded && (
                                                <tr className="bg-neutral-50/60 border-y border-neutral-200">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="bg-neutral-0 rounded-lg border border-neutral-200/80 shadow-xs overflow-hidden">
                                                            <div className="px-4 py-2.5 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                                                                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                                                                    Variations of {material.name} ({variantCount})
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setAddVariantMaterial(material)}
                                                                    className="text-xs text-brand-600 hover:text-brand-700"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Variation
                                                                </Button>
                                                            </div>

                                                            <table className="w-full text-left text-xs border-collapse">
                                                                <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                                                                    <tr>
                                                                        <th className="px-4 py-2">Variation / Color / Size</th>
                                                                        <th className="px-4 py-2">SKU Code</th>
                                                                        <th className="px-4 py-2">Stock On Hand</th>
                                                                        <th className="px-4 py-2">Reorder Level</th>
                                                                        <th className="px-4 py-2 text-right">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                                                                    {variants.map((variant) => {
                                                                        const stock = parseFloat(variant.inventory?.quantity_on_hand || 0);
                                                                        const reorder = parseFloat(variant.reorder_level || 0);
                                                                        const isLow = stock <= reorder;

                                                                        return (
                                                                            <tr key={variant.id} className="hover:bg-neutral-50/80 transition-colors">
                                                                                <td className="px-4 py-2.5">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Tag className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                                                                                        <strong className="text-neutral-900 text-xs">
                                                                                            {variant.name}
                                                                                        </strong>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">
                                                                                    {variant.sku || '—'}
                                                                                </td>
                                                                                <td className="px-4 py-2.5">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`font-bold tabular-nums ${isLow ? 'text-danger-700' : 'text-neutral-900'}`}>
                                                                                            {stock.toLocaleString()} {material.base_unit}
                                                                                        </span>
                                                                                        {isLow && (
                                                                                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-danger-100 text-danger-700 border border-danger-200">
                                                                                                Low Stock
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-2.5 tabular-nums text-neutral-500">
                                                                                    {reorder.toLocaleString()} {material.base_unit}
                                                                                </td>
                                                                                <td className="px-4 py-2.5 text-right">
                                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                                        <Button
                                                                                            variant="primary"
                                                                                            size="sm"
                                                                                            onClick={() => {
                                                                                                setRestockVariant({
                                                                                                    ...variant,
                                                                                                    materialName: material.name,
                                                                                                    base_unit: material.base_unit,
                                                                                                });
                                                                                            }}
                                                                                            className="h-7 text-xs px-2.5"
                                                                                        >
                                                                                            <RefreshCw className="w-3 h-3 mr-1" /> Restock
                                                                                        </Button>
                                                                                        {variantCount > 1 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setDeleteVariant({
                                                                                                    ...variant,
                                                                                                    materialName: material.name,
                                                                                                })}
                                                                                                className="p-1 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                                                                                title="Delete this variation"
                                                                                            >
                                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD MATERIAL DRAWER WITH MULTI-VARIANT BUILDER */}
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={handleCloseDrawer}
                title="Add New Raw Material & Variations"
                subtitle="Create a raw material and define its stock variations (colors, sizes, finishes)"
                size="xl"
            >
                <form onSubmit={handleAddSubmit} className="space-y-6">
                    {/* General Material Information */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                        <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                            1. Material Master Specifications
                        </h4>

                        <Input
                            label="Material Name"
                            required
                            placeholder="e.g. Full-Grain Calfskin Leather"
                            value={addForm.data.name}
                            onChange={(e) => addForm.setData('name', e.target.value)}
                            error={addForm.errors.name}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
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
                                        helperText="Max 40 characters"
                                        autoFocus
                                    />
                                )}
                            </div>

                            <Select
                                label="Base Measurement Unit"
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
                        </div>
                    </div>

                    {/* Multi-Variation Rows Section */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                            <div>
                                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                                    2. Stock Variations & Quantities
                                </h4>
                                <p className="text-[11px] text-neutral-500">
                                    Each variation manages its own independent stock on hand and reorder alert threshold.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddVariantRow}
                                className="text-xs text-brand-700 border-brand-300"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" /> Add Variation
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {addForm.data.variants.map((v, idx) => (
                                <div key={idx} className="p-3.5 bg-neutral-0 rounded-md border border-neutral-200 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-brand-600" /> Variation #{idx + 1}
                                        </span>
                                        {addForm.data.variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariantRow(idx)}
                                                className="text-neutral-400 hover:text-danger-600 p-1 rounded-md hover:bg-neutral-100 transition-colors"
                                                title="Remove variation"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <Input
                                            label="Variation Name"
                                            placeholder="e.g. Tan / Cognac, 20cm Brass"
                                            required
                                            value={v.name}
                                            onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                                        />
                                        <Input
                                            label="SKU Code"
                                            placeholder="e.g. LEA-TAN-01"
                                            value={v.sku}
                                            onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                                        />
                                        <Input
                                            label="Reorder Alert Level"
                                            type="number"
                                            step="0.001"
                                            required
                                            value={v.reorder_level}
                                            onChange={(e) => handleVariantChange(idx, 'reorder_level', e.target.value)}
                                        />
                                        <Input
                                            label={`Initial Stock (${addForm.data.base_unit})`}
                                            type="number"
                                            step="0.001"
                                            required
                                            value={v.initial_stock}
                                            onChange={(e) => handleVariantChange(idx, 'initial_stock', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button type="button" variant="outline" onClick={handleCloseDrawer}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={addForm.processing}>
                            Save Material & Variations
                        </Button>
                    </div>
                </form>
            </Drawer>

            {/* ADD VARIATION TO EXISTING MATERIAL MODAL */}
            <Modal
                isOpen={Boolean(addVariantMaterial)}
                onClose={() => setAddVariantMaterial(null)}
                title={`Add Variation to: ${addVariantMaterial?.name}`}
            >
                <form onSubmit={handleCreateVariantSubmit} className="space-y-4 text-left">
                    <p className="text-xs text-neutral-500">
                        Category: <strong className="text-neutral-800">{addVariantMaterial?.category}</strong> | Base Unit: <strong className="text-neutral-800">{addVariantMaterial?.base_unit}</strong>
                    </p>

                    <Input
                        label="Variation Name"
                        placeholder="e.g. Olive Green, 30cm Silver Nickel, 0.8mm Black"
                        required
                        value={newVariantForm.data.name}
                        onChange={(e) => newVariantForm.setData('name', e.target.value)}
                        error={newVariantForm.errors.name}
                    />

                    <Input
                        label="SKU / Article Code"
                        placeholder="e.g. LEA-GRN-02"
                        value={newVariantForm.data.sku}
                        onChange={(e) => newVariantForm.setData('sku', e.target.value)}
                        error={newVariantForm.errors.sku}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Reorder Threshold"
                            type="number"
                            step="0.001"
                            required
                            value={newVariantForm.data.reorder_level}
                            onChange={(e) => newVariantForm.setData('reorder_level', e.target.value)}
                            error={newVariantForm.errors.reorder_level}
                        />

                        <Input
                            label={`Initial Stock (${addVariantMaterial?.base_unit})`}
                            type="number"
                            step="0.001"
                            required
                            value={newVariantForm.data.initial_stock}
                            onChange={(e) => newVariantForm.setData('initial_stock', e.target.value)}
                            error={newVariantForm.errors.initial_stock}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button type="button" variant="outline" onClick={() => setAddVariantMaterial(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={newVariantForm.processing}>
                            Add Variation
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* VARIANT-SPECIFIC RESTOCK MODAL */}
            <Modal
                isOpen={Boolean(restockVariant)}
                onClose={() => setRestockVariant(null)}
                title={`Restock Variation: ${restockVariant?.name}`}
            >
                <form onSubmit={handleRestockSubmit} className="space-y-4 text-left">
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Material Master:</span>
                            <strong className="text-neutral-900">{restockVariant?.materialName}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Variation:</span>
                            <strong className="text-brand-700 font-semibold">{restockVariant?.name}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Current Stock On Hand:</span>
                            <span className="tabular-nums font-bold text-neutral-900">
                                {parseFloat(restockVariant?.inventory?.quantity_on_hand || 0).toLocaleString()} {restockVariant?.base_unit}
                            </span>
                        </div>
                    </div>

                    <Input
                        label={`Replenish Quantity (${restockVariant?.base_unit})`}
                        type="number"
                        step="0.001"
                        required
                        placeholder="e.g. 500"
                        value={restockForm.data.add_quantity}
                        onChange={(e) => restockForm.setData('add_quantity', e.target.value)}
                        error={restockForm.errors.add_quantity}
                        autoFocus
                    />

                    <Input
                        label="Restock Reference / Note"
                        placeholder="e.g. Supplier Batch #INV-4410"
                        value={restockForm.data.note}
                        onChange={(e) => restockForm.setData('note', e.target.value)}
                        error={restockForm.errors.note}
                    />

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button type="button" variant="outline" onClick={() => setRestockVariant(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={restockForm.processing}>
                            Confirm Restock
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* DELETE VARIANT CONFIRMATION MODAL */}
            <Modal
                isOpen={Boolean(deleteVariant)}
                onClose={() => !isDeleting && setDeleteVariant(null)}
                title={`Delete Variation: ${deleteVariant?.name}`}
            >
                <div className="space-y-4 text-left">
                    <div className="p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-danger-900 space-y-1">
                            <p className="font-semibold">Are you sure you want to delete this variation?</p>
                            <p className="text-danger-700">
                                This will remove variation '{deleteVariant?.name}' of '{deleteVariant?.materialName}' and its individual stock ledger.
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 flex justify-end gap-3 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => setDeleteVariant(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            isLoading={isDeleting}
                            onClick={handleDeleteVariantConfirm}
                        >
                            Delete Variation
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* DELETE PARENT MATERIAL CONFIRMATION MODAL */}
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
                                This will permanently remove '{deleteMaterial?.name}' and all of its associated variations and inventory records.
                            </p>
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
                            onClick={handleDeleteMaterialConfirm}
                        >
                            Delete Material
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
