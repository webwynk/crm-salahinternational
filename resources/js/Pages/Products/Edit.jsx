import React, { useState, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Select from '@/Components/ui/Select';
import ImageUpload from '@/Components/ui/ImageUpload';
import Alert from '@/Components/ui/Alert';
import { Plus, Trash2, ArrowLeft, Layers, Tag, Scissors, Boxes, Info } from 'lucide-react';

export default function Edit({ product, leatherMaterials = [], materials = [] }) {
    const leatherBottomRef = useRef(null);
    const hardwareBottomRef = useRef(null);

    // Initial separation of existing product materials
    const existingMaterials = product.materials || [];
    const initialLeather = existingMaterials
        .filter((m) => m.material_type === 'LEATHER' || m.material?.is_leather)
        .map((m) => ({
            material_id: m.material_id || '',
            material_variant_id: m.material_variant_id || null,
            material_type: 'LEATHER',
            label: m.label || '',
            quantity_min: m.quantity_min || '',
            unit: m.unit || 'sq_ft',
        }));

    const initialHardware = existingMaterials
        .filter((m) => m.material_type !== 'LEATHER' && !m.material?.is_leather)
        .map((m) => ({
            material_id: m.material_id || '',
            material_variant_id: m.material_variant_id || null,
            material_type: m.material_type || 'HARDWARE',
            label: m.label || '',
            quantity_min: m.quantity_min || '',
            unit: m.unit || 'pcs',
        }));

    const [leatherRows, setLeatherRows] = useState(
        initialLeather.length > 0 ? initialLeather : [
            {
                material_id: leatherMaterials[0]?.id || '',
                material_variant_id: leatherMaterials[0]?.variants?.[0]?.id || null,
                material_type: 'LEATHER',
                label: 'Main Exterior Shell',
                quantity_min: '1.25',
                unit: 'sq_ft',
            },
        ]
    );

    const [hardwareRows, setHardwareRows] = useState(
        initialHardware.length > 0 ? initialHardware : [
            {
                material_id: materials[0]?.id || '',
                material_variant_id: materials[0]?.variants?.[0]?.id || null,
                material_type: 'HARDWARE',
                label: 'Hardware Item',
                quantity_min: '1',
                unit: 'pcs',
            },
        ]
    );

    const { data, setData, put, processing, errors, transform } = useForm({
        code: product.code || '',
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        image_url: product.image_url || '',
        materials: [],
    });

    // Leather Row Handlers
    const addLeatherRow = () => {
        setLeatherRows((prev) => [
            ...prev,
            {
                material_id: leatherMaterials[0]?.id || '',
                material_variant_id: leatherMaterials[0]?.variants?.[0]?.id || null,
                material_type: 'LEATHER',
                label: leatherMaterials[0]?.name || '',
                quantity_min: '',
                unit: leatherMaterials[0]?.base_unit || 'sq_ft',
            },
        ]);
        setTimeout(() => {
            leatherBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const removeLeatherRow = (index) => {
        if (leatherRows.length <= 1) return;
        setLeatherRows((prev) => prev.filter((_, i) => i !== index));
    };

    const updateLeatherRow = (index, field, value) => {
        const updated = [...leatherRows];
        updated[index][field] = value;

        if (field === 'material_id') {
            if (value) {
                const selectedMat = leatherMaterials.find((m) => m.id === parseInt(value) || m.id === value);
                if (selectedMat) {
                    updated[index].label = selectedMat.name;
                    updated[index].unit = selectedMat.base_unit || 'sq_ft';
                    if (selectedMat.variants && selectedMat.variants.length > 0) {
                        updated[index].material_variant_id = selectedMat.variants[0].id;
                    } else {
                        updated[index].material_variant_id = null;
                    }
                }
            } else {
                updated[index].material_variant_id = null;
            }
        }

        setLeatherRows(updated);
    };

    // Hardware Row Handlers
    const addHardwareRow = () => {
        setHardwareRows((prev) => [
            ...prev,
            {
                material_id: '',
                material_variant_id: null,
                material_type: 'HARDWARE',
                label: '',
                quantity_min: '',
                unit: 'pcs',
            },
        ]);
        setTimeout(() => {
            hardwareBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const removeHardwareRow = (index) => {
        if (hardwareRows.length <= 1) return;
        setHardwareRows((prev) => prev.filter((_, i) => i !== index));
    };

    const updateHardwareRow = (index, field, value) => {
        const updated = [...hardwareRows];
        updated[index][field] = value;

        if (field === 'material_id') {
            if (value) {
                const selectedMat = materials.find((m) => m.id === parseInt(value) || m.id === value);
                if (selectedMat) {
                    updated[index].label = selectedMat.name;
                    updated[index].unit = selectedMat.base_unit || 'pcs';
                    if (selectedMat.variants && selectedMat.variants.length > 0) {
                        updated[index].material_variant_id = selectedMat.variants[0].id;
                    } else {
                        updated[index].material_variant_id = null;
                    }
                }
            } else {
                updated[index].material_variant_id = null;
            }
        }

        setHardwareRows(updated);
    };

    const submit = (e) => {
        e.preventDefault();

        const combined = [
            ...leatherRows.filter((r) => r.material_id && r.label),
            ...hardwareRows.filter((r) => r.material_id && r.label),
        ];

        transform((formData) => ({
            ...formData,
            materials: combined.length > 0 ? combined : [
                {
                    material_id: leatherMaterials[0]?.id || materials[0]?.id || null,
                    material_type: 'LEATHER',
                    label: 'Main Leather Shell',
                    quantity_min: '1',
                    unit: 'sq_ft',
                }
            ],
        }));

        put(route('products.update', product.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Product: ${product.name} — Leather CRM`} />

            <PageHeader
                title={`Edit Product: ${product.name}`}
                description="Modify product specifications, craft notes, leather cutting BOM (Sq. Ft), and hardware components"
                action={
                    <Link href={route('products.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={submit} className="w-full space-y-6">

                {/* 1. General Product Specifications & Craft Notes */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="mb-5 pb-3 border-b border-neutral-200">
                        <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-brand-600" />
                            1. General Product Specifications & Craft Notes
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Modify product code, category, craft notes, or replace product craft photo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Product Code / SKU"
                                    required
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    error={errors.code}
                                />
                                <Input
                                    label="Category"
                                    placeholder="e.g. Wallet, Bag, Belt, Cardholder"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    error={errors.category}
                                />
                            </div>

                            <Input
                                label="Product Name"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />

                            <Textarea
                                label="Description / Craft Notes"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add dimensions, leather tanning specs, lining requirements, skiving notes, or stitching instructions..."
                                error={errors.description}
                            />
                        </div>

                        <div className="lg:col-span-4 flex flex-col">
                            <ImageUpload
                                label="Product Photo"
                                value={data.image_url}
                                onChange={(val) => setData('image_url', val)}
                                error={errors.image_url}
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. DEDICATED LEATHER SPECIFICATIONS & CUTTING BOM */}
                <Card className="border-brand-200/80 bg-gradient-to-b from-brand-50/20 to-white shadow-2xs">
                    <div className="mb-4 pb-3 border-brand-200/80 border-b flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-brand-700" />
                                2. Leather Specifications & Cutting BOM (Sq. Ft)
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Specify leather hides, color shades, and exact cutting square footage required per piece.
                            </p>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100/70 text-brand-900 border border-brand-300/60">
                            <Scissors className="w-3.5 h-3.5" /> Leather Cutting Section
                        </span>
                    </div>

                    {leatherMaterials.length === 0 ? (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>No leather hides registered yet. You can create leather hides in the <strong>Leather Stock</strong> tab.</span>
                            </div>
                            <Link href={route('leather.index')}>
                                <Button type="button" variant="outline" size="xs">
                                    Add Leather Hide
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leatherRows.map((row, idx) => {
                                const selectedMat = leatherMaterials.find((m) => m.id === parseInt(row.material_id) || m.id === row.material_id);
                                const variants = selectedMat?.variants || [];

                                return (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-lg border border-brand-200/70 bg-white relative space-y-2.5 shadow-2xs"
                                    >
                                        <div className="flex items-center justify-between text-xs font-bold text-brand-900 uppercase">
                                            <span>Leather Component #{idx + 1}</span>
                                            {leatherRows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLeatherRow(idx)}
                                                    className="text-neutral-400 hover:text-danger-500 p-1 cursor-pointer transition-colors"
                                                    title="Remove leather row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                            <div className="sm:col-span-4">
                                                <Select
                                                    label="Leather Item"
                                                    value={row.material_id}
                                                    onChange={(e) => updateLeatherRow(idx, 'material_id', e.target.value)}
                                                >
                                                    <option value="">— Select Leather Item —</option>
                                                    {leatherMaterials.map((m) => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name} ({m.category} — {m.base_unit})
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>

                                            {variants.length > 0 && (
                                                <div className="sm:col-span-3">
                                                    <Select
                                                        label="Color Shade & Thickness"
                                                        value={row.material_variant_id || ''}
                                                        onChange={(e) => updateLeatherRow(idx, 'material_variant_id', e.target.value)}
                                                    >
                                                        {variants.map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.name} {v.sku ? `(${v.sku})` : ''}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            )}

                                            <div className={variants.length > 0 ? "sm:col-span-3" : "sm:col-span-6"}>
                                                <Input
                                                    label="Leather Part / Component"
                                                    required
                                                    value={row.label}
                                                    onChange={(e) => updateLeatherRow(idx, 'label', e.target.value)}
                                                    placeholder="e.g. Outer Body Shell, Gusset, Card Slots"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <Input
                                                    label={`Qty (${row.unit || 'sq_ft'})`}
                                                    type="number"
                                                    step="0.001"
                                                    required
                                                    value={row.quantity_min}
                                                    onChange={(e) => updateLeatherRow(idx, 'quantity_min', e.target.value)}
                                                    placeholder="e.g. 1.25"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                onClick={addLeatherRow}
                                className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/40 hover:bg-brand-50 text-brand-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                            >
                                <Plus className="w-4 h-4 text-brand-700" />
                                <span>+ Add Another Leather Part / Cut (Sq. Ft)</span>
                            </button>
                        </div>
                    )}
                    <div ref={leatherBottomRef} />
                </Card>

                {/* 3. HARDWARE, LINING & CONSUMABLES BOM */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="mb-4 pb-3 border-b border-neutral-200">
                        <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                            <Boxes className="w-5 h-5 text-neutral-700" />
                            3. Hardware, Lining & Consumables BOM
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Add threads, zips, buckles, rivets, edge paint, and reinforcement materials per product piece.
                        </p>
                    </div>

                    {errors.materials && typeof errors.materials === 'string' && (
                        <Alert variant="danger" className="mb-4">
                            {errors.materials}
                        </Alert>
                    )}

                    <div className="space-y-3">
                        {hardwareRows.map((row, idx) => {
                            const selectedMat = materials.find((m) => m.id === parseInt(row.material_id) || m.id === row.material_id);
                            const variants = selectedMat?.variants || [];

                            return (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 relative space-y-2.5 shadow-2xs"
                                >
                                    <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase">
                                        <span>Hardware Item #{idx + 1}</span>
                                        {hardwareRows.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeHardwareRow(idx)}
                                                className="text-neutral-400 hover:text-danger-500 p-1 cursor-pointer transition-colors"
                                                title="Remove hardware row"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                        <div className="sm:col-span-4">
                                            <Select
                                                label="Material Master"
                                                value={row.material_id}
                                                onChange={(e) => updateHardwareRow(idx, 'material_id', e.target.value)}
                                            >
                                                <option value="">— Select Hardware / Consumable —</option>
                                                {materials.map((m) => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.name} ({m.category} — {m.base_unit})
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>

                                        {variants.length > 1 ? (
                                            <>
                                                <div className="sm:col-span-3">
                                                    <Select
                                                        label="Variation"
                                                        value={row.material_variant_id || ''}
                                                        onChange={(e) => updateHardwareRow(idx, 'material_variant_id', e.target.value)}
                                                    >
                                                        {variants.map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.name} {v.sku ? `(${v.sku})` : ''}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <Input
                                                        label="Component"
                                                        required
                                                        value={row.label}
                                                        onChange={(e) => updateHardwareRow(idx, 'label', e.target.value)}
                                                        placeholder="e.g. Buckle, Ring, Zipper"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input
                                                        label={`Qty (${row.unit || 'pcs'})`}
                                                        type="number"
                                                        step="0.001"
                                                        required
                                                        value={row.quantity_min}
                                                        onChange={(e) => updateHardwareRow(idx, 'quantity_min', e.target.value)}
                                                        placeholder="e.g. 1"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="sm:col-span-5">
                                                    <Input
                                                        label="Component / Fitting Label"
                                                        required
                                                        value={row.label}
                                                        onChange={(e) => updateHardwareRow(idx, 'label', e.target.value)}
                                                        placeholder="e.g. YKK #5 Antique Brass Zipper"
                                                    />
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <Input
                                                        label={`Qty (${row.unit || 'pcs'})`}
                                                        type="number"
                                                        step="0.001"
                                                        required
                                                        value={row.quantity_min}
                                                        onChange={(e) => updateHardwareRow(idx, 'quantity_min', e.target.value)}
                                                        placeholder="e.g. 1"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            type="button"
                            onClick={addHardwareRow}
                            className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-brand-500 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-brand-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                        >
                            <Plus className="w-4 h-4 text-neutral-600" />
                            <span>+ Add Another Hardware / Consumable Item</span>
                        </button>
                    </div>

                    <div ref={hardwareBottomRef} />
                </Card>

                {/* Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link href={route('products.index')}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" isLoading={processing}>
                        Update Product Specs
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
