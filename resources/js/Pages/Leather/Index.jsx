import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
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
import SlowNetworkBanner from '@/Components/ui/SlowNetworkBanner';
import useInertiaLoading from '@/hooks/useInertiaLoading';
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
    Scissors,
    PlusCircle,
    X,
} from 'lucide-react';
import { LEATHER_UNITS } from '@/constants/leatherUnits';

export default function Index({ materials, categories = [], filters = {} }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin ?? false;

    const { isLoading, slowNetwork } = useInertiaLoading();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

    // UI Drawer and Modal States
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [addVariantMaterial, setAddVariantMaterial] = useState(null);
    const [restockVariant, setRestockVariant] = useState(null);
    const [deleteMaterial, setDeleteMaterial] = useState(null);
    const [deleteVariant, setDeleteVariant] = useState(null);
    const [hasVariations, setHasVariations] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

    // Initial Form State for New Leather Hide (Supports Simple & Multi-Variant)
    const addForm = useForm({
        name: '',
        category: '',
        base_unit: 'sq_ft',
        reorder_level: '50',
        initial_stock: '0',
        variants: [
            { name: 'Standard', sku: '', reorder_level: '50', initial_stock: '0' },
        ],
    });

    // Form for Adding a New Variant to Existing Leather
    const newVariantForm = useForm({
        name: '',
        sku: '',
        reorder_level: '50',
        initial_stock: '0',
    });

    // Form for Restocking a Specific Variant
    const restockForm = useForm({
        add_quantity: '',
        note: '',
    });

    const handleSearch = (val) => {
        setSearch(val);
        router.get(route('leather.index'), { ...filters, search: val, page: 1 }, { preserveState: true, replace: true });
    };

    const handleCategoryFilter = (cat) => {
        setSelectedCategory(cat);
        router.get(route('leather.index'), { ...filters, category: cat, page: 1 }, { preserveState: true, replace: true });
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
            { name: '', sku: '', reorder_level: '50', initial_stock: '0' },
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
        setHasVariations(false);
        addForm.reset();
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();

        addForm.transform((data) => ({
            name: data.name,
            category: data.category,
            base_unit: data.base_unit || 'sq_ft',
            is_leather: true,
            ...(hasVariations ? {
                variants: data.variants,
            } : {
                reorder_level: data.reorder_level,
                initial_stock: data.initial_stock,
                variants: [],
            }),
        }));

        addForm.post(route('leather.store'), {
            onSuccess: () => {
                handleCloseDrawer();
            },
        });
    };

    const handleCreateVariantSubmit = (e) => {
        e.preventDefault();
        if (!addVariantMaterial) return;

        newVariantForm.post(route('leather.variants.store', addVariantMaterial.id), {
            onSuccess: () => {
                newVariantForm.reset();
                setAddVariantMaterial(null);
            },
        });
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (!restockVariant) return;

        restockForm.post(route('leather.variants.restock', restockVariant.id), {
            onSuccess: () => {
                restockForm.reset();
                setRestockVariant(null);
            },
        });
    };

    const handleDeleteVariantConfirm = () => {
        if (!deleteVariant) return;
        setIsDeleting(true);

        router.delete(route('leather.variants.destroy', deleteVariant.id), {
            onSuccess: () => {
                setDeleteVariant(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleDeleteMaterialConfirm = () => {
        if (!deleteMaterial) return;
        setIsDeleting(true);

        router.delete(route('leather.destroy', deleteMaterial.id), {
            onSuccess: () => {
                setDeleteMaterial(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const items = materials?.data || [];
    const totalMaterialsCount = materials?.total ?? items.length;

    return (
        <AppLayout>
            <Head title="Leather & Hide Inventory - Leather CRM" />

            <PageHeader
                title="Leather Hide Master"
                description="Manage leather stock, multi-variation hide grades, and replenish inventory balances"
                action={
                    isAdmin ? (
                        <Button variant="primary" onClick={() => setIsAddDrawerOpen(true)}>
                            <Plus className="w-4 h-4 mr-1.5" /> Add Leather Hide
                        </Button>
                    ) : null
                }
            />

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search leather by name, category, or SKU..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-neutral-0 placeholder-neutral-400"
                    />
                </div>

                <FilterChips
                    options={categories}
                    value={selectedCategory}
                    onChange={handleCategoryFilter}
                    allLabel="All Categories"
                />
            </div>

            {/* Main Materials Table */}
            {items.length === 0 ? (
                <EmptyState
                    icon={Scissors}
                    title="No leather stock found"
                    description={
                        search || selectedCategory
                            ? 'No leather hides match your active search or category filters.'
                            : 'Get started by creating your first leather hide master and stock variations.'
                    }
                    action={
                        isAdmin ? (
                            <Button variant="primary" onClick={() => setIsAddDrawerOpen(true)}>
                                <Plus className="w-4 h-4 mr-1.5" /> Add Leather Hide
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <div className={`bg-neutral-0 rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden transition-opacity duration-200 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Leather & Specs</th>
                                    <th className="px-4 py-3">Variations</th>
                                    <th className="px-4 py-3">Total Stock Balance</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {items.map((material) => {
                                    const variants = material.variants || [];
                                    const variantCount = variants.length;
                                    const isExpanded = Boolean(expandedRows[material.id]);

                                    const totalStock = variants.reduce(
                                        (sum, v) => sum + parseFloat(v.inventory?.quantity_on_hand || 0),
                                        0
                                    );

                                    const hasLowStockVariant = variants.some(
                                        (v) =>
                                            parseFloat(v.inventory?.quantity_on_hand || 0) <=
                                            parseFloat(v.reorder_level || 0)
                                    );

                                    return (
                                        <React.Fragment key={material.id}>
                                            <tr className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRow(material.id)}
                                                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4 text-brand-600" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                        </button>

                                                        <div className="p-2.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 shrink-0">
                                                            <Scissors className="w-4 h-4" />
                                                        </div>

                                                        <div>
                                                            <div className="font-bold text-neutral-900 text-sm">
                                                                {material.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge variant="neutral" size="sm">
                                                                    {material.category}
                                                                </Badge>
                                                                <span className="text-[11px] text-neutral-500 font-medium">
                                                                    Base Unit: <strong className="text-neutral-700">{material.base_unit}</strong>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRow(material.id)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                                                    >
                                                        <Layers className="w-3.5 h-3.5 text-neutral-500" />
                                                        <span>{variantCount} {variantCount === 1 ? 'Variation' : 'Variations'}</span>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold text-sm font-sans tabular-nums ${hasLowStockVariant ? 'text-danger-700' : 'text-neutral-900'}`}>
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
                                                        {isAdmin && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setAddVariantMaterial(material)}
                                                                className="text-xs"
                                                            >
                                                                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Variation
                                                            </Button>
                                                        )}
                                                        {isAdmin && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-neutral-200 bg-neutral-0 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 hover:border-danger-300 transition-all shadow-xs cursor-pointer"
                                                                onClick={() => setDeleteMaterial(material)}
                                                                title="Delete Entire Leather Type"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-danger-500" />
                                                            </button>
                                                        )}
                                                        {!isAdmin && (
                                                            <span className="text-[11px] text-neutral-400 italic">Read only</span>
                                                        )}
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
                                                                {isAdmin && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setAddVariantMaterial(material)}
                                                                        className="text-xs text-brand-600 hover:text-brand-700"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Variation
                                                                    </Button>
                                                                )}
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
                                                                                <td className="px-4 py-2.5 font-sans text-[11px] text-neutral-500 font-medium">
                                                                                    {variant.sku || '—'}
                                                                                </td>
                                                                                <td className="px-4 py-2.5">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`font-bold tabular-nums font-sans ${isLow ? 'text-danger-700' : 'text-neutral-900'}`}>
                                                                                            {stock.toLocaleString()} {material.base_unit}
                                                                                        </span>
                                                                                        {isLow && (
                                                                                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-danger-100 text-danger-700 border border-danger-200">
                                                                                                Low Stock
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-2.5 tabular-nums text-neutral-500 font-sans">
                                                                                    {reorder.toLocaleString()} {material.base_unit}
                                                                                </td>
                                                                                <td className="px-4 py-2.5 text-right">
                                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                                        {isAdmin && (
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
                                                                                        )}
                                                                                        {isAdmin && variantCount > 1 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setDeleteVariant({
                                                                                                    ...variant,
                                                                                                    materialName: material.name,
                                                                                                })}
                                                                                                className="p-1 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                                                                                                title="Delete this variation"
                                                                                            >
                                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        )}
                                                                                        {!isAdmin && (
                                                                                            <span className="text-[10px] text-neutral-400 italic">View only</span>
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
                </div>
            )}

            {/* 1. ADD NEW LEATHER HIDE DRAWER */}
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={handleCloseDrawer}
                title="Add New Leather Hide"
                subtitle="Create a new leather hide master specification with optional variations"
                size="lg"
            >
                <form onSubmit={handleAddSubmit} className="space-y-6">
                    {/* 1. Master Specifications Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                            <Scissors className="w-4 h-4 text-brand-600" />
                            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                                1. Leather Master Specifications
                            </h4>
                        </div>

                        <Input
                            label="Leather Hide Name"
                            required
                            placeholder="e.g. Full-Grain Calfskin Leather, Cow Hunter, Nappa"
                            value={addForm.data.name}
                            onChange={(e) => addForm.setData('name', e.target.value)}
                            error={addForm.errors.name}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Input
                                    label="Category"
                                    required
                                    placeholder="e.g. Vegetable Tanned, Pull-Up, Nappa, Suede"
                                    value={addForm.data.category}
                                    onChange={(e) => addForm.setData('category', e.target.value)}
                                    error={addForm.errors.category}
                                    list="leather-categories-list"
                                />
                                {categories && categories.length > 0 && (
                                    <datalist id="leather-categories-list">
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                )}
                            </div>

                            <Select
                                label="Base Measurement Unit"
                                required
                                value={addForm.data.base_unit}
                                onChange={(e) => addForm.setData('base_unit', e.target.value)}
                                error={addForm.errors.base_unit}
                            >
                                {LEATHER_UNITS.map((u) => (
                                    <option key={u.value} value={u.value}>
                                        {u.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* Standard Initial Inventory (Visible only in Simple Mode) */}
                        {!hasVariations && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-200/80">
                                <Input
                                    label="Reorder Alert Level"
                                    type="number"
                                    step="0.001"
                                    required={!hasVariations}
                                    placeholder="e.g. 50"
                                    value={addForm.data.reorder_level}
                                    onChange={(e) => addForm.setData('reorder_level', e.target.value)}
                                    error={addForm.errors.reorder_level}
                                    helperText="Alert when inventory drops below this quantity"
                                />
                                <Input
                                    label={`Initial Stock (${addForm.data.base_unit})`}
                                    type="number"
                                    step="0.001"
                                    required={!hasVariations}
                                    placeholder="e.g. 100"
                                    value={addForm.data.initial_stock}
                                    onChange={(e) => addForm.setData('initial_stock', e.target.value)}
                                    error={addForm.errors.initial_stock}
                                    helperText="Immediate starting warehouse balance"
                                />
                            </div>
                        )}
                    </div>

                    {/* Interactive Switch Card for Multi-Variation Stock Tracking */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                                    Multi-Variation Stock Tracking
                                </span>
                                <p className="text-[11px] text-neutral-500">
                                    Enable if this leather hide is stocked in multiple colors, thicknesses, or grades.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={hasVariations}
                                onClick={() => setHasVariations(!hasVariations)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                                    hasVariations ? 'bg-brand-600' : 'bg-neutral-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        hasVariations ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 2. Stock Variations & Quantities Section */}
                    {hasVariations && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-brand-600" />
                                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                                        2. Stock Variations & Quantities
                                    </h4>
                                </div>
                                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                                    {addForm.data.variants.length} {addForm.data.variants.length === 1 ? 'Variation' : 'Variations'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {addForm.data.variants.map((v, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-lg border border-neutral-200/90 bg-neutral-0 shadow-2xs space-y-3 relative group transition-all hover:border-neutral-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-bold">
                                                    {idx + 1}
                                                </span>
                                                Variation #{idx + 1}
                                            </span>
                                            {addForm.data.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariantRow(idx)}
                                                    className="p-1 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                                    title="Remove this variation"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Input
                                                label="Variation Name (e.g. Color / Grade / Thickness)"
                                                required
                                                placeholder="e.g. Midnight Black (1.6mm), Olive Green"
                                                value={v.name}
                                                onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.name`]}
                                            />
                                            <Input
                                                label="SKU Code (Optional)"
                                                placeholder="e.g. LTH-BLK-16"
                                                value={v.sku}
                                                onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.sku`]}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Input
                                                label={`Initial Stock (${addForm.data.base_unit})`}
                                                type="number"
                                                step="0.001"
                                                required
                                                placeholder="0"
                                                value={v.initial_stock}
                                                onChange={(e) => handleVariantChange(idx, 'initial_stock', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.initial_stock`]}
                                            />
                                            <Input
                                                label={`Reorder Level (${addForm.data.base_unit})`}
                                                type="number"
                                                step="0.001"
                                                required
                                                placeholder="50"
                                                value={v.reorder_level}
                                                onChange={(e) => handleVariantChange(idx, 'reorder_level', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.reorder_level`]}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Add Variation Dashed Button */}
                            <button
                                type="button"
                                onClick={handleAddVariantRow}
                                className="w-full mt-3 py-2.5 px-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-brand-500 bg-white hover:bg-brand-50/50 text-neutral-600 hover:text-brand-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all group shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            >
                                <div className="w-5 h-5 rounded-full bg-neutral-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                    <Plus className="w-3.5 h-3.5 text-neutral-600 group-hover:text-brand-600" />
                                </div>
                                <span>Add Another Variation</span>
                            </button>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button type="button" variant="outline" onClick={handleCloseDrawer}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={addForm.processing}>
                            {hasVariations ? 'Save Leather & Variations' : 'Save Leather Hide'}
                        </Button>
                    </div>
                </form>
            </Drawer>

            {/* 2. ADD VARIANT TO EXISTING LEATHER MODAL */}
            <Modal
                isOpen={Boolean(addVariantMaterial)}
                onClose={() => setAddVariantMaterial(null)}
                title={`Add Variation for ${addVariantMaterial?.name}`}
            >
                <form onSubmit={handleCreateVariantSubmit} className="space-y-4 text-left">
                    <Input
                        label="Variation Name (e.g. Color, Grade, Thickness)"
                        required
                        placeholder="e.g. Midnight Black (1.6mm), Olive Green, Tan"
                        value={newVariantForm.data.name}
                        onChange={(e) => newVariantForm.setData('name', e.target.value)}
                        error={newVariantForm.errors.name}
                        autoFocus
                    />

                    <Input
                        label="SKU / Item Code (Optional)"
                        placeholder="e.g. LTH-BLK-04"
                        value={newVariantForm.data.sku}
                        onChange={(e) => newVariantForm.setData('sku', e.target.value)}
                        error={newVariantForm.errors.sku}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label={`Reorder Level (${addVariantMaterial?.base_unit})`}
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

            {/* 3. VARIANT-SPECIFIC RESTOCK MODAL */}
            <Modal
                isOpen={Boolean(restockVariant)}
                onClose={() => setRestockVariant(null)}
                title={`Restock Variation: ${restockVariant?.name}`}
            >
                <form onSubmit={handleRestockSubmit} className="space-y-4 text-left">
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Leather Master:</span>
                            <strong className="text-neutral-900">{restockVariant?.materialName}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Variation:</span>
                            <strong className="text-brand-700 font-semibold">{restockVariant?.name}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Current Stock On Hand:</span>
                            <span className="tabular-nums font-bold text-neutral-900 font-sans">
                                {parseFloat(restockVariant?.inventory?.quantity_on_hand || 0).toLocaleString()} {restockVariant?.base_unit}
                            </span>
                        </div>
                    </div>

                    <Input
                        label={`Replenish Quantity (${restockVariant?.base_unit})`}
                        type="number"
                        step="0.001"
                        required
                        placeholder="e.g. 250"
                        value={restockForm.data.add_quantity}
                        onChange={(e) => restockForm.setData('add_quantity', e.target.value)}
                        error={restockForm.errors.add_quantity}
                        autoFocus
                    />

                    <Input
                        label="Restock Reference / Note"
                        placeholder="e.g. Supplier Batch #LTH-8890"
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

            {/* 4. DELETE VARIANT CONFIRMATION MODAL */}
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

            {/* 5. DELETE PARENT LEATHER CONFIRMATION MODAL */}
            <Modal
                isOpen={Boolean(deleteMaterial)}
                onClose={() => !isDeleting && setDeleteMaterial(null)}
                title={`Delete Leather: ${deleteMaterial?.name}`}
            >
                <div className="space-y-4 text-left">
                    <div className="p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-danger-900 space-y-1">
                            <p className="font-semibold">Are you sure you want to permanently delete this leather hide?</p>
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
                            Delete Leather
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* UI State #5 — Slow Network floating banner */}
            <SlowNetworkBanner visible={slowNetwork} />
        </AppLayout>
    );
}
