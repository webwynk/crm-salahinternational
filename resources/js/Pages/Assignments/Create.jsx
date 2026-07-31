import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import { Search, CheckCircle2, AlertTriangle, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';

import axios from 'axios';

export default function Create({ products = [], labour = [] }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [preCheckResult, setPreCheckResult] = useState(null);
    const [isPreChecking, setIsPreChecking] = useState(false);
    const [preCheckError, setPreCheckError] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        labour_id: '',
        quantity: 10,
        notes: '',
    });

    const filteredProducts = products.filter(
        (p) =>
            p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleSelectProduct = (p) => {
        setSelectedProduct(p);
        setData('product_id', p.id);
        setPreCheckResult(null);
        setPreCheckError(null);
    };

    // Run Dry-Run Pre-Check Stock Validation whenever product or quantity changes
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
                console.error('Pre-check stock error:', err);
                const msg = err.response?.data?.message || err.message || 'Failed to validate inventory stock. Please try again.';
                setPreCheckError(msg);
                setIsPreChecking(false);
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [data.product_id, data.quantity]);

    const handleFinalSubmit = () => {
        setIsConfirmModalOpen(false);
        post(route('assignments.store'));
    };

    return (
        <AppLayout>
            <Head title="Assign Work Order - Leather CRM" />

            <PageHeader
                title="Create Work Order Assignment"
                description="Select a product, assign to a artisan, validate inventory stock, and auto-generate PDF work order"
                action={
                    <Link href={route('assignments.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Assignments
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* 1. Select Product by Code or Name */}
                    <Card>
                        <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
                            1. Select Product Definition (by Code or Name)
                        </h3>

                        <div className="relative mb-3">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Search product code e.g. WAL-BF-001 or name..."
                                className="w-full text-sm pl-9 pr-3 py-2 border border-neutral-300 rounded bg-white"
                            />
                        </div>

                        {errors.product_id && (
                            <Alert variant="danger" className="mb-3">
                                {errors.product_id}
                            </Alert>
                        )}

                        <div className="max-h-56 overflow-y-auto space-y-2 border border-neutral-200 rounded p-2 bg-neutral-50/50">
                            {filteredProducts.length === 0 ? (
                                <p className="text-xs text-neutral-500 py-3 text-center">No products matching search.</p>
                            ) : (
                                filteredProducts.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleSelectProduct(p)}
                                        className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                                            selectedProduct?.id === p.id
                                                ? 'bg-brand-50 border-brand-500 shadow-xs'
                                                : 'bg-white border-neutral-200 hover:border-neutral-300'
                                        }`}
                                    >
                                        <div>
                                            <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 mr-2">
                                                {p.code}
                                            </span>
                                            <span className="font-semibold text-sm text-neutral-900">{p.name}</span>
                                        </div>
                                        {selectedProduct?.id === p.id && (
                                            <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* 2. Select Labour Artisan & Target Quantity */}
                    <Card>
                        <h3 className="text-md font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                            2. Assign Artisan Worker & Target Quantity
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Select Artisan / Worker *
                                </label>
                                <select
                                    value={data.labour_id}
                                    onChange={(e) => setData('labour_id', e.target.value)}
                                    className="w-full text-base px-3.5 py-2.5 rounded-sm border border-neutral-300 bg-white"
                                >
                                    <option value="">-- Choose Artisan Worker --</option>
                                    {labour.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} ({w.phone}) - {Array.isArray(w.skill_tags) ? w.skill_tags.join(', ') : 'Craftsman'}
                                        </option>
                                    ))}
                                </select>
                                {errors.labour_id && <p className="text-xs text-danger-700 mt-1">{errors.labour_id}</p>}
                            </div>

                            <Input
                                label="Target Order Quantity (Pcs)"
                                type="number"
                                required
                                min="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value) || '')}
                                error={errors.quantity}
                                helperText="Material requirements auto-scale by this quantity"
                            />

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Special Production Notes (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="e.g. Priority dispatch by Friday..."
                                    className="w-full text-base px-3.5 py-2.5 rounded-sm border border-neutral-300"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Live Stock Validation Panel (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="sticky top-20">
                        <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200 flex items-center justify-between">
                            <span>3. Inventory Stock Validation</span>
                            {isPreChecking && <span className="text-xs text-neutral-400 font-normal">Checking...</span>}
                        </h3>

                        {!selectedProduct ? (
                            <p className="text-xs text-neutral-500 py-8 text-center bg-neutral-50 rounded border border-neutral-200">
                                Select a product from step 1 to run live inventory stock validation.
                            </p>
                        ) : isPreChecking ? (
                            <p className="text-xs text-neutral-500 py-8 text-center animate-pulse">
                                Validating stock requirements...
                            </p>
                        ) : preCheckError ? (
                            <Alert variant="danger" title="Validation Failed">
                                {preCheckError}
                            </Alert>
                        ) : !preCheckResult ? (
                            <p className="text-xs text-neutral-500 py-8 text-center">
                                Select product and quantity to check stock.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {preCheckResult.can_assign ? (
                                    <Alert variant="success" title="Stock Sufficient">
                                        All required raw materials are available in inventory stock for {data.quantity} pcs of {selectedProduct.name}.
                                    </Alert>
                                ) : (
                                    <Alert variant="danger" title="Stock Insufficient">
                                        One or more raw materials fall short in stock. Production assignment disabled.
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                        Required Raw Materials Breakdown:
                                    </h4>
                                    {preCheckResult.items.length === 0 ? (
                                        <p className="text-xs text-neutral-500 italic p-3 bg-neutral-50 rounded border border-neutral-200">
                                            This product has no physical raw materials linked in its specification (process notes only).
                                        </p>
                                    ) : (
                                        preCheckResult.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded border text-xs flex items-center justify-between ${
                                                    item.is_sufficient
                                                        ? 'bg-neutral-50 border-neutral-200'
                                                        : 'bg-danger-50 border-danger-500/40 text-danger-900 font-semibold'
                                                }`}
                                            >
                                                <div>
                                                    <span className="font-semibold text-neutral-900 block">{item.label}</span>
                                                    <span className="text-neutral-500">
                                                        Needed: {item.needed} {item.unit} | Available: {item.available} {item.unit}
                                                    </span>
                                                </div>
                                                <div>
                                                    {item.is_sufficient ? (
                                                        <Badge variant="success">OK</Badge>
                                                    ) : (
                                                        <Badge variant="danger">
                                                            Short by {item.shortage} {item.unit}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="pt-4 border-t border-neutral-200">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        disabled={!preCheckResult.can_assign || !data.labour_id || processing}
                                        onClick={() => setIsConfirmModalOpen(true)}
                                    >
                                        <ShieldCheck className="w-5 h-5 mr-2" /> Review & Confirm Assignment
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Final Confirmation Review Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Work Order & Auto-Deduct Inventory Stock"
            >
                <div className="space-y-4">
                    <Alert variant="warning" title="Transactional Action">
                        Submitting this work order will immediately deduct inventory stock in a safe database transaction and auto-generate the Work Order PDF.
                    </Alert>

                    <div className="p-4 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Product:</span>
                            <strong className="text-neutral-900">{selectedProduct?.name} ({selectedProduct?.code})</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Target Quantity:</span>
                            <strong className="text-neutral-900">{data.quantity} Pcs</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Artisan Worker:</span>
                            <strong className="text-neutral-900">
                                {labour.find((l) => l.id == data.labour_id)?.name}
                            </strong>
                        </div>
                    </div>

                    <div className="space-y-1 text-xs">
                        <p className="font-bold text-neutral-700">Stock to be deducted:</p>
                        <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                            {preCheckResult?.items.map((it, i) => (
                                <li key={i}>
                                    <strong>{it.needed} {it.unit}</strong> of {it.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" isLoading={processing} onClick={handleFinalSubmit}>
                            Confirm & Deduct Stock
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
