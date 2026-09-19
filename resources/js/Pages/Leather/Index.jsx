import React, { useState } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import FilterChips from '@/Components/ui/FilterChips';
import Button from '@/Components/ui/Button';
import Drawer from '@/Components/ui/Drawer';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import EmptyState from '@/Components/ui/EmptyState';
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
    FileText,
} from 'lucide-react';
import { LEATHER_UNITS } from '@/constants/leatherUnits';

/**
 * Leather Index — Enterprise SaaS Leather Stock & Hide Master Command Center.
 * 
 * Features:
 * - Real-time Search & Category Filter Chips
 * - High-Density Data Grid with Inline Variation Pills & Expandable Specs Table
 * - Quick Restock Modal with 1-Click Increment Presets (+50, +100, +250, +500 sq. ft)
 * - Single/Multi-Variant Leather Creation Slide-Over Drawer
 */
export default function Index({ materials, categories = [], kpis = {}, filters = {} }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin ?? false;

    const { isLoading } = useInertiaLoading();

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

    const handleQuickPresetAdd = (amount) => {
        const current = parseFloat(restockForm.data.add_quantity) || 0;
        restockForm.setData('add_quantity', String(current + amount));
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

    return (
        <AppLayout>
            <Head title="Leather Stock & Inventory — Salah International" />

            <div className="space-y-4">
                <LeatherTabNav />

                {/* SaaS Header & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-2xs">
                            <Scissors className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight leading-tight">
                                Leather Stock & Hide Master
                            </h1>
                            <p className="text-xs text-neutral-500 leading-tight">
                                Track raw hide balances, multi-grade leather variations, and replenish warehouse inventory.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('leather.challan.create')}>
                            <Button variant="secondary" className="flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                                <FileText className="w-3.5 h-3.5 text-brand-700" />
                                Make Challan
                            </Button>
                        </Link>
                        {isAdmin && (
                            <Button
                                variant="primary"
                                onClick={() => setIsAddDrawerOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add Leather Hide
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search leather by name, category, or SKU..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full text-xs pl-8 pr-8 py-1.5 rounded-md border border-neutral-300 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 placeholder:text-neutral-400 transition-colors"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => handleSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <FilterChips
                        options={categories}
                        value={selectedCategory}
                        onChange={handleCategoryFilter}
                        allLabel="All Categories"
                    />
                </div>

                {/* Main Leather Materials Data Grid */}
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
                                <Button variant="primary" size="sm" onClick={() => setIsAddDrawerOpen(true)}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Leather Hide
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <div className={`bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden transition-opacity duration-200 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/90 border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                                        <th className="py-2.5 px-3">Leather Master & Category</th>
                                        <th className="py-2.5 px-3">Color / Grade Variations</th>
                                        <th className="py-2.5 px-3 text-right">Total Balance</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200/80">
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
                                                parseFloat(v.reorder_level || 0) &&
                                                parseFloat(v.reorder_level || 0) > 0
                                        );

                                        return (
                                            <React.Fragment key={material.id}>
                                                <tr className="hover:bg-neutral-50/70 transition-colors group">
                                                    {/* Leather Master & Category */}
                                                    <td className="py-3 px-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleRow(material.id)}
                                                                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                                                                title={isExpanded ? 'Collapse specs' : 'Expand specs'}
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronDown className="w-4 h-4 text-brand-700" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </button>

                                                            <div className="w-7 h-7 rounded-md bg-brand-50 border border-brand-200/80 text-brand-700 flex items-center justify-center shrink-0 shadow-2xs">
                                                                <Scissors className="w-3.5 h-3.5" />
                                                            </div>

                                                            <div>
                                                                <div className="font-bold text-neutral-900 text-xs">
                                                                    {material.name}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                                        {material.category || 'LEATHER'}
                                                                    </span>
                                                                    <span className="text-[10.5px] text-neutral-400 font-mono">
                                                                        Base: {material.base_unit}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Inline Color / Grade Variation Badges */}
                                                    <td className="py-3 px-3">
                                                        <div className="flex flex-wrap items-center gap-1.5 max-w-lg">
                                                            {variants.map((v) => {
                                                                const vStock = parseFloat(v.inventory?.quantity_on_hand || 0);
                                                                const vReorder = parseFloat(v.reorder_level || 0);
                                                                const isVLow = vStock <= vReorder && vReorder > 0;

                                                                return (
                                                                    <span
                                                                        key={v.id}
                                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium border shadow-2xs ${
                                                                            isVLow
                                                                                ? 'bg-danger-50 text-danger-800 border-danger-200'
                                                                                : 'bg-neutral-50 text-neutral-800 border-neutral-200'
                                                                        }`}
                                                                    >
                                                                        <Tag className="w-2.5 h-2.5 text-neutral-400" />
                                                                        <strong className="font-semibold">{v.name}:</strong>
                                                                        <span className="font-mono font-bold">{vStock.toFixed(1)}</span>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>

                                                    {/* Total Balance */}
                                                    <td className="py-3 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <span
                                                                className={`font-black text-xs font-mono tabular-nums ${
                                                                    hasLowStockVariant ? 'text-danger-700' : 'text-brand-900'
                                                                }`}
                                                            >
                                                                {totalStock.toFixed(2)}{' '}
                                                                <span className="text-[10px] text-neutral-500 font-normal font-sans">{material.base_unit}</span>
                                                            </span>
                                                            {hasLowStockVariant && (
                                                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-danger-100 text-danger-700 border border-danger-200">
                                                                    Low
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const targetVar = variants[0] || null;
                                                                        if (targetVar) {
                                                                            setRestockVariant({
                                                                                ...targetVar,
                                                                                materialName: material.name,
                                                                                base_unit: material.base_unit,
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="h-7 text-xs px-2.5 gap-1 shadow-2xs"
                                                                >
                                                                    <RefreshCw className="w-3 h-3" />
                                                                    Restock
                                                                </Button>
                                                            )}

                                                            {isAdmin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAddVariantMaterial(material)}
                                                                    className="p-1 rounded text-neutral-500 hover:text-brand-700 hover:bg-brand-50 border border-neutral-200 bg-white transition-colors"
                                                                    title="Add Color / Grade Variation"
                                                                >
                                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}

                                                            {isAdmin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeleteMaterial(material)}
                                                                    className="p-1 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50 border border-neutral-200 bg-white transition-colors"
                                                                    title="Delete Leather Hide"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expandable Variations Breakdown Table */}
                                                {isExpanded && (
                                                    <tr className="bg-neutral-50/70 border-y border-neutral-200">
                                                        <td colSpan={4} className="px-5 py-3">
                                                            <div className="bg-white rounded-lg border border-neutral-200/90 shadow-2xs overflow-hidden">
                                                                <div className="px-3.5 py-2 bg-neutral-100/60 border-b border-neutral-200 flex items-center justify-between">
                                                                    <span className="text-[10.5px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Layers className="w-3 h-3 text-brand-700" />
                                                                        Detailed Specifications — {material.name} ({variantCount} {variantCount === 1 ? 'Variation' : 'Variations'})
                                                                    </span>
                                                                    {isAdmin && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setAddVariantMaterial(material)}
                                                                            className="text-[11px] font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                                                                        >
                                                                            <Plus className="w-3 h-3" /> Add Variation
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <table className="w-full text-left text-xs border-collapse">
                                                                    <thead>
                                                                        <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[9.5px]">
                                                                            <th className="py-2 px-3">Variation Name / Color</th>
                                                                            <th className="py-2 px-3">SKU Code</th>
                                                                            <th className="py-2 px-3 text-right">Stock On Hand</th>
                                                                            <th className="py-2 px-3 text-right">Reorder Level</th>
                                                                            <th className="py-2 px-3 text-right">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-neutral-100">
                                                                        {variants.map((v) => {
                                                                            const stock = parseFloat(v.inventory?.quantity_on_hand || 0);
                                                                            const reorder = parseFloat(v.reorder_level || 0);
                                                                            const isLow = stock <= reorder && reorder > 0;

                                                                            return (
                                                                                <tr key={v.id} className="hover:bg-neutral-50/60 transition-colors">
                                                                                    <td className="py-2 px-3">
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <Tag className="w-3 h-3 text-brand-600" />
                                                                                            <span className="font-bold text-neutral-900 text-xs">{v.name}</span>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="py-2 px-3 text-neutral-500 font-mono text-[11px]">
                                                                                        {v.sku || '—'}
                                                                                    </td>
                                                                                    <td className="py-2 px-3 text-right">
                                                                                        <span className={`font-bold font-mono text-xs ${isLow ? 'text-danger-700' : 'text-neutral-900'}`}>
                                                                                            {stock.toFixed(2)} {material.base_unit}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2 px-3 text-right font-mono text-neutral-500 text-[11px]">
                                                                                        {reorder.toFixed(2)} {material.base_unit}
                                                                                    </td>
                                                                                    <td className="py-2 px-3 text-right">
                                                                                        <div className="flex items-center justify-end gap-1.5">
                                                                                            {isAdmin && (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => setRestockVariant({
                                                                                                        ...v,
                                                                                                        materialName: material.name,
                                                                                                        base_unit: material.base_unit,
                                                                                                    })}
                                                                                                    className="px-2 py-0.5 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded transition-colors"
                                                                                                >
                                                                                                    Restock
                                                                                                </button>
                                                                                            )}
                                                                                            {isAdmin && variantCount > 1 && (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => setDeleteVariant({
                                                                                                        ...v,
                                                                                                        materialName: material.name,
                                                                                                    })}
                                                                                                    className="p-1 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                                                                                    title="Delete variation"
                                                                                                >
                                                                                                    <Trash2 className="w-3 h-3" />
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

                        {/* Pagination Footer */}
                        {materials.total > 0 && (
                            <div className="p-3 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                                <div>
                                    Showing <strong className="font-semibold text-neutral-900">{materials.from || 0}</strong> to{' '}
                                    <strong className="font-semibold text-neutral-900">{materials.to || 0}</strong> of{' '}
                                    <strong className="font-semibold text-neutral-900">{materials.total}</strong> leather hides
                                </div>

                                {materials.links && materials.links.length > 3 && (
                                    <div className="flex items-center gap-1">
                                        {materials.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                                    link.active
                                                        ? 'bg-brand-700 text-white font-bold'
                                                        : link.url
                                                        ? 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                                        : 'text-neutral-300 pointer-events-none'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Restock Modal with 1-Click Increment Presets */}
            <Modal
                isOpen={!!restockVariant}
                onClose={() => {
                    setRestockVariant(null);
                    restockForm.reset();
                }}
                title={`Replenish Inventory — ${restockVariant?.materialName || 'Leather'}`}
            >
                {restockVariant && (
                    <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
                        <div className="p-3 rounded-lg bg-brand-50/70 border border-brand-200 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-brand-800">Variation</span>
                                <div className="font-bold text-brand-900 text-sm">{restockVariant.name}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-neutral-500">Current Balance</span>
                                <div className="font-mono font-bold text-sm text-neutral-900">
                                    {parseFloat(restockVariant.inventory?.quantity_on_hand || 0).toFixed(2)} {restockVariant.base_unit}
                                </div>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 block">
                                Quick Add Presets (+ sq. ft)
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[50, 100, 250, 500].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => handleQuickPresetAdd(amt)}
                                        className="py-1 px-2 rounded border border-neutral-200 bg-white hover:bg-brand-50 hover:border-brand-300 font-mono font-bold text-xs text-neutral-700 hover:text-brand-800 transition-colors"
                                    >
                                        +{amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            label={`Quantity to Add (${restockVariant.base_unit}) *`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={restockForm.data.add_quantity}
                            onChange={(e) => restockForm.setData('add_quantity', e.target.value)}
                            error={restockForm.errors.add_quantity}
                            placeholder="e.g. 150.00"
                            required
                        />

                        <Input
                            label="Restock Note (Optional)"
                            value={restockForm.data.note}
                            onChange={(e) => restockForm.setData('note', e.target.value)}
                            placeholder="e.g. Received batch #L-904 from tannery supplier"
                        />

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setRestockVariant(null);
                                    restockForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={restockForm.processing || !restockForm.data.add_quantity}
                            >
                                {restockForm.processing ? 'Adding to Stock...' : 'Confirm Restock'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Add Variation Modal */}
            <Modal
                isOpen={!!addVariantMaterial}
                onClose={() => {
                    setAddVariantMaterial(null);
                    newVariantForm.reset();
                }}
                title={`Add Color / Variation — ${addVariantMaterial?.name}`}
            >
                {addVariantMaterial && (
                    <form onSubmit={handleCreateVariantSubmit} className="space-y-4 text-xs">
                        <Input
                            label="Variation Name (Color / Grade) *"
                            value={newVariantForm.data.name}
                            onChange={(e) => newVariantForm.setData('name', e.target.value)}
                            error={newVariantForm.errors.name}
                            placeholder="e.g. Tan, Dark Brown, Olive Green"
                            required
                        />

                        <Input
                            label="SKU Code (Optional)"
                            value={newVariantForm.data.sku}
                            onChange={(e) => newVariantForm.setData('sku', e.target.value)}
                            error={newVariantForm.errors.sku}
                            placeholder="e.g. LTH-COW-TAN"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Initial Stock (sq. ft)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newVariantForm.data.initial_stock}
                                onChange={(e) => newVariantForm.setData('initial_stock', e.target.value)}
                                error={newVariantForm.errors.initial_stock}
                            />
                            <Input
                                label="Reorder Point (sq. ft)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newVariantForm.data.reorder_level}
                                onChange={(e) => newVariantForm.setData('reorder_level', e.target.value)}
                                error={newVariantForm.errors.reorder_level}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setAddVariantMaterial(null);
                                    newVariantForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={newVariantForm.processing || !newVariantForm.data.name}
                            >
                                {newVariantForm.processing ? 'Saving...' : 'Add Variation'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Add Leather Hide Slide-Over Drawer */}
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={handleCloseDrawer}
                title="Add New Leather Hide Master"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                    <Input
                        label="Leather Hide Name *"
                        value={addForm.data.name}
                        onChange={(e) => addForm.setData('name', e.target.value)}
                        error={addForm.errors.name}
                        placeholder="e.g. Cow Hunter Leather, Nappa Tan"
                        required
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Tannage / Category *"
                            value={addForm.data.category}
                            onChange={(e) => addForm.setData('category', e.target.value)}
                            error={addForm.errors.category}
                            placeholder="e.g. Cow Leather, Suede"
                            required
                        />

                        <Select
                            label="Base Measurement Unit"
                            value={addForm.data.base_unit}
                            onChange={(e) => addForm.setData('base_unit', e.target.value)}
                            error={addForm.errors.base_unit}
                            required
                        >
                            {LEATHER_UNITS.map((u) => (
                                <option key={u.value} value={u.value}>
                                    {u.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Toggle Variations */}
                    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-neutral-900">Multi-Color / Grade Variations?</div>
                                <div className="text-[11px] text-neutral-500">Enable if this hide comes in multiple distinct colors or finish grades.</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={hasVariations}
                                onChange={(e) => setHasVariations(e.target.checked)}
                                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    {!hasVariations ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Initial Stock (sq. ft)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={addForm.data.initial_stock}
                                onChange={(e) => addForm.setData('initial_stock', e.target.value)}
                                error={addForm.errors.initial_stock}
                            />
                            <Input
                                label="Reorder Level (sq. ft)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={addForm.data.reorder_level}
                                onChange={(e) => addForm.setData('reorder_level', e.target.value)}
                                error={addForm.errors.reorder_level}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                    Variations List ({addForm.data.variants.length})
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAddVariantRow}
                                    className="text-[11px] font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> + Add Variation
                                </button>
                            </div>

                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {addForm.data.variants.map((v, i) => (
                                    <div key={i} className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-2 relative">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-[11px] text-neutral-700">Variation #{i + 1}</span>
                                            {addForm.data.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariantRow(i)}
                                                    className="text-neutral-400 hover:text-danger-600 p-0.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                label="Color / Grade Name *"
                                                value={v.name}
                                                onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                                                placeholder="e.g. Black"
                                                required
                                            />
                                            <Input
                                                label="SKU Code"
                                                value={v.sku}
                                                onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                                                placeholder="e.g. COW-BLK"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                label="Initial Stock"
                                                type="number"
                                                step="0.01"
                                                value={v.initial_stock}
                                                onChange={(e) => handleVariantChange(i, 'initial_stock', e.target.value)}
                                            />
                                            <Input
                                                label="Reorder Level"
                                                type="number"
                                                step="0.01"
                                                value={v.reorder_level}
                                                onChange={(e) => handleVariantChange(i, 'reorder_level', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
                        <Button type="button" variant="secondary" size="sm" onClick={handleCloseDrawer}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="sm" disabled={addForm.processing}>
                            {addForm.processing ? 'Saving...' : 'Create Leather Hide'}
                        </Button>
                    </div>
                </form>
            </Drawer>

            {/* Delete Material Modal */}
            <Modal
                isOpen={!!deleteMaterial}
                onClose={() => setDeleteMaterial(null)}
                title="Delete Leather Hide Master?"
            >
                <div className="space-y-3 text-xs">
                    <p className="text-neutral-600">
                        Are you sure you want to delete{' '}
                        <strong className="font-bold text-neutral-900">{deleteMaterial?.name}</strong>?
                    </p>
                    <div className="p-2.5 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>All associated variations and stock records for this hide will be permanently deleted.</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteMaterial(null)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={handleDeleteMaterialConfirm} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Variant Modal */}
            <Modal
                isOpen={!!deleteVariant}
                onClose={() => setDeleteVariant(null)}
                title="Delete Variation?"
            >
                <div className="space-y-3 text-xs">
                    <p className="text-neutral-600">
                        Are you sure you want to delete variation{' '}
                        <strong className="font-bold text-neutral-900">{deleteVariant?.name}</strong> from{' '}
                        <strong>{deleteVariant?.materialName}</strong>?
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteVariant(null)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={handleDeleteVariantConfirm} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Variation'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
