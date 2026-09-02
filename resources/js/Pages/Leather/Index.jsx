import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Badge from '@/Components/ui/Badge';
import Card from '@/Components/ui/Card';
import Drawer from '@/Components/ui/Drawer';
import EmptyState from '@/Components/ui/EmptyState';
import FilterChips from '@/Components/ui/FilterChips';
import {
    Plus,
    Search,
    RotateCcw,
    Layers,
    ChevronDown,
    ChevronRight,
    Tag,
    Trash2,
    SlidersHorizontal,
    Boxes,
    AlertTriangle,
    ShieldCheck,
    Scissors,
    Sparkles,
    CheckCircle2,
    Gem,
    X,
} from 'lucide-react';
import { LEATHER_UNITS } from '@/constants/leatherUnits';

export default function Index({
    materials,
    categories = [],
    filters = {},
    kpis = { total_sq_ft: 0, total_variations: 0, total_tannages: 0, low_stock_count: 0 },
}) {
    // Search & Filter State
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [expandedRows, setExpandedRows] = useState({});

    // Drawers State
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [hasVariations, setHasVariations] = useState(false);

    const [restockVariant, setRestockVariant] = useState(null);
    const [editMaterial, setEditMaterial] = useState(null);

    // Add Leather Form
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

    // Restock Leather Form
    const restockForm = useForm({
        add_quantity: '',
        note: '',
    });

    // Edit Leather Master Form
    const editForm = useForm({
        name: '',
        category: '',
        base_unit: 'sq_ft',
        reorder_level: '50',
    });

    // Search Trigger
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('leather.index'), { ...filters, search, page: 1 }, { preserveState: true, replace: true });
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

    const handleOpenEdit = (material) => {
        setEditMaterial(material);
        editForm.setData({
            name: material.name,
            category: material.category,
            base_unit: material.base_unit || 'sq_ft',
            reorder_level: material.reorder_level || '50',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editMaterial) return;

        editForm.put(route('leather.update', editMaterial.id), {
            onSuccess: () => {
                setEditMaterial(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteVariant = (variant) => {
        if (confirm(`Are you sure you want to delete the variation '${variant.name}'? This action cannot be undone.`)) {
            router.delete(route('leather.variants.destroy', variant.id));
        }
    };

    const handleDeleteMaterial = (material) => {
        if (confirm(`Are you sure you want to delete the entire leather type '${material.name}' and all its variations? This cannot be undone.`)) {
            router.delete(route('leather.destroy', material.id));
        }
    };

    return (
        <AppLayout>
            <Head title="Leather Hides & Stock Management — Leather CRM" />

            <PageHeader
                title="Leather Hides & Stock Management"
                description="Manage raw leather hides, tannage types, color variations, and stock balances in Sq. Ft"
                action={
                    <Button variant="primary" size="sm" onClick={() => setIsAddDrawerOpen(true)}>
                        <Plus className="w-4 h-4 mr-1.5" /> Add Leather Hide
                    </Button>
                }
            />

            <div className="space-y-6">

                {/* 1. LEATHER METRICS KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-neutral-200/90 shadow-2xs hover:border-brand-300 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                    Total Leather Balance
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-extrabold text-brand-900 font-sans tabular-nums">
                                        {kpis.total_sq_ft.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-bold text-brand-700 uppercase">
                                        Sq. Ft
                                    </span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/80">
                                <Scissors className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-neutral-200/90 shadow-2xs hover:border-brand-300 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                    Color Variations
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-extrabold text-neutral-900 font-sans tabular-nums">
                                        {kpis.total_variations}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">
                                        Hide Shades
                                    </span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-neutral-200/90 shadow-2xs hover:border-brand-300 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                    Master Tannages
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-extrabold text-neutral-900 font-sans tabular-nums">
                                        {kpis.total_tannages}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">
                                        Tanning Types
                                    </span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                <Gem className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-neutral-200/90 shadow-2xs hover:border-brand-300 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                    Low Stock Alerts
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className={`text-2xl font-extrabold font-sans tabular-nums ${kpis.low_stock_count > 0 ? 'text-danger-700' : 'text-emerald-700'}`}>
                                        {kpis.low_stock_count}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">
                                        Hides Below Buffer
                                    </span>
                                </div>
                            </div>
                            <div className={`p-2.5 rounded-xl border ${kpis.low_stock_count > 0 ? 'bg-danger-50 text-danger-700 border-danger-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                {kpis.low_stock_count > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. SEARCH & TANNAGE FILTER CHIPS */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search leather hide name, color shade, or SKU..."
                                className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
                            />
                        </form>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="text-xs text-neutral-500">
                                Showing <strong>{materials.total || 0}</strong> Leather Types
                            </span>
                        </div>
                    </div>

                    {/* Tannage Filter Pills */}
                    {categories.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Tannage:
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCategoryFilter('')}
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                    !selectedCategory
                                        ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                All Tannages
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryFilter(cat)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. MULTI-VARIATION LEATHER TABLE */}
                <Card className="p-0 overflow-hidden border-neutral-200 shadow-2xs">
                    {materials.data.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                title="No leather hides found"
                                description="Add full-grain, vegetable tanned, pull-up, or suede leather hides to manage Sq. Ft cutting stock."
                                actionLabel="Add Leather Hide"
                                onAction={() => setIsAddDrawerOpen(true)}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="w-10 px-3 py-3 text-center"></th>
                                        <th className="px-4 py-3">Leather Master & Tannage</th>
                                        <th className="px-4 py-3">Color Variations</th>
                                        <th className="px-4 py-3">Total Balance (Sq. Ft)</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                                    {materials.data.map((material) => {
                                        const variants = material.variants || [];
                                        const variantCount = variants.length;
                                        const isExpanded = Boolean(expandedRows[material.id]);

                                        const totalStock = variants.reduce((sum, v) => {
                                            return sum + parseFloat(v.inventory?.quantity_on_hand || 0);
                                        }, 0);

                                        const hasLowStockVariant = variants.some((v) => {
                                            const stock = parseFloat(v.inventory?.quantity_on_hand || 0);
                                            const reorder = parseFloat(v.reorder_level || 0);
                                            return stock <= reorder;
                                        });

                                        return (
                                            <React.Fragment key={material.id}>
                                                {/* Parent Leather Row */}
                                                <tr className="hover:bg-neutral-50/80 transition-colors group">
                                                    <td className="px-3 py-3.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRow(material.id)}
                                                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                                                            title={isExpanded ? 'Collapse Shades' : 'Expand Shades'}
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
                                                            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200/70 flex items-center justify-center text-brand-700 shrink-0 shadow-2xs">
                                                                <Scissors className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-neutral-900 block leading-tight">
                                                                    {material.name}
                                                                </span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="brand" size="sm">
                                                                        {material.category}
                                                                    </Badge>
                                                                    <span className="text-[11px] text-neutral-400 font-sans">
                                                                        Unit: <strong className="text-neutral-700">{material.base_unit}</strong>
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
                                                            <span>{variantCount} {variantCount === 1 ? 'Color/Shade' : 'Colors/Shades'}</span>
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
                                                        <span className="text-[11px] text-neutral-400">Total hides balance</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenEdit(material)}
                                                                className="text-xs"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMaterial(material)}
                                                                className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors cursor-pointer"
                                                                title="Delete Leather Type"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Child Variations / Colors */}
                                                {isExpanded && (
                                                    <tr className="bg-neutral-50/50">
                                                        <td colSpan={5} className="p-0 border-b border-neutral-200">
                                                            <div className="p-4 pl-12 space-y-2 bg-neutral-50/70 border-y border-neutral-200/80">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h5 className="text-xs font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Layers className="w-3.5 h-3.5 text-brand-600" />
                                                                        Available Colors, Thicknesses & Hide Rolls for &ldquo;{material.name}&rdquo;
                                                                    </h5>
                                                                </div>

                                                                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-2xs">
                                                                    <table className="w-full text-left text-xs border-collapse">
                                                                        <thead className="bg-neutral-100/70 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                                                                            <tr>
                                                                                <th className="px-4 py-2">Color / Hide Shade</th>
                                                                                <th className="px-4 py-2">Roll / SKU</th>
                                                                                <th className="px-4 py-2">Balance On Hand</th>
                                                                                <th className="px-4 py-2">Reorder Buffer</th>
                                                                                <th className="px-4 py-2 text-right">Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-neutral-100">
                                                                            {variants.map((variant) => {
                                                                                const stockQty = parseFloat(variant.inventory?.quantity_on_hand || 0);
                                                                                const reorderQty = parseFloat(variant.reorder_level || 0);
                                                                                const isLow = stockQty <= reorderQty;

                                                                                return (
                                                                                    <tr key={variant.id} className="hover:bg-neutral-50/60 transition-colors">
                                                                                        <td className="px-4 py-2.5 font-bold text-neutral-900">
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <Tag className="w-3 h-3 text-brand-500" />
                                                                                                <span>{variant.name}</span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5 text-neutral-500 font-sans">
                                                                                            {variant.sku || '—'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className={`font-bold font-sans tabular-nums ${isLow ? 'text-danger-700' : 'text-neutral-800'}`}>
                                                                                                    {stockQty.toLocaleString()} {material.base_unit}
                                                                                                </span>
                                                                                                {isLow && (
                                                                                                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-danger-50 text-danger-700 border border-danger-200 rounded">
                                                                                                        Low Stock
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5 text-neutral-500 font-sans tabular-nums">
                                                                                            {reorderQty.toLocaleString()} {material.base_unit}
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5 text-right">
                                                                                            <div className="flex items-center justify-end gap-2">
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    variant="secondary"
                                                                                                    size="xs"
                                                                                                    onClick={() => setRestockVariant(variant)}
                                                                                                >
                                                                                                    <RotateCcw className="w-3 h-3 mr-1" /> Restock
                                                                                                </Button>
                                                                                                {variants.length > 1 && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => handleDeleteVariant(variant)}
                                                                                                        className="p-1 text-neutral-400 hover:text-danger-600 rounded transition-colors cursor-pointer"
                                                                                                        title="Delete Color Variation"
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
                </Card>
            </div>

            {/* 4. ADD LEATHER HIDE DRAWER WITH MULTI-VARIANT BUILDER */}
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={handleCloseDrawer}
                title={hasVariations ? "Add Leather Hide & Multi-Variations" : "Add New Leather Hide"}
                subtitle={hasVariations ? "Create a leather master and define its stock variations (colors, thicknesses, finishes)" : "Quickly register a standard leather hide and initial inventory"}
                size="xl"
            >
                <form onSubmit={handleAddSubmit} className="space-y-5">
                    {/* General Leather Information */}
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3.5">
                        <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                            1. Leather Master Specifications
                        </h4>

                        <Input
                            label="Leather Hide Name"
                            required
                            placeholder="e.g. Full-Grain Calfskin Leather, Tuscany Veg-Tan"
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
                                    helperText="Initial inventory quantity on hand"
                                />
                            </div>
                        )}
                    </div>

                    {/* Multi-Variation Toggle Card */}
                    <div 
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer select-none ${
                            hasVariations 
                                ? 'bg-brand-50/60 border-brand-300 shadow-2xs' 
                                : 'bg-neutral-50/80 hover:bg-neutral-50 border-neutral-200'
                        }`}
                        onClick={() => setHasVariations(!hasVariations)}
                    >
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Tag className={`w-4 h-4 transition-colors ${hasVariations ? 'text-brand-600' : 'text-neutral-400'}`} />
                                <span className="text-xs font-bold text-neutral-800">
                                    Multi-Variation Stock Tracking
                                </span>
                                {hasVariations && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-700 rounded border border-brand-200">
                                        Active ({addForm.data.variants.length})
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-neutral-500">
                                Enable if this leather hide comes in multiple colors, sizes, or finishes (e.g. Black/Tan or 6mm/8mm).
                            </p>
                        </div>

                        {/* Animated Switch */}
                        <button
                            type="button"
                            role="switch"
                            aria-checked={hasVariations}
                            onClick={(e) => {
                                e.stopPropagation();
                                setHasVariations(!hasVariations);
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                                hasVariations ? 'bg-brand-600' : 'bg-neutral-300'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    hasVariations ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Multi-Variation Rows Section (Visible when Switch is ON) */}
                    {hasVariations && (
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="pb-2 border-b border-neutral-200">
                                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                                    2. Stock Variations & Quantities
                                </h4>
                                <p className="text-[11px] text-neutral-500">
                                    Each variation manages its own independent stock on hand and reorder alert threshold.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {addForm.data.variants.map((v, idx) => (
                                    <div key={idx} className="p-3.5 bg-neutral-0 rounded-lg border border-neutral-200 shadow-2xs space-y-3">
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
                                                placeholder="e.g. Tan / Cognac (1.4mm)"
                                                required
                                                value={v.name}
                                                onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.name`]}
                                            />
                                            <Input
                                                label="SKU Code"
                                                placeholder="e.g. LTH-COG-01"
                                                value={v.sku}
                                                onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.sku`]}
                                            />
                                            <Input
                                                label="Reorder Alert Level"
                                                type="number"
                                                step="0.001"
                                                required
                                                value={v.reorder_level}
                                                onChange={(e) => handleVariantChange(idx, 'reorder_level', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.reorder_level`]}
                                            />
                                            <Input
                                                label={`Initial Stock (${addForm.data.base_unit})`}
                                                type="number"
                                                step="0.001"
                                                required
                                                value={v.initial_stock}
                                                onChange={(e) => handleVariantChange(idx, 'initial_stock', e.target.value)}
                                                error={addForm.errors[`variants.${idx}.initial_stock`]}
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

            {/* 5. RESTOCK LEATHER DRAWER */}
            <Drawer
                isOpen={Boolean(restockVariant)}
                onClose={() => setRestockVariant(null)}
                title={`Restock Leather: ${restockVariant?.name}`}
                description="Add newly purchased or tanned leather hides in Sq. Ft to replenish warehouse balance."
                size="md"
            >
                {restockVariant && (
                    <form onSubmit={handleRestockSubmit} className="space-y-4">
                        <div className="p-3 rounded-lg bg-brand-50 border border-brand-200/80 text-xs text-brand-900 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Current Balance:</span>
                                <strong className="font-sans tabular-nums">{parseFloat(restockVariant.inventory?.quantity_on_hand || 0).toLocaleString()} {restockVariant.inventory?.unit || 'sq_ft'}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Reorder Threshold:</span>
                                <strong className="font-sans tabular-nums">{parseFloat(restockVariant.reorder_level || 0).toLocaleString()} {restockVariant.inventory?.unit || 'sq_ft'}</strong>
                            </div>
                        </div>

                        <Input
                            label={`Quantity to Add (${restockVariant.inventory?.unit || 'sq_ft'})`}
                            type="number"
                            step="0.01"
                            required
                            placeholder="e.g. 250.5"
                            value={restockForm.data.add_quantity}
                            onChange={(e) => restockForm.setData('add_quantity', e.target.value)}
                            error={restockForm.errors.add_quantity}
                        />

                        <Input
                            label="Batch / Tannery Roll Reference Note (Optional)"
                            placeholder="e.g. Batch #409 from Kolkata Tannery, Grade A Hides"
                            value={restockForm.data.note}
                            onChange={(e) => restockForm.setData('note', e.target.value)}
                            error={restockForm.errors.note}
                        />

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                            <Button type="button" variant="outline" onClick={() => setRestockVariant(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" isLoading={restockForm.processing}>
                                Confirm Restock
                            </Button>
                        </div>
                    </form>
                )}
            </Drawer>

            {/* 7. EDIT LEATHER MASTER DRAWER */}
            <Drawer
                isOpen={Boolean(editMaterial)}
                onClose={() => setEditMaterial(null)}
                title={`Edit Leather: ${editMaterial?.name}`}
                description="Update leather master title, tannage classification, and base measurement unit."
                size="md"
            >
                {editMaterial && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <Input
                            label="Leather Hide Name"
                            required
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            error={editForm.errors.name}
                        />

                        <div>
                            <Input
                                label="Category"
                                required
                                placeholder="e.g. Vegetable Tanned, Pull-Up, Nappa, Suede"
                                value={editForm.data.category}
                                onChange={(e) => editForm.setData('category', e.target.value)}
                                error={editForm.errors.category}
                                list="leather-categories-list-edit"
                            />
                            {categories && categories.length > 0 && (
                                <datalist id="leather-categories-list-edit">
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            )}
                        </div>

                        <Select
                            label="Base Measurement Unit"
                            required
                            value={editForm.data.base_unit}
                            onChange={(e) => editForm.setData('base_unit', e.target.value)}
                            error={editForm.errors.base_unit}
                        >
                            {LEATHER_UNITS.map((u) => (
                                <option key={u.value} value={u.value}>
                                    {u.label}
                                </option>
                            ))}
                        </Select>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                            <Button type="button" variant="outline" onClick={() => setEditMaterial(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" isLoading={editForm.processing}>
                                Update Leather
                            </Button>
                        </div>
                    </form>
                )}
            </Drawer>
        </AppLayout>
    );
}
