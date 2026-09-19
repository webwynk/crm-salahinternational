import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import AddCutterModal from '@/Components/leather/AddCutterModal';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
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
            <Head title="New Cutting Challan — Salah International" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <LeatherTabNav />

                {/* Header with Back Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('leather.index')}>
                            <Button type="button" variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                                <Scissors className="w-6 h-6 text-brand-600" />
                                New Cutting Challan
                            </h1>
                            <p className="text-sm text-neutral-500">
                                Issue raw leather hides to a Cutter for multiple products and deduct stock atomically.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Server Error Alerts */}
                {errors.stock && (
                    <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-3 text-danger-700">
                        <ShieldAlert className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-sm">Stock Shortage Error</div>
                            <div className="text-xs mt-0.5">{errors.stock}</div>
                        </div>
                    </div>
                )}

                {errors.error && (
                    <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-3 text-danger-700">
                        <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-sm">Error</div>
                            <div className="text-xs mt-0.5">{errors.error}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Row: Cutter & Leather Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Cutter Selection Card */}
                        <div className="p-5 rounded-lg bg-white border border-neutral-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                                    <Scissors className="w-4 h-4 text-brand-600" />
                                    1. Select Cutter Labour
                                </label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsAddCutterOpen(true)}
                                    className="flex items-center gap-1.5 text-xs"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    + Add New
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
                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                                    <div className="font-bold text-neutral-900">
                                        {selectedCutter.name}
                                    </div>
                                    <div className="text-neutral-500">
                                        Phone: <span className="font-medium text-neutral-800">{selectedCutter.phone || '-'}</span>
                                    </div>
                                    {selectedCutter.address && (
                                        <div className="text-neutral-500">
                                            Workshop: <span className="font-medium text-neutral-800">{selectedCutter.address}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. Leather Hide Selection Card */}
                        <div className="p-5 rounded-lg bg-white border border-neutral-200 shadow-sm space-y-4">
                            <label className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-600" />
                                2. Select Leather Hide & Variant
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
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
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
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
                                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                                            Variation
                                        </label>
                                        <div className="h-10 px-3 flex items-center rounded-sm bg-neutral-100 text-neutral-500 text-xs font-medium border border-neutral-200">
                                            Standard Hide (No Variation)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Available Stock Indicator */}
                            {selectedMaterial && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-50 border border-brand-200">
                                    <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                                        Available Leather Stock:
                                    </span>
                                    <span className="text-sm font-extrabold text-brand-900 tabular-nums">
                                        {availableStock.toFixed(2)} sq. ft
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Multi-Product Selection Grid */}
                    <div className="p-5 rounded-lg bg-white border border-neutral-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                                    <Package className="w-4 h-4 text-brand-600" />
                                    3. Products to Cut ({items.length} {items.length === 1 ? 'Product' : 'Products'})
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">
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
                        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
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
                                <tbody className="divide-y divide-neutral-200">
                                    {items.map((row, index) => {
                                        const lineTotal = (Number(row.quantity) || 0) * (Number(row.leather_sqft_per_pc) || 0);
                                        return (
                                            <tr key={index} className="hover:bg-neutral-50 transition-colors">
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
                                                <td className="py-2.5 px-3 font-semibold text-neutral-800">
                                                    {row.part_no || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-neutral-600">
                                                    {row.code || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium text-neutral-700 tabular-nums">
                                                    {Number(row.leather_sqft_per_pc).toFixed(2)} sq. ft
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={row.quantity}
                                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                        className="w-24 text-right text-xs font-bold tabular-nums"
                                                        required
                                                    />
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-brand-700 tabular-nums">
                                                    {lineTotal.toFixed(2)} sq. ft
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(index)}
                                                        disabled={items.length <= 1}
                                                        className="text-neutral-400 hover:text-danger-600 p-1 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
                    <div className="p-5 rounded-lg bg-white border border-neutral-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                                    Grand Total Leather Required
                                </span>
                                <div className="text-3xl font-black text-brand-700 mt-0.5 tabular-nums">
                                    {totalSqFtRequired.toFixed(2)} <span className="text-lg font-bold text-neutral-500">sq. ft</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-neutral-600">
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Total Products</div>
                                    <div className="text-base font-bold text-neutral-900 mt-0.5 tabular-nums">{items.length}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Total Pieces</div>
                                    <div className="text-base font-bold text-neutral-900 mt-0.5 tabular-nums">{totalPieces} pcs</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Available Stock</div>
                                    <div className="text-base font-bold text-neutral-900 mt-0.5 tabular-nums">{availableStock.toFixed(2)} sq. ft</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 font-semibold uppercase">Balance After</div>
                                    <div className={`text-base font-bold mt-0.5 tabular-nums ${remainingStock < 0 ? 'text-danger-600' : 'text-success-500'}`}>
                                        {remainingStock.toFixed(2)} sq. ft
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Condition Alert */}
                        {isShortage ? (
                            <div className="p-3.5 rounded-lg bg-danger-50 border border-danger-200 flex items-center gap-3 text-danger-700 text-xs">
                                <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0" />
                                <div>
                                    <strong className="font-bold">Insufficient Stock: </strong>
                                    You need {totalSqFtRequired.toFixed(2)} sq. ft, but only {availableStock.toFixed(2)} sq. ft is available (Shortage: {(totalSqFtRequired - availableStock).toFixed(2)} sq. ft).
                                </div>
                            </div>
                        ) : selectedMaterial && totalSqFtRequired > 0 ? (
                            <div className="p-3.5 rounded-lg bg-success-50 border border-success-200 flex items-center gap-3 text-success-700 text-xs">
                                <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" />
                                <div>
                                    <strong className="font-bold">Stock Sufficient: </strong>
                                    {totalSqFtRequired.toFixed(2)} sq. ft will be automatically deducted from inventory.
                                </div>
                            </div>
                        ) : null}

                        {/* Optional Notes */}
                        <Textarea
                            label="Challan Notes / Cutting Instructions (Optional)"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Cut wallet shells from center hide; handle grain direction carefully."
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('leather.index')}
                                className="px-5 py-2.5 rounded-sm text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || isShortage || !cutterId || !materialId || totalSqFtRequired <= 0}
                                className="flex items-center gap-2 text-xs font-bold px-6 py-2.5 shadow-sm"
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
