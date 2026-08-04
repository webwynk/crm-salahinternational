import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Select from '@/Components/ui/Select';
import Alert from '@/Components/ui/Alert';
import { Plus, Trash2, ArrowLeft, Layers } from 'lucide-react';

export default function Edit({ product, materials = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        code: product.code || '',
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        materials: product.materials && product.materials.length > 0
            ? product.materials.map((m) => ({
                material_id: m.material_id || '',
                material_type: m.material_type || 'CONSUMABLE',
                label: m.label || '',
                quantity_min: m.quantity_min || '',
                quantity_max: m.quantity_max || '',
                unit: m.unit || '',
                dimension_note: m.dimension_note || '',
            }))
            : [
                {
                    material_id: '',
                    material_type: 'CONSUMABLE',
                    label: '',
                    quantity_min: '',
                    quantity_max: '',
                    unit: 'cm2',
                    dimension_note: '',
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
                quantity_max: '',
                unit: 'cm2',
                dimension_note: '',
            },
        ]);
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
                if (!updated[index].label) updated[index].label = selectedMat.name;
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
            <Head title={`Edit ${product.name} - Leather CRM`} />

            <PageHeader
                title={`Edit Product: ${product.name}`}
                description={`Code: ${product.code} • Update product specs and BOM rows`}
                action={
                    <Link href={route('products.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={submit} className="space-y-8 max-w-5xl">
                {/* Basic Product Info */}
                <Card>
                    <h3 className="text-md font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                        1. Product General Information
                    </h3>
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
                        placeholder="General overview, craftsmanship notes, or client requirements..."
                    />
                </Card>

                {/* Dynamic BOM Builder */}
                <Card>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200">
                        <div>
                            <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-brand-500" />
                                2. Bill of Materials (BOM) & Process Specifications
                            </h3>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addBomRow}>
                            <Plus className="w-4 h-4 mr-1" /> Add Row
                        </Button>
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
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-3">
                                        <Select
                                            label="Type"
                                            value={row.material_type}
                                            onChange={(e) => updateBomRow(idx, 'material_type', e.target.value)}
                                        >
                                            <option value="CONSUMABLE">CONSUMABLE (Deducted)</option>
                                            <option value="HARDWARE">HARDWARE</option>
                                            <option value="PROCESS_NOTE">PROCESS NOTE</option>
                                        </Select>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <Select
                                            label="Material Master Item"
                                            value={row.material_id}
                                            onChange={(e) => updateBomRow(idx, 'material_id', e.target.value)}
                                        >
                                            <option value="">— None (Custom Note) —</option>
                                            {materials.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} ({m.category} — {m.base_unit})
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="sm:col-span-5">
                                        <Input
                                            label="Label / Component Name *"
                                            value={row.label}
                                            onChange={(e) => updateBomRow(idx, 'label', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-neutral-200">
                                    <div className="sm:col-span-3">
                                        <Input
                                            label="Qty Min / Fixed"
                                            type="number"
                                            step="0.001"
                                            value={row.quantity_min}
                                            onChange={(e) => updateBomRow(idx, 'quantity_min', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <Input
                                            label="Qty Max (Range)"
                                            type="number"
                                            step="0.001"
                                            value={row.quantity_max}
                                            onChange={(e) => updateBomRow(idx, 'quantity_max', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Unit"
                                            value={row.unit}
                                            onChange={(e) => updateBomRow(idx, 'unit', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <Input
                                            label="Dimension / Process Note"
                                            value={row.dimension_note}
                                            onChange={(e) => updateBomRow(idx, 'dimension_note', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Submit Controls */}
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
