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

export default function Edit({ product, materials = [] }) {
    const bomBottomRef = React.useRef(null);

    const { data, setData, put, processing, errors } = useForm({
        code: product.code || '',
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        image_url: product.image_url || '',
        materials: product.materials && product.materials.length > 0
            ? product.materials.map((m) => ({
                material_id: m.material_id || '',
                material_type: m.material_type || 'CONSUMABLE',
                label: m.label || '',
                quantity_min: m.quantity_min || '',
                unit: m.unit || 'pcs',
            }))
            : [
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

        if (field === 'material_id' && value) {
            const selectedMat = materials.find((m) => m.id === parseInt(value) || m.id === value);
            if (selectedMat) {
                updated[index].label = selectedMat.name;
                updated[index].unit = selectedMat.base_unit;
            }
        }

        setData('materials', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Product: ${product.name} — Leather CRM`} />

            <PageHeader
                title={`Edit Product: ${product.name}`}
                description="Modify product specifications, upload fresh craft photo, and refine BOM items"
                action={
                    <Link href={route('products.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4" /> Back to Products
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={submit} className="space-y-8 w-full">
                {/* Basic Product Info & Photo */}
                <Card>
                    <h3 className="text-md font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                        1. Product General Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
                        <div className="md:col-span-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Product Code"
                                    required
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    error={errors.code}
                                />
                                <Input
                                    label="Product Name"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                />
                                <Input
                                    label="Category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    error={errors.category}
                                />
                            </div>

                            <Textarea
                                label="Description & Craft Notes"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </div>

                        {/* Image Upload Box */}
                        <div className="md:col-span-4">
                            <ImageUpload
                                label="Product Photo"
                                value={data.image_url}
                                onChange={(val) => setData('image_url', val)}
                                error={errors.image_url}
                            />
                        </div>
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

                    <div className="space-y-4">
                        {data.materials.map((row, idx) => (
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
                                            label="Material Master Item"
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

                                    <div className="sm:col-span-4">
                                        <Input
                                            label="Label / Component Name"
                                            required
                                            value={row.label}
                                            onChange={(e) => updateBomRow(idx, 'label', e.target.value)}
                                            placeholder="e.g. Full-Grain Calfskin Leather"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
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
                        ))}
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
                        Update Product Specs
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
