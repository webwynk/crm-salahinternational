import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import AddCutterModal from '@/Components/leather/AddCutterModal';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
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
    Package,
    ShieldAlert,
} from 'lucide-react';

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

    // Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isShortage) return;
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
            <Head title="Make Leather Challan — Salah International" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <LeatherTabNav />

                {/* Header with Back Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('leather.index')}
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Scissors className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                                Make Leather Cutting Challan
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Issue raw leather hides to a Cutter for multiple products and deduct stock atomically.
                            </p>
                        </div>
                    </div>
                </div>

                {errors.stock && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-800 dark:text-red-300">
                        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-sm">Stock Shortage Error</div>
                            <div className="text-xs mt-0.5">{errors.stock}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Row: Cutter & Leather Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Cutter Selection Card */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Scissors className="w-4 h-4 text-brand-600" />
                                    1. Select Cutter Labour *
                                </label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsAddCutterOpen(true)}
                                    className="flex items-center gap-1.5 text-xs"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    + Add New Cutter
                                </Button>
                            </div>

                            <Select
                                value={cutterId}
                                onChange={(e) => setCutterId(e.target.value)}
                                error={errors.cutter_id}
                                required
                            >
                                <option value="">-- Choose Cutter / Workshop --</option>
                                {allCutters.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.phone || 'No phone'})
                                    </option>
                                ))}
                            </Select>

                            {selectedCutter && (
                                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 text-xs space-y-1">
                                    <div className="font-bold text-neutral-900 dark:text-white">
                                        {selectedCutter.name}
                                    </div>
                                    <div className="text-neutral-500 dark:text-neutral-400">
                                        Phone: <span className="font-medium text-neutral-800 dark:text-neutral-200">{selectedCutter.phone || '-'}</span>
                                    </div>
                                    {selectedCutter.address && (
                                        <div className="text-neutral-500 dark:text-neutral-400">
                                            Workshop: <span className="font-medium text-neutral-800 dark:text-neutral-200">{selectedCutter.address}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. Leather Hide Selection Card */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                            <label className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-600" />
                                2. Select Leather Hide &amp; Variant *
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                                        Leather Hide *
                                    </label>
                                    <Select
                                        value={materialId}
                                        onChange={(e) => handleMaterialChange(e.target.value)}
                                        error={errors.material_id}
                                        required
                                    >
                                        <option value="">-- Choose Leather --</option>
                                        {materials.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.category || 'LEATHER'})
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                {hasMultipleVariants ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                                            Variation (Color/Grade) *
                                        </label>
                                        <Select
                                            value={variantId}
                                            onChange={(e) => setVariantId(e.target.value)}
                                            error={errors.material_variant_id}
                                            required
                                        >
                                            <option value="">-- Choose Variation --</option>
                                            {selectedMaterial.variants.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                                            Variation
                                        </label>
                                        <div className="h-10 px-3 flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                                            Standard Hide (No Variation)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Available Stock Indicator */}
                            {selectedMaterial && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                                        Available Leather Stock:
                                    </span>
                                    <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                                        {availableStock.toFixed(2)} sq. ft
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Multi-Product Selection Grid */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Package className="w-4 h-4 text-brand-600" />
                                    3. Products to Cut ({items.length} {items.length === 1 ? 'Product' : 'Products'})
                                </h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    Select product to auto-fill Part No, Code, and Leather Sq. Ft per piece. Enter quantity to cut.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleAddRow}
                                className="flex items-center gap-1.5 text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                + Add Product
                            </Button>
                        </div>

                        {/* Product Rows Table */}
                        <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3 w-10 text-center">#</th>
                                        <th className="py-3 px-3 min-w-[200px]">Product *</th>
                                        <th className="py-3 px-3 w-28">Part No.</th>
                                        <th className="py-3 px-3 w-28">Code / SKU</th>
                                        <th className="py-3 px-3 w-28 text-right">Leather / Pc</th>
                                        <th className="py-3 px-3 w-28 text-right">Qty (Pcs) *</th>
                                        <th className="py-3 px-3 w-32 text-right">Line Total</th>
                                        <th className="py-3 px-3 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {items.map((row, index) => {
                                        const lineTotal = (Number(row.quantity) || 0) * (Number(row.leather_sqft_per_pc) || 0);
                                        return (
                                            <tr key={index} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                                                <td className="py-2.5 px-3 text-center text-neutral-400 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Select
                                                        value={row.product_id}
                                                        onChange={(e) => handleProductSelect(index, e.target.value)}
                                                        className="w-full text-xs"
                                                        required
                                                    >
                                                        <option value="">-- Select Product --</option>
                                                        {products.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} {p.part_no ? `(${p.part_no})` : ''}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </td>
                                                <td className="py-2.5 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                                                    {row.part_no || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                                                    {row.code || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium text-neutral-700 dark:text-neutral-300">
                                                    {Number(row.leather_sqft_per_pc).toFixed(2)} sq. ft
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={row.quantity}
                                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                        className="w-24 text-right text-xs font-bold"
                                                        required
                                                    />
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-brand-600 dark:text-brand-400">
                                                    {lineTotal.toFixed(2)} sq. ft
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(index)}
                                                        disabled={items.length <= 1}
                                                        className="text-neutral-400 hover:text-red-600 p-1 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                                        title="Delete row"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. Real-Time Summary & Audit Card */}
                    <div className="p-5 rounded-2xl bg-neutral-900 text-white shadow-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                                    Grand Total Leather Required
                                </span>
                                <div className="text-3xl font-black text-brand-400 mt-0.5">
                                    {totalSqFtRequired.toFixed(2)} <span className="text-lg font-bold text-neutral-300">sq. ft</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-neutral-300">
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Total Products</div>
                                    <div className="text-base font-bold text-white mt-0.5">{items.length}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Total Pieces</div>
                                    <div className="text-base font-bold text-white mt-0.5">{totalPieces} pcs</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Available Stock</div>
                                    <div className="text-base font-bold text-white mt-0.5">{availableStock.toFixed(2)} sq. ft</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Balance After</div>
                                    <div className={`text-base font-bold mt-0.5 ${remainingStock < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {remainingStock.toFixed(2)} sq. ft
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Condition Alert */}
                        {isShortage ? (
                            <div className="p-3.5 rounded-xl bg-red-900/40 border border-red-500/50 flex items-center gap-3 text-red-200 text-xs">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                <div>
                                    <strong className="font-bold">Insufficient Stock: </strong>
                                    You need {totalSqFtRequired.toFixed(2)} sq. ft, but only {availableStock.toFixed(2)} sq. ft is available (Shortage: {(totalSqFtRequired - availableStock).toFixed(2)} sq. ft).
                                </div>
                            </div>
                        ) : selectedMaterial && totalSqFtRequired > 0 ? (
                            <div className="p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-500/40 flex items-center gap-3 text-emerald-200 text-xs">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div>
                                    <strong className="font-bold">Stock Sufficient: </strong>
                                    {totalSqFtRequired.toFixed(2)} sq. ft will be automatically deducted from inventory.
                                </div>
                            </div>
                        ) : null}

                        {/* Optional Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                                Challan Notes / Cutting Instructions (Optional)
                            </label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Cut wallet shells from center hide; handle grain direction carefully."
                                className="w-full text-xs rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-white placeholder-neutral-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('leather.index')}
                                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || isShortage || !cutterId || !materialId || totalSqFtRequired <= 0}
                                className="flex items-center gap-2 text-xs font-bold px-6 py-2.5 shadow-lg"
                            >
                                <FileText className="w-4 h-4" />
                                {isSubmitting ? 'Deducting Stock & Generating PDF...' : 'Save & Generate Challan PDF'}
                            </Button>
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
