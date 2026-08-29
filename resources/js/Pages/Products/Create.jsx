import React from 'react';
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
import { Plus, Trash2, ArrowLeft, Layers } from 'lucide-react';
import { BASE_UNITS } from '@/constants/units';

export default function Create({ materials = [] }) {
    const bomBottomRef = React.useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        category: 'Wallet',
        description: '',
        image_url: '',
        materials: [
            {
                material_id: '',
                material_type: 'CONSUMABLE',
                label: '',
                quantity_min: '',
                unit: 'pcs',
            },
        ],
    });

    const addBomRow = () => {
        setData('materials', [
            ...data.materials,
            {
                material_id: '',
                material_type: 'CONSUMABLE',
                label: '',
                quantity_min: '',
                unit: 'pcs',
            },
        ]);
        setTimeout(() => {
            bomBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const removeBomRow = (index) => {
        if (data.materials.length <= 1) return;
        const updated = [...data.materials];
        updated.splice(index, 1);
        setData('materials', updated);
    };

    const updateBomRow = (index, field, value) => {
        const updated = [...data.materials];
        updated[index][field] = value;

        if (field === 'material_id') {
            if (value) {
                const selectedMat = materials.find((m) => m.id === parseInt(value) || m.id === value);
                if (selectedMat) {
                    updated[index].label = selectedMat.name;
                    updated[index].unit = selectedMat.base_unit;
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

        setData('materials', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Product & BOM — Leather CRM" />

            <PageHeader
                title="Create New Product"
                description="Define product details, upload craft photo, and build Bill of Materials (BOM)"
                action={
                    <Link href={route('products.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4" /> Back to Products
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={submit} className="w-full space-y-6">
                {/* Product Basic Details */}
                <Card>
                    <div className="mb-4 pb-2 border-b border-neutral-200">
                        <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-brand-600" />
                            1. General Product Specifications
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                            <div className="sm:col-span-4">
                                <Input
                                    label="Product Code / SKU *"
                                    required
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g. WAL-001, BAG-LUX-02"
                                    error={errors.code}
                                />
                            </div>
                            <div className="sm:col-span-8">
                                <Input
                                    label="Product Name *"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Minimalist Bifold Leather Wallet"
                                    error={errors.name}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                error={errors.category}
                            >
                                {PRODUCT_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </Select>

                            <ImageUpload
                                label="Product Photo (Optional)"
                                value={data.image_url}
                                onChange={(url) => setData('image_url', url)}
                                error={errors.image_url}
                            />
                        </div>

                        <Textarea
                            label="Description / Craft Notes"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Add dimensions, leather tanning specs, lining requirements, or stitching instructions..."
                            error={errors.description}
                        />
                    </div>
                </Card>

                {/* Dynamic BOM Builder */}
                <Card>
                    <div className="mb-4 pb-2 border-b border-neutral-200">
                        <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-brand-600" />
                            2. Bill of Materials (BOM) & Process Specifications
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Add raw materials (leather, thread, glue, hardware) required per single product unit.
                        </p>
                    </div>

                    {errors.materials && typeof errors.materials === 'string' && (
                        <Alert variant="danger" className="mb-4">
                            {errors.materials}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        {data.materials.map((row, idx) => {
                            const selectedMat = materials.find((m) => m.id === parseInt(row.material_id) || m.id === row.material_id);
                            const variants = selectedMat?.variants || [];

                            return (
                                <div
                                    key={idx}
                                    className="p-4 rounded-md border border-neutral-200 bg-neutral-50/60 relative space-y-3"
                                >
                                    <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase">
                                        <span>Item #{idx + 1}</span>
                                        {data.materials.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBomRow(idx)}
                                                className="text-neutral-400 hover:text-danger-500 p-1"
                                                title="Remove row"
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
                                                onChange={(e) => updateBomRow(idx, 'material_id', e.target.value)}
                                            >
                                                <option value="">— Select Raw Material —</option>
                                                {materials.map((m) => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.name} ({m.category} — {m.base_unit})
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>

                                        {variants.length > 1 ? (
                                            <div className="sm:col-span-3">
                                                <Select
                                                    label="Variation"
                                                    value={row.material_variant_id || ''}
                                                    onChange={(e) => updateBomRow(idx, 'material_variant_id', e.target.value)}
                                                >
                                                    {variants.map((v) => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.name} {v.sku ? `(${v.sku})` : ''}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>
                                        ) : (
                                            <div className="sm:col-span-3">
                                                <Input
                                                    label="Component / Part Label"
                                                    required
                                                    value={row.label}
                                                    onChange={(e) => updateBomRow(idx, 'label', e.target.value)}
                                                    placeholder="e.g. Exterior Shell"
                                                />
                                            </div>
                                        )}

                                        {variants.length > 1 && (
                                            <div className="sm:col-span-2">
                                                <Input
                                                    label="Component"
                                                    required
                                                    value={row.label}
                                                    onChange={(e) => updateBomRow(idx, 'label', e.target.value)}
                                                    placeholder="e.g. Shell"
                                                />
                                            </div>
                                        )}

                                        <div className={variants.length > 1 ? "sm:col-span-1" : "sm:col-span-2"}>
                                            <Input
                                                label="Qty"
                                                type="number"
                                                step="0.001"
                                                required
                                                value={row.quantity_min}
                                                onChange={(e) => updateBomRow(idx, 'quantity_min', e.target.value)}
                                                placeholder="e.g. 1.5"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <Select
                                                label="Unit"
                                                value={row.unit || 'pcs'}
                                                onChange={(e) => updateBomRow(idx, 'unit', e.target.value)}
                                            >
                                                {BASE_UNITS.map((u) => (
                                                    <option key={u.value} value={u.value}>
                                                        {u.label}
                                                    </option>
                                                ))}
                                                {row.unit && !BASE_UNITS.some((u) => u.value === row.unit) && (
                                                    <option value={row.unit}>{row.unit}</option>
                                                )}
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Add Row Dashed Button */}
                    <button
                        type="button"
                        onClick={addBomRow}
                        className="w-full mt-4 py-3 px-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-brand-500 bg-white hover:bg-brand-50/50 text-neutral-600 hover:text-brand-700 text-sm font-semibold flex items-center justify-center gap-2 transition-all group shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                        <div className="w-6 h-6 rounded-full bg-neutral-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <Plus className="w-4 h-4 text-neutral-600 group-hover:text-brand-600" />
                        </div>
                        <span>Add Another Material / BOM Item</span>
                    </button>

                    <div ref={bomBottomRef} />
                </Card>

                {/* Controls */}
                <div className="flex items-center justify-end gap-3">
                    <Link href={route('products.index')}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" isLoading={processing}>
                        Save Product & BOM
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
