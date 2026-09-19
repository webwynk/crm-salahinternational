import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import AddCutterModal from '@/Components/leather/AddCutterModal';
import Button from '@/Components/ui/Button';
import Select from '@/Components/ui/Select';
import ProductCombobox from '@/Components/leather/ProductCombobox';
import {
    ArrowLeft,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    FileText,
    Scissors,
    UserPlus,
    Layers,
    ShieldAlert,
    Phone,
    Scale,
    Info,
} from 'lucide-react';

/**
 * MakeChallan — 70/30 Modern Compact SaaS Cutting Challan Creation.
 * 
 * Layout Architecture:
 * - Left 70% (lg:col-span-7): Setup Ribbon (Cutter, Leather, Variant) + Multi-Product Matrix
 * - Right 30% (lg:col-span-3, Sticky): Live Stock Ledger, Hero Balance, and Guaranteed Visible Submit Action
 */
export default function MakeChallan({ cutters = [], materials = [], products = [], errors = {} }) {
    const [allCutters, setAllCutters] = useState(cutters);
    const [isAddCutterOpen, setIsAddCutterOpen] = useState(false);

    const [cutterId, setCutterId] = useState('');
    const [materialId, setMaterialId] = useState('');
    const [variantId, setVariantId] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Multi-Product Rows
    const [items, setItems] = useState([
        { product_id: '', quantity: '1', part_no: '', code: '', name: '', leather_sqft_per_pc: 0 },
    ]);

    // Selected Cutter Object
    const selectedCutter = useMemo(() => {
        return allCutters.find((c) => String(c.id) === String(cutterId)) || null;
    }, [allCutters, cutterId]);

    // Selected Leather Hide Object
    const selectedMaterial = useMemo(() => {
        return materials.find((m) => String(m.id) === String(materialId)) || null;
    }, [materials, materialId]);

    // Does this leather have multiple variations or distinct colors?
    const hasMultipleVariants = useMemo(() => {
        if (!selectedMaterial?.variants?.length) return false;
        if (selectedMaterial.variants.length === 1 && selectedMaterial.variants[0].name === 'Standard') {
            return false;
        }
        return true;
    }, [selectedMaterial]);

    // Handle Leather Hide Change
    const handleMaterialChange = (newMatId) => {
        setMaterialId(newMatId);
        const mat = materials.find((m) => String(m.id) === String(newMatId));
        if (mat?.variants?.length) {
            if (mat.variants.length === 1 && mat.variants[0].name === 'Standard') {
                setVariantId(String(mat.variants[0].id));
            } else {
                setVariantId('');
            }
        } else {
            setVariantId('');
        }
    };

    // Calculate Available Stock for Selected Leather & Variant
    const availableStock = useMemo(() => {
        if (!selectedMaterial) return 0;
        if (variantId) {
            const v = selectedMaterial.variants?.find((v) => String(v.id) === String(variantId));
            return v?.inventory ? Number(v.inventory.quantity_on_hand) : 0;
        }
        if (selectedMaterial.variants?.length === 1) {
            const v = selectedMaterial.variants[0];
            return v.inventory ? Number(v.inventory.quantity_on_hand) : 0;
        }
        return selectedMaterial.inventory ? Number(selectedMaterial.inventory.quantity_on_hand) : 0;
    }, [selectedMaterial, variantId]);

    // Product Row Handlers
    const handleAddRow = () => {
        setItems((prev) => [
            ...prev,
            { product_id: '', quantity: '1', part_no: '', code: '', name: '', leather_sqft_per_pc: 0 },
        ]);
    };

    const handleRemoveRow = (index) => {
        if (items.length <= 1) return;
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleProductSelect = (index, prodId) => {
        const prod = products.find((p) => String(p.id) === String(prodId));
        setItems((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                product_id: prodId,
                part_no: prod?.part_no || '',
                code: prod?.code || '',
                name: prod?.name || '',
                leather_sqft_per_pc: prod?.leather_sqft != null ? Number(prod.leather_sqft) : 0,
            };
            return next;
        });
    };

    const handleQuantityChange = (index, val) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], quantity: val };
            return next;
        });
    };

    // Real-Time Total Calculations
    const totalSqFtRequired = useMemo(() => {
        return items.reduce((sum, item) => {
            const qty = Number(item.quantity) || 0;
            const sqft = Number(item.leather_sqft_per_pc) || 0;
            return sum + qty * sqft;
        }, 0);
    }, [items]);

    const totalPieces = useMemo(() => {
        return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }, [items]);

    const isShortage = useMemo(() => {
        if (!selectedMaterial) return false;
        return totalSqFtRequired > availableStock;
    }, [selectedMaterial, totalSqFtRequired, availableStock]);

    const remainingStock = useMemo(() => {
        return availableStock - totalSqFtRequired;
    }, [availableStock, totalSqFtRequired]);

    const consumptionPercentage = useMemo(() => {
        if (!availableStock || availableStock <= 0) return 0;
        return (totalSqFtRequired / availableStock) * 100;
    }, [totalSqFtRequired, availableStock]);

    const hasMissingProducts = useMemo(() => {
        return items.some((it) => !it.product_id || Number(it.quantity) <= 0);
    }, [items]);

    // Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isShortage || hasMissingProducts || !cutterId || !materialId || totalSqFtRequired <= 0) return;
        setIsSubmitting(true);

        const payload = {
            cutter_id: cutterId,
            material_id: materialId,
            material_variant_id: variantId || null,
            notes,
            items: items.map((it) => ({
                product_id: it.product_id,
                quantity: Number(it.quantity),
                leather_sqft_per_pc: Number(it.leather_sqft_per_pc),
            })),
        };

        router.post(route('leather.challan.store'), payload, {
            onError: () => setIsSubmitting(false),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="New Cutting Challan — Salah International" />

            <div className="space-y-3">
                <LeatherTabNav />

                {/* Minimalist Sub-Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200/80">
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('leather.challans.index')}
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Back to Cutting Challans"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="w-7 h-7 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-2xs">
                            <Scissors className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-tight">
                                New Cutting Challan
                            </h1>
                            <p className="text-[11px] text-neutral-500 leading-tight">
                                Issue raw leather hides to a Cutter and deduct inventory atomically.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                            ● DRAFT CHALLAN
                        </span>
                    </div>
                </div>

                {/* Server Error Alerts */}
                {errors.stock && (
                    <div className="p-2.5 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-2 text-danger-700 text-xs animate-in fade-in-50 duration-150">
                        <ShieldAlert className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Stock Shortage Error: </strong>
                            <span>{errors.stock}</span>
                        </div>
                    </div>
                )}

                {errors.error && (
                    <div className="p-2.5 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-2 text-danger-700 text-xs animate-in fade-in-50 duration-150">
                        <AlertTriangle className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Error: </strong>
                            <span>{errors.error}</span>
                        </div>
                    </div>
                )}

                {/* 70% / 30% Ultra-Compact 2-Column SaaS Grid */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-10 gap-3.5 items-start">
                    {/* LEFT WORKSPACE — 70% Width (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-3">
                        {/* 1. Single-Line Unified Parameters & Raw Material Ribbon */}
                        <div className="p-3 rounded-lg bg-white border border-neutral-200/90 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                                        1
                                    </span>
                                    <h2 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
                                        Challan Parameters & Raw Material
                                    </h2>
                                </div>
                                {selectedMaterial && (
                                    <span className="text-[10.5px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-800 border border-brand-200 font-mono">
                                        Stock: {availableStock.toFixed(2)} sq ft
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                                {/* Cutter Selection (5 cols) */}
                                <div className="sm:col-span-5 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-semibold text-neutral-700">
                                            Cutter Labour / Workshop *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddCutterOpen(true)}
                                            className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-brand-700 hover:text-brand-900 hover:underline"
                                        >
                                            <UserPlus className="w-3 h-3" />
                                            + Add
                                        </button>
                                    </div>
                                    <Select
                                        size="sm"
                                        value={cutterId}
                                        onChange={(e) => setCutterId(e.target.value)}
                                        error={errors.cutter_id}
                                        required
                                    >
                                        <option value="">-- Choose Cutter --</option>
                                        {allCutters.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.phone ? `(${c.phone})` : ''}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Leather Hide Selection (4 cols) */}
                                <div className="sm:col-span-4 space-y-1">
                                    <label className="text-[11px] font-semibold text-neutral-700 block">
                                        Leather Hide *
                                    </label>
                                    <Select
                                        size="sm"
                                        value={materialId}
                                        onChange={(e) => handleMaterialChange(e.target.value)}
                                        error={errors.material_id}
                                        required
                                    >
                                        <option value="">-- Choose Hide --</option>
                                        {materials.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Variation Selection (3 cols) */}
                                <div className="sm:col-span-3 space-y-1">
                                    <label className="text-[11px] font-semibold text-neutral-700 block">
                                        Variation
                                    </label>
                                    {hasMultipleVariants ? (
                                        <Select
                                            size="sm"
                                            value={variantId}
                                            onChange={(e) => setVariantId(e.target.value)}
                                            error={errors.material_variant_id}
                                            required
                                        >
                                            <option value="">-- Variant --</option>
                                            {selectedMaterial.variants.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                        </Select>
                                    ) : (
                                        <div className="h-8.5 px-2.5 flex items-center rounded-md bg-neutral-100 text-neutral-500 text-[10.5px] font-medium border border-neutral-200 truncate">
                                            Standard Hide
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. High-Density Products to Cut Matrix */}
                        <div className="p-3 rounded-lg bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-neutral-100">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                                        2
                                    </span>
                                    <h2 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
                                        Products to Cut Matrix
                                    </h2>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                                        {items.length} {items.length === 1 ? 'Line' : 'Lines'}
                                    </span>
                                </div>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAddRow}
                                    className="flex items-center gap-1 text-[11px] font-semibold h-7 px-2.5 py-0.5"
                                >
                                    <Plus className="w-3 h-3" />
                                    + Add Product Line
                                </Button>
                            </div>

                            {/* Ultra-Dense Table */}
                            <div className="border border-neutral-200/80 rounded-md overflow-visible">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-neutral-50/90 border-b border-neutral-200 text-neutral-600 font-bold uppercase text-[10px] tracking-wider">
                                                <th className="py-1.5 px-2 w-7 text-center">#</th>
                                                <th className="py-1.5 px-2.5 min-w-[250px]">Product *</th>
                                                <th className="py-1.5 px-2 w-20">Part No.</th>
                                                <th className="py-1.5 px-2 w-24">Code / SKU</th>
                                                <th className="py-1.5 px-2 w-20 text-right">Sq.Ft / Pc</th>
                                                <th className="py-1.5 px-2 w-20 text-right">Qty (Pcs) *</th>
                                                <th className="py-1.5 px-2.5 w-24 text-right">Line Total</th>
                                                <th className="py-1.5 px-1.5 w-8 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200/80">
                                            {items.map((row, index) => {
                                                const lineTotal = (Number(row.quantity) || 0) * (Number(row.leather_sqft_per_pc) || 0);
                                                return (
                                                    <tr key={index} className="hover:bg-neutral-50/70 transition-colors">
                                                        <td className="py-1.5 px-2 text-center text-neutral-400 font-mono font-medium text-[10.5px]">
                                                            {index + 1}
                                                        </td>
                                                        <td className="py-1.5 px-2.5">
                                                            <ProductCombobox
                                                                products={products}
                                                                value={row.product_id}
                                                                onChange={(prodId) => handleProductSelect(index, prodId)}
                                                                placeholder="Search code or product name..."
                                                            />
                                                        </td>
                                                        <td className="py-1.5 px-2">
                                                            {row.part_no ? (
                                                                <span className="font-mono text-[10.5px] font-semibold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 truncate block max-w-[80px]">
                                                                    {row.part_no}
                                                                </span>
                                                            ) : (
                                                                <span className="text-neutral-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-1.5 px-2">
                                                            {row.code ? (
                                                                <span className="font-mono text-[10.5px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300/80 truncate block max-w-[85px]">
                                                                    {row.code}
                                                                </span>
                                                            ) : (
                                                                <span className="text-neutral-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-1.5 px-2 text-right font-medium text-neutral-700 tabular-nums font-mono text-[11px]">
                                                            {Number(row.leather_sqft_per_pc).toFixed(2)}
                                                        </td>
                                                        <td className="py-1.5 px-2 text-right">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                value={row.quantity}
                                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                                className="w-16 h-7 text-right text-xs font-bold tabular-nums rounded border border-neutral-300 px-1.5 py-0.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="py-1.5 px-2.5 text-right font-bold text-brand-800 tabular-nums font-mono text-xs">
                                                            {lineTotal.toFixed(2)} <span className="text-[9.5px] text-neutral-500 font-normal">sq.ft</span>
                                                        </td>
                                                        <td className="py-1.5 px-1.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveRow(index)}
                                                                disabled={items.length <= 1}
                                                                className="text-neutral-400 hover:text-danger-600 p-1 rounded hover:bg-danger-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                                                                title="Delete row"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COMMAND SIDEBAR — 30% Width (lg:col-span-3, Sticky) */}
                    <div className="lg:col-span-3 lg:sticky lg:top-3 space-y-3">
                        <div className="p-3 rounded-lg bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
                            {/* Card Header with Live Indicator */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                                        3
                                    </span>
                                    <h2 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
                                        Stock Impact
                                    </h2>
                                </div>
                                <span className="flex h-2 w-2 relative">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isShortage ? 'bg-danger-400' : 'bg-success-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isShortage ? 'bg-danger-500' : 'bg-success-500'}`}></span>
                                </span>
                            </div>

                            {/* Hero Total & Balance Split Card */}
                            <div className="p-2 rounded-md bg-brand-50/70 border border-brand-200/90 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-brand-800 flex items-center gap-1">
                                        <Scale className="w-3 h-3 text-brand-600" />
                                        Total Required
                                    </span>
                                    <span className="text-base font-black text-brand-900 tabular-nums font-mono">
                                        {totalSqFtRequired.toFixed(2)} <span className="text-[10px] font-bold text-neutral-500 font-sans">sq.ft</span>
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-brand-200/60 text-[10.5px]">
                                    <span className="font-semibold text-neutral-500 text-[9.5px] uppercase">Balance After</span>
                                    <span className={`font-bold tabular-nums font-mono ${remainingStock < 0 ? 'text-danger-700' : 'text-success-800'}`}>
                                        {remainingStock.toFixed(2)} sq.ft
                                    </span>
                                </div>
                            </div>

                            {/* 4 Micro-Chips (2x2 Grid) */}
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                                <div className="p-1 rounded bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                                    <span className="text-neutral-500 font-semibold text-[9.5px]">Lines:</span>
                                    <span className="font-bold text-neutral-900 font-mono text-[11px]">{items.length}</span>
                                </div>
                                <div className="p-1 rounded bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                                    <span className="text-neutral-500 font-semibold text-[9.5px]">Pieces:</span>
                                    <span className="font-bold text-neutral-900 font-mono text-[11px]">{totalPieces} pcs</span>
                                </div>
                                <div className="p-1 rounded bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                                    <span className="text-neutral-500 font-semibold text-[9.5px]">Stock:</span>
                                    <span className="font-bold text-neutral-900 font-mono text-[11px] truncate">
                                        {availableStock.toFixed(2)}
                                    </span>
                                </div>
                                <div className="p-1 rounded bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                                    <span className="text-neutral-500 font-semibold text-[9.5px]">Usage:</span>
                                    <span className={`font-bold font-mono text-[11px] ${consumptionPercentage > 100 ? 'text-danger-600' : 'text-neutral-800'}`}>
                                        {consumptionPercentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Slim Visual Stock Consumption Bar */}
                            {selectedMaterial && availableStock > 0 && (
                                <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${
                                            isShortage ? 'bg-danger-500' : 'bg-brand-600'
                                        }`}
                                        style={{
                                            width: `${Math.min(100, consumptionPercentage)}%`,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Compact Single-Line Status Badge */}
                            {isShortage ? (
                                <div className="p-1.5 rounded-md bg-danger-50 border border-danger-200 flex items-center gap-1.5 text-danger-700 text-[10.5px]">
                                    <AlertTriangle className="w-3.5 h-3.5 text-danger-600 shrink-0" />
                                    <span className="truncate font-semibold">
                                        Shortage: {(totalSqFtRequired - availableStock).toFixed(2)} sq.ft
                                    </span>
                                </div>
                            ) : selectedMaterial && totalSqFtRequired > 0 ? (
                                <div className="p-1.5 rounded-md bg-success-50 border border-success-200 flex items-center gap-1.5 text-success-700 text-[10.5px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success-600 shrink-0" />
                                    <span className="truncate font-semibold">
                                        Ready: Deducting {totalSqFtRequired.toFixed(2)} sq.ft
                                    </span>
                                </div>
                            ) : (
                                <div className="p-1.5 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-500 text-[10px] flex items-center gap-1.5">
                                    <Info className="w-3 h-3 shrink-0 text-neutral-400" />
                                    <span className="truncate">Select hide & products</span>
                                </div>
                            )}

                            {/* Compact Single-Line Notes Input */}
                            <div>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Challan notes / instructions..."
                                    className="w-full text-[11px] h-7 rounded border border-neutral-300 px-2 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            {/* Primary Action Button (Guaranteed 100% visible on laptop screens) */}
                            <div className="pt-0.5 space-y-1">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        isSubmitting ||
                                        isShortage ||
                                        hasMissingProducts ||
                                        !cutterId ||
                                        !materialId ||
                                        totalSqFtRequired <= 0
                                    }
                                    className="w-full h-8.5 flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    {isSubmitting ? 'Generating...' : 'Save Challan PDF'}
                                </Button>

                                <Link
                                    href={route('leather.challans.index')}
                                    className="block text-center text-[10.5px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors py-0.5"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Quick-Add Cutter Modal */}
            <AddCutterModal
                isOpen={isAddCutterOpen}
                onClose={() => setIsAddCutterOpen(false)}
                onSuccess={(newCutter) => {
                    setAllCutters((prev) => [newCutter, ...prev]);
                    setCutterId(String(newCutter.id));
                }}
            />
        </AppLayout>
    );
}
