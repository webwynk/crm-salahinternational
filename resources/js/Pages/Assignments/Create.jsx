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
import { Search, CheckCircle2, ArrowLeft, ClipboardCheck, Package } from 'lucide-react';

import axios from 'axios';

export default function Create({ products = [], labour = [] }) {
    const [currentStep, setCurrentStep] = useState(1);
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

    const wizardSteps = [
        { title: '1. Product', description: 'Select spec code' },
        { title: '2. Artisan & Qty', description: 'Assign worker' },
        { title: '3. Validation', description: 'Check stock on hand' },
    ];

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
        setCurrentStep(2);
    };

    // Run Dry-Run Pre-Check Stock Validation
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
                const msg = err.response?.data?.message || err.message || 'Failed to validate inventory stock. Please try again.';
                setPreCheckError(msg);
                setIsPreChecking(false);
            });
        }, 250);

        return () => clearTimeout(timer);
    }, [data.product_id, data.quantity]);

    const handleFinalSubmit = () => {
        setIsConfirmModalOpen(false);
        post(route('assignments.store'));
    };

    return (
        <AppLayout>
            <Head title="Assign Work Order — Leather CRM" />

            <PageHeader
                title="Create Work Order Assignment"
                description="3-step wizard: select product definition, assign artisan worker, validate inventory stock, and auto-generate PDF"
                action={
                    <Link href={route('assignments.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4" /> Back to Assignments
                        </Button>
                    </Link>
                }
            />

            <div className="max-w-4xl space-y-6">
                {/* Visual Wizard Stepper */}
                <Card>
                    <Stepper
                        steps={wizardSteps}
                        currentStep={currentStep}
                        onStepClick={(step) => setCurrentStep(step)}
                    />
                </Card>

                {/* Step 1: Select Product */}
                {currentStep === 1 && (
                    <Card>
                        <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
                            Step 1: Select Product Definition
                        </h3>

                        <div className="relative mb-4">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Search product by code (e.g. WAL-BF-001) or name…"
                                className="w-full text-sm pl-9 pr-3.5 py-2.5 border border-neutral-300 rounded-md bg-neutral-0 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>

                        {errors.product_id && (
                            <Alert variant="danger" className="mb-4">
                                {errors.product_id}
                            </Alert>
                        )}

                        <div className="max-h-72 overflow-y-auto space-y-2 border border-neutral-200 rounded-md p-2 bg-neutral-50/50">
                            {filteredProducts.length === 0 ? (
                                <p className="text-xs text-neutral-500 py-6 text-center">No matching products found.</p>
                            ) : (
                                filteredProducts.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleSelectProduct(p)}
                                        className={`p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between ${
                                            selectedProduct?.id === p.id
                                                ? 'bg-brand-50 border-brand-500 shadow-xs'
                                                : 'bg-neutral-0 border-neutral-200 hover:border-brand-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-mono text-xs font-bold shrink-0">
                                                {p.code.slice(0, 3)}
                                            </div>
                                            <div>
                                                <span className="font-semibold text-sm text-neutral-900 block">{p.name}</span>
                                                <span className="font-mono text-xs text-brand-700 font-bold">{p.code}</span>
                                            </div>
                                        </div>
                                        {selectedProduct?.id === p.id && (
                                            <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                )}

                {/* Step 2: Assign Artisan & Qty */}
                {currentStep === 2 && (
                    <Card>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200">
                            <h3 className="text-md font-bold text-neutral-900">
                                Step 2: Assign Artisan Worker & Order Quantity
                            </h3>
                            {selectedProduct && (
                                <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                    Selected: {selectedProduct.name} ({selectedProduct.code})
                                </span>
                            )}
                        </div>

                        <div className="space-y-5">
                            <Select
                                label="Select Artisan Worker"
                                required
                                value={data.labour_id}
                                onChange={(e) => setData('labour_id', e.target.value)}
                                error={errors.labour_id}
                            >
                                <option value="">— Choose Artisan Worker —</option>
                                {labour.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name} ({w.phone}) — {Array.isArray(w.skill_tags) ? w.skill_tags.join(', ') : 'Craftsman'}
                                    </option>
                                ))}
                            </Select>

                            <Input
                                label="Target Order Quantity (Pcs)"
                                type="number"
                                required
                                min="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value) || '')}
                                error={errors.quantity}
                                helperText="Material deduction quantity auto-scales by this number of pcs"
                            />

                            <Textarea
                                label="Special Production Notes (Optional)"
                                rows={2}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="e.g. Priority dispatch by Friday, custom edge finish..."
                                error={errors.notes}
                            />

                            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                    Back to Product Selection
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={!data.labour_id || !data.quantity}
                                    onClick={() => setCurrentStep(3)}
                                >
                                    Proceed to Stock Validation →
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 3: Stock Validation & Confirmation */}
                {currentStep === 3 && (
                    <Card>
                        <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
                            Step 3: Inventory Stock Validation & Confirmation
                        </h3>

                        {!selectedProduct ? (
                            <Alert variant="warning">Please select a product in Step 1 first.</Alert>
                        ) : isPreChecking ? (
                            <p className="text-sm text-neutral-500 py-8 text-center animate-pulse">
                                Validating stock requirements for {data.quantity} pcs of {selectedProduct.name}…
                            </p>
                        ) : preCheckError ? (
                            <Alert variant="danger" title="Validation Error">
                                {preCheckError}
                            </Alert>
                        ) : !preCheckResult ? (
                            <p className="text-xs text-neutral-500 py-6 text-center">Checking stock availability…</p>
                        ) : (
                            <div className="space-y-5">
                                {preCheckResult.can_assign ? (
                                    <Alert variant="success" title="Stock Sufficient">
                                        All required raw materials are in stock for {data.quantity} pcs of {selectedProduct.name}.
                                    </Alert>
                                ) : (
                                    <Alert variant="danger" title="Stock Insufficient">
                                        One or more raw materials fall short in stock. Order submission disabled until stock is replenished.
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                                        Required Raw Materials Breakdown:
                                    </h4>
                                    {preCheckResult.items.length === 0 ? (
                                        <p className="text-xs text-neutral-500 italic p-3 bg-neutral-50 rounded border border-neutral-200">
                                            This product has no physical raw materials linked in its specification.
                                        </p>
                                    ) : (
                                        preCheckResult.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-md border text-xs flex items-center justify-between ${
                                                    item.is_sufficient
                                                        ? 'bg-neutral-50 border-neutral-200'
                                                        : 'bg-danger-50 border-danger-500/40 text-danger-900 font-semibold'
                                                }`}
                                            >
                                                <div>
                                                    <span className="font-semibold text-neutral-900 block">{item.label}</span>
                                                    <span className="text-neutral-500 tabular-nums">
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

                                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                        Back to Artisan Assignment
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        disabled={!preCheckResult.can_assign || !data.labour_id || processing}
                                        onClick={() => setIsConfirmModalOpen(true)}
                                    >
                                        <ClipboardCheck className="w-5 h-5" /> Review & Confirm Work Order
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Final Transaction Confirmation Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Work Order & Auto-Deduct Inventory"
            >
                <div className="space-y-4">
                    <Alert variant="warning" title="Transactional Action">
                        Submitting this work order will immediately deduct inventory stock in a safe database transaction and auto-generate the Work Order PDF.
                    </Alert>

                    <div className="p-4 bg-neutral-50 rounded-md border border-neutral-200 text-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Product:</span>
                            <strong className="text-neutral-900">{selectedProduct?.name} ({selectedProduct?.code})</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Target Quantity:</span>
                            <strong className="text-neutral-900 tabular-nums">{data.quantity} Pcs</strong>
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
                                    <strong className="tabular-nums">{it.needed} {it.unit}</strong> of {it.label}
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
