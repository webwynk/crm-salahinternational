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
import Stepper from '@/Components/ui/Stepper';
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
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import axios from 'axios';

export default function Create({ products = [], labour = [] }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [preCheckResult, setPreCheckResult] = useState(null);
    const [isPreChecking, setIsPreChecking] = useState(false);
    const [preCheckError, setPreCheckError] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const safeProducts = Array.isArray(products) ? products : (products?.data || []);
    const safeLabour = Array.isArray(labour) ? labour : (labour?.data || []);

    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        labour_id: '',
        quantity: 10,
        notes: '',
    });

    const wizardSteps = [
        { title: '1. Product Spec', description: 'Select product code' },
        { title: '2. Artisan & Quantity', description: 'Assign worker & units' },
        { title: '3. Stock Validation', description: 'Live stock pre-check' },
    ];

    // Filter products safely with null guards
    const filteredProducts = safeProducts.filter((p) => {
        if (!p) return false;
        const codeStr = (p.code || '').toLowerCase();
        const nameStr = (p.name || '').toLowerCase();
        const searchStr = (productSearch || '').toLowerCase();
        const matchesSearch = codeStr.includes(searchStr) || nameStr.includes(searchStr);
        const matchesCategory =
            selectedCategory === 'ALL' ||
            !selectedCategory ||
            (p.category && p.category.toUpperCase() === selectedCategory.toUpperCase());
        return matchesSearch && matchesCategory;
    });

    const handleSelectProduct = (p) => {
        if (!p) return;
        setSelectedProduct(p);
        setData('product_id', p.id);
        setPreCheckResult(null);
        setPreCheckError(null);
        setCurrentStep(2);
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: `Selected Product: ${p.name || ''} (${p.code || ''})`, type: 'info' }
            }));
        }
    };

    // Fast Quantity Adjusters
    const adjustQuantity = (delta) => {
        const nextVal = Math.max(1, (parseInt(data.quantity) || 0) + delta);
        setData('quantity', nextVal);
    };

    const setQuickQuantity = (amount) => {
        setData('quantity', amount);
    };

    // Dry-Run Stock Validation
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
            axios.post(route('assignments.pre-check'), {
                product_id: data.product_id,
                quantity: data.quantity,
            })
            .then((res) => {
                setPreCheckResult(res.data);
                setIsPreChecking(false);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || err.message || 'Failed to validate inventory stock.';
                setPreCheckError(msg);
                setIsPreChecking(false);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: msg, type: 'danger' }
                    }));
                }
            });
        }, 250);

        return () => clearTimeout(timer);
    }, [data.product_id, data.quantity]);

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
                description="Assign artisan worker, set quantity, dry-run inventory stock deduction, and generate official PDF Work Order"
                action={
                    <Link href={route('assignments.index')}>
                        <Button variant="outline" size="sm" className="min-h-touch">
                            <ArrowLeft className="w-4 h-4" /> Back to Ledger
                        </Button>
                    </Link>
                }
            />

            <div className="w-full space-y-6 pb-12">
                {/* Stepper Card */}
                <Card className="shadow-xs border-neutral-200">
                    <Stepper
                        steps={wizardSteps}
                        currentStep={currentStep}
                        onStepClick={(step) => {
                            if (step === 2 && !selectedProduct) return;
                            if (step === 3 && (!selectedProduct || !data.labour_id)) return;
                            setCurrentStep(step);
                        }}
                    />
                </Card>

                {/* STEP 1: Select Product */}
                {currentStep === 1 && (
                    <Card className="shadow-xs border-neutral-200 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                            <div>
                                <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-brand-600" />
                                    Step 1: Select Product Specification
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Choose product code to load Bill of Materials (BOM) consumption rates
                                </p>
                            </div>

                            {selectedProduct && (
                                <Badge variant="warning" className="self-start sm:self-center font-mono">
                                    Selected: {selectedProduct.code || ''}
                                </Badge>
                            )}
                        </div>

                        {/* Search Bar & Category Filter Chips */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search product code (e.g. WAL-BF-001) or product name..."
                                    className="w-full text-sm min-h-touch pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl bg-neutral-0 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-neutral-400"
                                />
                            </div>

                            <FilterChips
                                options={[
                                    { label: 'Wallets', value: 'WALLETS' },
                                    { label: 'Bags & Folios', value: 'BAGS' },
                                    { label: 'Belts & Straps', value: 'BELTS' },
                                    { label: 'Accessories', value: 'ACCESSORIES' },
                                ]}
                                value={selectedCategory === 'ALL' ? '' : selectedCategory}
                                onChange={(val) => setSelectedCategory(val || 'ALL')}
                                allLabel="All Products"
                            />
                        </div>

                        {errors.product_id && (
                            <Alert variant="danger" title="Selection Error">
                                {errors.product_id}
                            </Alert>
                        )}

                        {/* Products Grid */}
                        <div className="max-h-[420px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                            {filteredProducts.length === 0 ? (
                                <div className="py-12 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                                    <Package className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-60" />
                                    <p className="text-xs font-semibold text-neutral-700">No products found</p>
                                    <p className="text-2xs text-neutral-500 mt-1">Try adjusting your search code or category filter</p>
                                </div>
                            ) : (
                                filteredProducts.map((p) => {
                                    const isSelected = selectedProduct?.id === p.id;
                                    const codePrefix = (p.code || 'PRD').slice(0, 3).toUpperCase();
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSelectProduct(p)}
                                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                                isSelected
                                                    ? 'bg-brand-50/70 border-brand-500 shadow-sm ring-1 ring-brand-500'
                                                    : 'bg-neutral-0 border-neutral-200/90 hover:border-brand-300 hover:bg-neutral-50/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {p.image_url ? (
                                                    <img
                                                        src={p.image_url}
                                                        alt={p.name || ''}
                                                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-mono text-xs font-bold shrink-0">
                                                        {codePrefix}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs sm:text-sm text-neutral-900 truncate">
                                                            {p.name || 'Unnamed Product'}
                                                        </span>
                                                        {p.category && (
                                                            <span className="text-2xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                                                                {p.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-2xs">
                                                        <span className="font-mono font-bold text-brand-700">
                                                            {p.code || 'NO-CODE'}
                                                        </span>
                                                        {Array.isArray(p.materials) && (
                                                            <span className="text-neutral-500">
                                                                BOM: {p.materials.length} materials
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {isSelected ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg">
                                                        <CheckCircle2 className="w-4 h-4 text-brand-600" /> Selected
                                                    </span>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="text-xs text-neutral-600">
                                                        Select →
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                )}

                {/* STEP 2: Assign Artisan & Qty */}
                {currentStep === 2 && (
                    <Card className="shadow-xs border-neutral-200 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                            <div>
                                <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-brand-600" />
                                    Step 2: Assign Artisan Worker & Order Quantity
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Assign skilled leather craftsman and set batch production targets
                                </p>
                            </div>

                            {selectedProduct && (
                                <div className="flex items-center gap-2 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 self-start sm:self-center">
                                    <Package className="w-4 h-4 text-brand-600 shrink-0" />
                                    <span className="text-xs font-mono font-bold text-brand-900">
                                        {selectedProduct.name} ({selectedProduct.code})
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Artisan Worker Selector */}
                            <Select
                                label="Select Artisan Worker"
                                required
                                value={data.labour_id}
                                onChange={(e) => setData('labour_id', e.target.value)}
                                error={errors.labour_id}
                                helperText="Artisan responsible for assembly, stitching, edge paint, and quality sign-off"
                            >
                                <option value="">— Choose Artisan Craftsman —</option>
                                {safeLabour.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name || 'Worker'} ({w.phone || 'N/A'}) — Skill: {Array.isArray(w.skill_tags) ? w.skill_tags.join(', ') : 'Leather Artisan'} — Rate: ₹{w.piece_rate || 0}/pc
                                    </option>
                                ))}
                            </Select>

                            {/* Artisan Details Card Preview */}
                            {selectedArtisan && (
                                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-800 font-bold text-sm shrink-0">
                                            {(selectedArtisan.name || 'ART').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900 text-sm">{selectedArtisan.name || 'Artisan'}</p>
                                            <p className="text-2xs text-neutral-500">{selectedArtisan.phone || ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="info">
                                            Rate: ₹{selectedArtisan.piece_rate || 0}/pc
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Quantity Controls & Quick Preset Chips */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-semibold text-neutral-700">
                                    Production Order Quantity (Pcs) <span className="text-danger-500">*</span>
                                </label>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => adjustQuantity(-5)}
                                        className="min-h-touch px-3 rounded-xl border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100 active:scale-95 font-bold transition-all"
                                    >
                                        -5
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => adjustQuantity(-1)}
                                        className="min-h-touch p-3 rounded-xl border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value) || '')}
                                        error={errors.quantity}
                                        className="text-center font-mono font-bold text-base min-h-touch"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => adjustQuantity(1)}
                                        className="min-h-touch p-3 rounded-xl border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => adjustQuantity(5)}
                                        className="min-h-touch px-3 rounded-xl border border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-100 active:scale-95 font-bold transition-all"
                                    >
                                        +5
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                                    <span className="text-2xs font-semibold text-neutral-500 shrink-0">Presets:</span>
                                    {[10, 25, 50, 100, 250].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setQuickQuantity(preset)}
                                            className={`px-2.5 py-1 rounded-lg text-2xs font-mono font-semibold transition-all shrink-0 ${
                                                data.quantity === preset
                                                    ? 'bg-brand-600 text-white shadow-xs'
                                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                        >
                                            {preset} pcs
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Production Notes */}
                            <Textarea
                                label="Production & Finishing Instructions (Optional)"
                                rows={2}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="e.g. Priority dispatch by Friday, custom contrast edge paint finish..."
                                error={errors.notes}
                            />

                            {/* Navigation Bar */}
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                <Button variant="outline" onClick={() => setCurrentStep(1)} className="min-h-touch">
                                    <ArrowLeft className="w-4 h-4" /> Back to Product
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={!data.labour_id || !data.quantity}
                                    onClick={() => setCurrentStep(3)}
                                    className="min-h-touch"
                                >
                                    Proceed to Stock Validation <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* STEP 3: Stock Validation */}
                {currentStep === 3 && (
                    <Card className="shadow-xs border-neutral-200 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                            <div>
                                <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-brand-600" />
                                    Step 3: Inventory Stock Validation & Pre-Check
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Dry-run calculation against current warehouse raw materials stock
                                </p>
                            </div>

                            {selectedProduct && (
                                <Badge variant="warning" className="font-mono">
                                    Target: {data.quantity} Pcs
                                </Badge>
                            )}
                        </div>

                        {!selectedProduct ? (
                            <Alert variant="warning">Please select a product in Step 1 first.</Alert>
                        ) : isPreChecking ? (
                            <div className="py-12 text-center space-y-3">
                                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-neutral-600 font-semibold animate-pulse">
                                    Calculating stock requirement for {data.quantity} pcs of {selectedProduct.name}…
                                </p>
                            </div>
                        ) : preCheckError ? (
                            <Alert variant="danger" title="Validation Error">
                                {preCheckError}
                            </Alert>
                        ) : !preCheckResult ? (
                            <p className="text-xs text-neutral-500 py-6 text-center">Checking stock availability…</p>
                        ) : (
                            <div className="space-y-6">
                                {/* Overall Status Banner */}
                                {preCheckResult.can_assign ? (
                                    <div className="p-4 bg-success-50 border border-success-200 rounded-xl flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-success-900">Stock Availability Verified</h4>
                                            <p className="text-2xs text-success-700 mt-0.5">
                                                All raw material items required for {data.quantity} pcs of {selectedProduct.name} are available in stock.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-danger-900">Insufficient Warehouse Stock</h4>
                                            <p className="text-2xs text-danger-700 mt-0.5">
                                                One or more raw materials fall short. Please restock materials or reduce order quantity before confirming.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Material Breakdown Grid */}
                                <div className="space-y-3">
                                    <h4 className="text-2xs font-bold text-neutral-600 uppercase tracking-wider">
                                        Material Consumption Breakdown:
                                    </h4>

                                    {!Array.isArray(preCheckResult?.items) || preCheckResult.items.length === 0 ? (
                                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
                                            This product has no BOM materials configured.
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {preCheckResult.items.map((item, idx) => {
                                                const pct = Math.min(100, Math.round(((item.available || 0) / (item.needed || 1)) * 100));
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-3.5 rounded-xl border transition-all ${
                                                            item.is_sufficient
                                                                ? 'bg-neutral-0 border-neutral-200'
                                                                : 'bg-danger-50/50 border-danger-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between text-xs mb-2">
                                                            <div>
                                                                <span className="font-semibold text-neutral-900 block">{item.label}</span>
                                                                <span className="text-2xs text-neutral-500 tabular-nums">
                                                                    Needed: <strong className="text-neutral-800">{item.needed} {item.unit}</strong> | Stock: {item.available} {item.unit}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                {item.is_sufficient ? (
                                                                    <Badge variant="success">OK in Stock</Badge>
                                                                ) : (
                                                                    <Badge variant="danger">
                                                                        Short by {item.shortage} {item.unit}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Progress Meter Bar */}
                                                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${
                                                                    item.is_sufficient ? 'bg-success-500' : 'bg-danger-500'
                                                                }`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="min-h-touch">
                                        <ArrowLeft className="w-4 h-4" /> Back to Artisan
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        disabled={!preCheckResult?.can_assign || !data.labour_id || processing}
                                        onClick={() => setIsConfirmModalOpen(true)}
                                        className="min-h-touch shadow-md"
                                    >
                                        <ClipboardCheck className="w-5 h-5" /> Review & Confirm Work Order
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Transactional Confirmation Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Work Order & Auto-Deduct Inventory"
            >
                <div className="space-y-4 text-xs">
                    <Alert variant="warning" title="Transactional Database Execution">
                        Submitting will create assignment ledger record, deduct raw materials stock with row-level locks, and generate PDF Work Order.
                    </Alert>

                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Product Specification:</span>
                            <strong className="text-neutral-900 font-mono">
                                {selectedProduct?.name || ''} ({selectedProduct?.code || ''})
                            </strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Target Quantity:</span>
                            <strong className="text-neutral-900 tabular-nums font-bold text-sm">
                                {data.quantity} Pcs
                            </strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Assigned Artisan:</span>
                            <strong className="text-neutral-900">
                                {selectedArtisan?.name || ''}
                            </strong>
                        </div>
                        {data.notes && (
                            <div className="pt-2 border-t border-neutral-200 text-neutral-600 italic">
                                "{data.notes}"
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <p className="font-bold text-neutral-700">Stock Deductions Breakdown:</p>
                        <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                            {Array.isArray(preCheckResult?.items) && preCheckResult.items.map((it, i) => (
                                <li key={i}>
                                    <strong className="tabular-nums text-neutral-900">{it.needed} {it.unit}</strong> of {it.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} className="min-h-touch">
                            Cancel
                        </Button>
                        <Button variant="primary" isLoading={processing} onClick={handleFinalSubmit} className="min-h-touch">
                            Confirm & Deduct Stock
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
