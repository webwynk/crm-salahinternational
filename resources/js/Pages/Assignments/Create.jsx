import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import Alert from '@/Components/ui/Alert';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import FilterChips from '@/Components/ui/FilterChips';
import {
    Search,
    CheckCircle2,
    ArrowLeft,
    ClipboardCheck,
    Package,
    User,
    Layers,
    AlertTriangle,
    Plus,
    Minus,
    ShieldCheck,
    FileText,
    Sparkles,
    Check,
    Palette
} from 'lucide-react';
import axios from 'axios';

export default function Create({ products = [], labours = [], labour = [], categories = [] }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [preCheckResult, setPreCheckResult] = useState(null);
    const [isPreChecking, setIsPreChecking] = useState(false);
    const [preCheckError, setPreCheckError] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const safeProducts = Array.isArray(products) ? products : (products?.data || []);
    const safeLabour = (Array.isArray(labours) && labours.length > 0)
        ? labours
        : (Array.isArray(labour) ? labour : (labour?.data || []));

    // Synchronize categories with live product database with client fallback
    const availableCategories = (Array.isArray(categories) && categories.length > 0)
        ? categories
        : Array.from(new Set(safeProducts.map((p) => p.category).filter(Boolean)));

    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        product_color_id: '',
        labour_id: '',
        quantity: 10,
        notes: '',
    });

    // Auto-select first product if available and none selected
    useEffect(() => {
        if (!selectedProduct && safeProducts.length > 0) {
            handleSelectProduct(safeProducts[0]);
        }
    }, [safeProducts]);

    // Filter products safely with null guards & case-insensitive matching
    const filteredProducts = safeProducts.filter((p) => {
        if (!p) return false;
        const codeStr = (p.code || '').toLowerCase();
        const nameStr = (p.name || '').toLowerCase();
        const searchStr = (productSearch || '').toLowerCase();
        const matchesSearch = codeStr.includes(searchStr) || nameStr.includes(searchStr);
        const matchesCategory =
            selectedCategory === 'ALL' ||
            !selectedCategory ||
            (p.category && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
        return matchesSearch && matchesCategory;
    });

    const handleSelectProduct = (p) => {
        if (!p) return;
        setSelectedProduct(p);
        const defaultColorId = (p.has_colors && p.colors && p.colors.length > 0)
            ? p.colors[0].id
            : '';
        setData((prev) => ({
            ...prev,
            product_id: p.id,
            product_color_id: defaultColorId,
        }));
        setPreCheckResult(null);
        setPreCheckError(null);
    };

    const selectedColor = (selectedProduct?.has_colors && selectedProduct?.colors)
        ? selectedProduct.colors.find((c) => String(c.id) === String(data.product_color_id)) || selectedProduct.colors[0]
        : null;

    // Fast Quantity Adjusters
    const adjustQuantity = (delta) => {
        const nextVal = Math.max(1, (parseInt(data.quantity) || 0) + delta);
        setData('quantity', nextVal);
    };

    const setQuickQuantity = (amount) => {
        setData('quantity', amount);
    };

    // Real-Time Dry-Run Stock Validation
    useEffect(() => {
        if (!data.product_id || !data.quantity || data.quantity < 1) {
            setPreCheckResult(null);
            setPreCheckError(null);
            setIsPreChecking(false);
            return;
        }

        setIsPreChecking(true);
        setPreCheckError(null);

        const timer = setTimeout(() => {
            axios.get(route('assignments.pre-check'), {
                params: {
                    product_id: data.product_id,
                    product_color_id: data.product_color_id || null,
                    quantity: data.quantity,
                },
            })
            .then((res) => {
                setPreCheckResult(res.data);
                setIsPreChecking(false);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || err.message || 'Failed to validate inventory stock.';
                setPreCheckError(msg);
                setIsPreChecking(false);
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [data.product_id, data.product_color_id, data.quantity]);

    const handleFinalSubmit = () => {
        setIsConfirmModalOpen(false);
        post(route('assignments.store'), {
            onError: (errs) => {
                const firstErr = Object.values(errs)[0] || 'Please fix the form errors.';
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: firstErr, type: 'danger' }
                    }));
                }
            }
        });
    };

    const selectedArtisan = safeLabour.find((l) => l && String(l.id) === String(data.labour_id));

    return (
        <AppLayout>
            <Head title="Create Work Order Assignment — Leather CRM" />

            <PageHeader
                title="Create Work Order Assignment"
                description="Assign artisan worker, set quantity, live-validate inventory, and generate official Work Order PDF"
                action={
                    <Link href={route('assignments.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4" /> Back to Ledger
                        </Button>
                    </Link>
                }
            />

            {/* Compact 2-Column Studio Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12">
                {/* LEFT PANEL: Product & Artisan Configuration (7 cols) */}
                <div className="lg:col-span-7 xl:col-span-7 space-y-5">
                    {/* SECTION 1: Product Selection */}
                    <Card>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-brand-600" />
                                    1. Product Specification
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Select product model to load Bill of Materials (BOM)
                                </p>
                            </div>
                            {selectedProduct && (
                                <Badge variant="warning" className="font-sans font-bold text-2xs">
                                    Selected: {selectedProduct.code}
                                </Badge>
                            )}
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="space-y-2.5 mb-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search product code (e.g. WAL-001) or name..."
                                    className="w-full text-xs pl-9 pr-3.5 py-2 border border-neutral-300 rounded-lg bg-neutral-0 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>

                            {availableCategories.length > 0 && (
                                <FilterChips
                                    options={availableCategories.map((cat) => ({ label: cat, value: cat }))}
                                    value={selectedCategory === 'ALL' ? '' : selectedCategory}
                                    onChange={(val) => setSelectedCategory(val || 'ALL')}
                                    allLabel="All Products"
                                    className="text-xs"
                                />
                            )}
                        </div>

                        {errors.product_id && (
                            <Alert variant="danger" className="mb-3">
                                {errors.product_id}
                            </Alert>
                        )}

                        {/* High-Density Product List */}
                        <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 scrollbar-thin border border-neutral-100 rounded-lg p-1.5 bg-neutral-50/50">
                            {filteredProducts.length === 0 ? (
                                <div className="py-6 text-center text-xs text-neutral-500">
                                    No products matching filter.
                                </div>
                            ) : (
                                filteredProducts.map((p) => {
                                    const isSelected = selectedProduct?.id === p.id;
                                    const codePrefix = (p.code || 'PRD').slice(0, 3).toUpperCase();
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSelectProduct(p)}
                                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? 'bg-brand-50/80 border-brand-500 shadow-xs ring-1 ring-brand-500'
                                                    : 'bg-neutral-0 border-neutral-200 hover:border-brand-300 hover:bg-neutral-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {p.image_url ? (
                                                    <img
                                                        src={p.image_url}
                                                        alt={p.name || ''}
                                                        className="w-10 h-10 rounded-md object-cover border border-neutral-200 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-brand-100/70 border border-brand-200 flex items-center justify-center text-brand-800 font-sans text-xs font-bold shrink-0">
                                                        {codePrefix}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-xs text-neutral-900 truncate">
                                                            {p.name || 'Unnamed Product'}
                                                        </span>
                                                        {p.category && (
                                                            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                                                                {p.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-2xs">
                                                        <span className="font-sans font-bold text-brand-700 text-xs">
                                                            {p.code || 'NO-CODE'}
                                                        </span>
                                                        {Array.isArray(p.materials) && (
                                                            <span className="text-neutral-500">
                                                                • {p.materials.length} BOM materials
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                {isSelected ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-md">
                                                        <Check className="w-3.5 h-3.5 text-brand-600" /> Selected
                                                    </span>
                                                ) : (
                                                    <span className="text-2xs text-neutral-400 font-medium hover:text-brand-600">
                                                        Select →
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>

                    {/* COLORWAY SELECTION (Visible when selected product has multi-color variations) */}
                    {selectedProduct?.has_colors && selectedProduct.colors?.length > 0 && (
                        <div className="p-4 bg-brand-50/70 rounded-xl border border-brand-300 ring-1 ring-brand-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                                    <Palette className="w-4 h-4 text-brand-700" />
                                    Select Production Colorway <span className="text-danger-500">*</span>
                                </label>
                                <span className="text-[11px] font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full border border-brand-200">
                                    {selectedProduct.colors.length} Available Colorways
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {selectedProduct.colors.map((color) => {
                                    const isSelected = String(data.product_color_id) === String(color.id);
                                    return (
                                        <div
                                            key={color.id}
                                            onClick={() => setData('product_color_id', color.id)}
                                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
                                                isSelected
                                                    ? 'bg-brand-600 text-white border-brand-700 shadow-xs ring-2 ring-brand-500/30'
                                                    : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                                isSelected ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-800'
                                            }`}>
                                                <Palette className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold truncate">
                                                    {color.color_name}
                                                </p>
                                                <p className={`text-[10px] truncate ${isSelected ? 'text-brand-100' : 'text-neutral-500'}`}>
                                                    {color.materials ? `${color.materials.length} BOM items` : 'Custom BOM'}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-white shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.product_color_id && (
                                <p className="text-xs text-danger-600 font-medium">{errors.product_color_id}</p>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: Artisan & Production Targets */}
                    <Card>
                        <div className="pb-3 mb-3 border-b border-neutral-200">
                            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-600" />
                                2. Artisan Worker & Production Targets
                            </h3>
                            <p className="text-[11px] text-neutral-500">
                                Assign craftsman, set order quantity, and add crafting notes
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                                {/* Artisan Dropdown (7 cols) */}
                                <div className="sm:col-span-7">
                                    <Select
                                        label="Artisan Craftsman"
                                        required
                                        value={data.labour_id}
                                        onChange={(e) => setData('labour_id', e.target.value)}
                                        error={errors.labour_id}
                                    >
                                        <option value="">— Choose Artisan Worker —</option>
                                        {safeLabour.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.phone || 'N/A'})
                                            </option>
                                        ))}
                                    </Select>

                                    {selectedArtisan && (
                                        <div className="mt-2 p-2 bg-neutral-50 rounded-md border border-neutral-200 flex items-center justify-between text-xs">
                                            <span className="text-neutral-600 text-2xs">
                                                Skill: <strong>{Array.isArray(selectedArtisan.skill_tags) && selectedArtisan.skill_tags.length > 0 ? selectedArtisan.skill_tags.join(', ') : 'Leather Craftsman'}</strong>
                                            </span>
                                            <span className="text-2xs text-neutral-500 font-sans">
                                                {selectedArtisan.phone}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Order Quantity Stepper (5 cols) */}
                                <div className="sm:col-span-5 space-y-1.5">
                                    <label className="block text-xs font-medium text-neutral-700">
                                        Batch Quantity (Pcs) <span className="text-danger-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => adjustQuantity(-1)}
                                            className="p-2 rounded-md border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100 active:scale-95"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value) || '')}
                                            error={errors.quantity}
                                            className="text-center font-sans font-bold text-sm py-1.5"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => adjustQuantity(1)}
                                            className="p-2 rounded-md border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100 active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Preset Quick Chips */}
                                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                                        {[10, 25, 50, 100, 250].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setQuickQuantity(preset)}
                                                className={`px-2 py-0.5 rounded text-[11px] font-sans transition-colors ${
                                                    data.quantity === preset
                                                        ? 'bg-brand-600 text-white font-bold'
                                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                }`}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Textarea
                                label="Production & Finishing Instructions (Optional)"
                                rows={2}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="e.g. Priority dispatch by Friday, custom contrast edge paint finish..."
                                error={errors.notes}
                            />
                        </div>
                    </Card>
                </div>

                {/* RIGHT PANEL: Live Stock Pre-Check & Action Summary (5 cols - Sticky Safe Offset) */}
                <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-[76px] space-y-4">
                    <Card className="border-brand-200/90 shadow-sm bg-neutral-0 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
                        <div className="pb-3 mb-3 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-600" />
                                3. Live Inventory Stock Pre-Check
                            </h3>
                            {isPreChecking && (
                                <span className="text-2xs text-brand-600 animate-pulse font-medium">
                                    Checking stock...
                                </span>
                            )}
                        </div>

                        {!selectedProduct ? (
                            <div className="py-8 text-center text-xs text-neutral-500">
                                Select a product on the left to live-check inventory availability.
                            </div>
                        ) : isPreChecking ? (
                            <div className="py-8 text-center space-y-2">
                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-neutral-500">
                                    Calculating requirement for {data.quantity} pcs of {selectedProduct.name}…
                                </p>
                            </div>
                        ) : preCheckError ? (
                            <Alert variant="danger" title="Validation Error" className="text-xs">
                                {preCheckError}
                            </Alert>
                        ) : preCheckResult ? (
                            <div className="space-y-4">
                                {/* Overall Stock Status Banner */}
                                {preCheckResult.can_assign ? (
                                    <div className="p-3 bg-success-50 border border-success-200 rounded-lg flex items-start gap-2.5">
                                        <ShieldCheck className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-success-900">Stock Availability Verified</h4>
                                            <p className="text-[11px] text-success-700 mt-0.5">
                                                All {preCheckResult.items?.length || 0} BOM items required for {data.quantity} pcs are in stock.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-2.5">
                                        <AlertTriangle className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-danger-900">Insufficient Warehouse Stock</h4>
                                            <p className="text-[11px] text-danger-700 mt-0.5">
                                                One or more materials fall short. Please restock or reduce quantity.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Compact Material Consumption Checklist */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-2xs font-bold text-neutral-500 uppercase tracking-wider">
                                        <span>Raw Material Breakdown</span>
                                        <span>Stock Status</span>
                                    </div>

                                    {!Array.isArray(preCheckResult?.items) || preCheckResult.items.length === 0 ? (
                                        <div className="p-3 bg-neutral-50 rounded-md text-center text-xs text-neutral-500 border border-neutral-200">
                                            No BOM materials configured for this product.
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                            {preCheckResult.items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                                        item.is_sufficient
                                                            ? 'bg-neutral-50/70 border-neutral-200'
                                                            : 'bg-danger-50 border-danger-300'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-neutral-900 truncate">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-2xs text-neutral-500 tabular-nums">
                                                            Need: <strong className="text-neutral-800">{item.needed} {item.unit}</strong> | Stock: {item.available} {item.unit}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        {item.is_sufficient ? (
                                                            <span className="text-[10px] font-bold text-success-700 bg-success-100/80 px-2 py-0.5 rounded">
                                                                OK
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-danger-700 bg-danger-100 px-2 py-0.5 rounded">
                                                                Short: {item.shortage} {item.unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Order & Production Summary */}
                                <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-200/70 text-xs space-y-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Product:</span>
                                        <strong className="text-neutral-900 font-sans font-bold">{selectedProduct.code} ({selectedProduct.name})</strong>
                                    </div>
                                    {selectedProduct.has_colors && selectedColor && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600">Colorway:</span>
                                            <strong className="text-brand-800 font-bold flex items-center gap-1">
                                                <Palette className="w-3.5 h-3.5 text-brand-600" />
                                                {selectedColor.color_name}
                                            </strong>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Batch Target:</span>
                                        <strong className="text-neutral-900 font-bold">{data.quantity} pcs</strong>
                                    </div>
                                    {selectedArtisan && (
                                        <div className="flex justify-between pt-1 border-t border-brand-200/50">
                                            <span className="text-neutral-600">Assigned Artisan:</span>
                                            <strong className="text-brand-900">
                                                {selectedArtisan.name}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                {/* Primary Action Button */}
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="lg"
                                    className="w-full shadow-md font-semibold justify-center gap-2"
                                    disabled={!preCheckResult.can_assign || !data.labour_id || processing}
                                    onClick={() => setIsConfirmModalOpen(true)}
                                >
                                    <ClipboardCheck className="w-5 h-5" />
                                    Confirm & Generate Work Order
                                </Button>
                            </div>
                        ) : null}
                    </Card>
                </div>
            </div>

            {/* MODERN STUDIO CONFIRMATION MODAL */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                maxWidth="max-w-xl"
                title="Confirm Work Order & Allocate Stock"
            >
                <div className="space-y-5 text-left font-sans">
                    {/* HERO PRODUCT SHOWCASE CARD */}
                    <div className="p-4 bg-gradient-to-br from-brand-50/60 via-neutral-50 to-white rounded-xl border border-brand-200 shadow-xs space-y-3.5">
                        {/* Top: Thumbnail, DM Sans Product Name & Code */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {selectedProduct?.image_url ? (
                                    <img
                                        src={selectedProduct.image_url}
                                        alt={selectedProduct?.name || ''}
                                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0 shadow-2xs"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-800 font-sans text-sm font-bold shrink-0 shadow-2xs">
                                        {(selectedProduct?.code || 'PRD').slice(0, 3).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                                            {selectedProduct?.name || 'Product Specification'}
                                        </h3>
                                        {selectedProduct?.category && (
                                            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                                                {selectedProduct.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-sans text-[15px] font-bold text-brand-700 mt-0.5">
                                        Code: {selectedProduct?.code || 'NO-CODE'}
                                        {selectedProduct?.has_colors && selectedColor && (
                                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                                                Color: {selectedColor.color_name}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dual Metric Highlights */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-200/80 text-xs">
                            <div className="p-2.5 bg-white rounded-lg border border-neutral-200 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold shrink-0">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-neutral-500 font-medium">Batch Target</p>
                                    <p className="font-display font-bold text-neutral-900 text-sm">{data.quantity} Pcs</p>
                                </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-lg border border-neutral-200 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 font-bold shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-neutral-500 font-medium">Assigned Artisan</p>
                                    <p className="font-semibold text-neutral-900 truncate">{selectedArtisan?.name || 'Not Selected'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes Callout */}
                        {data.notes && (
                            <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/70 text-xs text-amber-900 italic flex items-start gap-2">
                                <span className="text-amber-600 not-italic font-bold text-xs">Note:</span>
                                <span>"{data.notes}"</span>
                            </div>
                        )}
                    </div>

                    {/* DEDUCTED RAW MATERIALS RECIPE GRID */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-brand-600" />
                                Automatic Stock Deductions
                            </h4>
                            <span className="text-[11px] text-success-700 font-semibold bg-success-50 px-2 py-0.5 rounded border border-success-200">
                                ✓ All in stock
                            </span>
                        </div>

                        {!Array.isArray(preCheckResult?.items) || preCheckResult.items.length === 0 ? (
                            <div className="p-3 bg-neutral-50 rounded-lg text-center text-xs text-neutral-500 border border-neutral-200">
                                No raw materials assigned in BOM recipe.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                                {preCheckResult.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2 bg-neutral-50/80 rounded-lg border border-neutral-200 flex items-center justify-between gap-2 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-semibold text-neutral-900 truncate text-[11px]">
                                                {item.label}
                                            </p>
                                            <p className="text-[10px] text-neutral-500 tabular-nums">
                                                Avail: {item.available} {item.unit}
                                            </p>
                                        </div>
                                        <span className="font-sans font-bold text-xs text-danger-700 bg-danger-50 px-2 py-0.5 rounded border border-danger-200 shrink-0">
                                            -{item.needed} {item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Micro Security Guarantee */}
                    <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>Row-level database locks ensure zero concurrency conflicts & auto-generates official Work Order PDF.</span>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="text-xs px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            isLoading={processing}
                            onClick={handleFinalSubmit}
                            className="text-xs px-5 py-2 font-semibold shadow-xs flex items-center gap-1.5"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                            Confirm & Deduct Stock
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
