import React, { useState, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import ImageUpload from '@/Components/ui/ImageUpload';
import Alert from '@/Components/ui/Alert';
import Modal from '@/Components/ui/Modal';
import { Plus, Trash2, ArrowLeft, Tag, Boxes, Palette, X, AlertTriangle } from 'lucide-react';

export default function Create({ materials = [] }) {
    const bomBottomRef = useRef(null);

    // Helper to generate fresh BOM row
    const createDefaultBomRow = (label = 'Main Component') => {
        const firstMat = materials[0] || null;
        const defaultType = firstMat?.is_leather
            ? 'LEATHER'
            : (firstMat?.category === 'HARDWARE' ? 'HARDWARE' : 'CONSUMABLE');

        return {
            material_id: firstMat?.id || '',
            material_variant_id: firstMat?.variants?.[0]?.id || null,
            material_type: defaultType,
            label: firstMat?.name || label,
            quantity_min: '1',
            unit: firstMat?.base_unit || 'pcs',
        };
    };

    // Multi-color variations state
    const [hasColors, setHasColors] = useState(false);
    const [newColorInput, setNewColorInput] = useState('');
    const [activeColorIndex, setActiveColorIndex] = useState(0);
    const [colorToDelete, setColorToDelete] = useState(null);

    // Colors state (starts completely empty; no forced default color on toggle)
    const [colors, setColors] = useState([]);

    // Single BOM state (when hasColors is inactive)
    const [singleBomRows, setSingleBomRows] = useState([createDefaultBomRow('Main Component')]);

    const { data, setData, post, processing, errors, transform } = useForm({
        code: '',
        part_no: '',
        name: '',
        category: 'Wallet',
        leather_sqft: '',
        image_url: '',
        has_colors: false,
        materials: [],
        colors: [],
    });

    // Determine current active BOM rows
    const currentBomRows = hasColors
        ? (colors[activeColorIndex]?.bomRows || [])
        : singleBomRows;

    // Toggle multi-color mode
    const toggleHasColors = () => {
        if (!hasColors) {
            setHasColors(true);
            if (colors.length > 0) {
                setActiveColorIndex(0);
            }
        } else {
            setHasColors(false);
        }
    };

    // Color Management Handlers
    const addColor = (predefinedName = null) => {
        const name = (predefinedName || newColorInput).trim();
        if (!name) return;

        if (colors.some((c) => c.color_name.toLowerCase() === name.toLowerCase())) {
            alert(`Colorway '${name}' already exists.`);
            return;
        }

        const newColor = {
            color_name: name,
            bomRows: [createDefaultBomRow(`${name} Component`)],
        };

        const updated = [...colors, newColor];
        setColors(updated);
        setActiveColorIndex(updated.length - 1);
        setNewColorInput('');
    };

    const initiateDeleteColor = (index, color) => {
        setColorToDelete({ index, color });
    };

    const confirmDeleteColor = () => {
        if (!colorToDelete) return;
        const indexToRemove = colorToDelete.index;
        const updated = colors.filter((_, i) => i !== indexToRemove);
        setColors(updated);
        if (updated.length === 0) {
            setActiveColorIndex(0);
        } else if (activeColorIndex >= updated.length) {
            setActiveColorIndex(updated.length - 1);
        }
        setColorToDelete(null);
    };

    // BOM Row Handlers
    const addBomRow = () => {
        const newRow = {
            material_id: '',
            material_variant_id: null,
            material_type: 'CONSUMABLE',
            label: '',
            quantity_min: '1',
            unit: 'pcs',
        };

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].bomRows = [...(updated[activeColorIndex].bomRows || []), newRow];
                }
                return updated;
            });
        } else {
            setSingleBomRows((prev) => [...prev, newRow]);
        }

        setTimeout(() => {
            bomBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const removeBomRow = (index) => {
        if (currentBomRows.length <= 1) return;

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].bomRows = updated[activeColorIndex].bomRows.filter((_, i) => i !== index);
                }
                return updated;
            });
        } else {
            setSingleBomRows((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const updateBomRow = (index, field, value) => {
        const updater = (rows) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], [field]: value };

            if (field === 'material_id') {
                if (value) {
                    const selectedMat = materials.find((m) => m.id === parseInt(value) || m.id === value);
                    if (selectedMat) {
                        updated[index].label = selectedMat.name;
                        updated[index].unit = selectedMat.base_unit || 'pcs';
                        updated[index].material_type = selectedMat.is_leather
                            ? 'LEATHER'
                            : (selectedMat.category === 'HARDWARE' ? 'HARDWARE' : 'CONSUMABLE');
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

            return updated;
        };

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].bomRows = updater(updated[activeColorIndex].bomRows || []);
                }
                return updated;
            });
        } else {
            setSingleBomRows(updater);
        }
    };

    const sanitizeBomRow = (row, defaultType = 'CONSUMABLE', defaultLabel = 'Component') => ({
        material_id: row.material_id ? parseInt(row.material_id, 10) || null : null,
        material_variant_id: row.material_variant_id ? parseInt(row.material_variant_id, 10) || null : null,
        material_type: row.material_type || defaultType,
        label: (row.label && row.label.trim()) ? row.label.trim() : defaultLabel,
        quantity_min: (row.quantity_min !== '' && row.quantity_min !== null && !isNaN(row.quantity_min)) ? String(row.quantity_min) : '1',
        quantity_max: (row.quantity_max !== '' && row.quantity_max !== null && !isNaN(row.quantity_max)) ? String(row.quantity_max) : null,
        unit: row.unit || 'pcs',
        dimension_note: row.dimension_note ? row.dimension_note.trim() : null,
    });

    const submit = (e) => {
        e.preventDefault();

        if (hasColors) {
            if (colors.length === 0) {
                alert('Please add at least one colorway variation before saving, or switch off multi-color mode.');
                return;
            }

            const formattedColors = colors.map((c, idx) => {
                const validMaterials = (c.bomRows || [])
                    .filter((r) => (r.label && r.label.trim()) || r.material_id)
                    .map((r) => sanitizeBomRow(r, 'CONSUMABLE', `${c.color_name} Component`));

                return {
                    color_name: c.color_name,
                    image_url: c.image_url || null,
                    sort_order: idx + 1,
                    materials: validMaterials.length > 0 ? validMaterials : [
                        sanitizeBomRow(
                            {
                                material_id: materials[0]?.id || null,
                                material_type: materials[0]?.is_leather ? 'LEATHER' : 'CONSUMABLE',
                                label: `${c.color_name} Component`,
                                quantity_min: '1',
                                unit: materials[0]?.base_unit || 'pcs',
                            },
                            'CONSUMABLE',
                            `${c.color_name} Component`
                        ),
                    ],
                };
            });

            transform((formData) => {
                const copy = { ...formData };
                delete copy.materials;
                return {
                    ...copy,
                    has_colors: true,
                    colors: formattedColors,
                };
            });
        } else {
            const validMaterials = singleBomRows
                .filter((r) => (r.label && r.label.trim()) || r.material_id)
                .map((r) => sanitizeBomRow(r, 'CONSUMABLE', 'Main Component'));

            const finalMaterials = validMaterials.length > 0 ? validMaterials : [
                sanitizeBomRow(
                    {
                        material_id: materials[0]?.id || null,
                        material_type: materials[0]?.is_leather ? 'LEATHER' : 'CONSUMABLE',
                        label: 'Main Component',
                        quantity_min: '1',
                        unit: materials[0]?.base_unit || 'pcs',
                    },
                    'CONSUMABLE',
                    'Main Component'
                ),
            ];

            transform((formData) => {
                const copy = { ...formData };
                delete copy.colors;
                return {
                    ...copy,
                    has_colors: false,
                    materials: finalMaterials,
                };
            });
        }

        post(route('products.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Product & BOM — Leather CRM" />

            <PageHeader
                title="Create New Product"
                description="Define product specifications and Bill of Materials (BOM)"
                action={
                    <Link href={route('products.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={submit} className="w-full space-y-6">
                {/* 1. GENERAL PRODUCT SPECIFICATIONS */}
                <Card className="border-neutral-200/90 shadow-2xs space-y-3.5 p-4 sm:p-5">
                    <div className="pb-2.5 border-b border-neutral-200">
                        <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-brand-600" />
                            1. General Product Specifications
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Enter the product code, category, and upload a primary article photo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-3 items-end">
                        {/* 1. Part No (1 col) */}
                        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                            <Input
                                label="Part No"
                                value={data.part_no}
                                onChange={(e) => setData('part_no', e.target.value)}
                                placeholder="e.g. P-01"
                                error={errors.part_no}
                            />
                        </div>

                        {/* 2. Product Code / SKU (2 cols) */}
                        <div className="col-span-1 sm:col-span-4 lg:col-span-2">
                            <Input
                                label="Product Code / SKU"
                                required
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="e.g. WAL-001"
                                error={errors.code}
                            />
                        </div>

                        {/* 3. Product Name (4 cols) */}
                        <div className="col-span-1 sm:col-span-6 lg:col-span-4">
                            <Input
                                label="Product Name"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Colourblocked Crossbody Sling Bag"
                                error={errors.name}
                            />
                        </div>

                        {/* 4. Category (2 cols) */}
                        <div className="col-span-1 sm:col-span-3 lg:col-span-2">
                            <Input
                                label="Category"
                                placeholder="e.g. Bag, Wallet"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                error={errors.category}
                            />
                        </div>

                        {/* 5. Leather (sq ft) (2 cols) */}
                        <div className="col-span-1 sm:col-span-3 lg:col-span-2">
                            <div className="w-full space-y-1.5">
                                <label className="block text-sm font-medium text-neutral-700 truncate">
                                    Leather (sq ft)
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="e.g. 2.50"
                                        value={data.leather_sqft}
                                        onChange={(e) => setData('leather_sqft', e.target.value)}
                                        error={errors.leather_sqft}
                                        className="pr-14 font-sans tabular-nums"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-bold text-neutral-400 pointer-events-none uppercase">
                                        sq ft
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 6. Product Photo 1:1 (1 col) */}
                        <div className="col-span-1 sm:col-span-3 lg:col-span-1 flex flex-col items-start">
                            <ImageUpload
                                label="Photo"
                                mode="square"
                                value={data.image_url}
                                onChange={(url) => setData('image_url', url)}
                                error={errors.image_url}
                            />
                        </div>
                    </div>

                    {/* Colorway Toggle Banner */}
                    <div
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            hasColors
                                ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-200'
                                : 'bg-neutral-50/80 hover:bg-neutral-50 border-neutral-200'
                        }`}
                        onClick={toggleHasColors}
                    >
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Palette className={`w-4 h-4 transition-colors ${hasColors ? 'text-brand-600' : 'text-neutral-400'}`} />
                                <span className="text-xs font-bold text-neutral-800">
                                    Does this product have multi-color variations?
                                </span>
                                {hasColors && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                        colors.length > 0 ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }`}>
                                        {colors.length > 0 ? `Active (${colors.length} ${colors.length === 1 ? 'Colorway' : 'Colorways'})` : 'Active (0 Colorways)'}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-neutral-500">
                                Normally OFF (Single Standard BOM). When enabled, configure custom colorways (e.g. Cognac Tan, Black) with independent Bill of Materials.
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={hasColors}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleHasColors();
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                                hasColors ? 'bg-brand-600' : 'bg-neutral-300'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    hasColors ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Quick Colorway Adder Bar (Shown when multi-color mode is enabled) */}
                    {hasColors && (
                        <div className="p-3.5 bg-neutral-0 rounded-lg border border-brand-200 shadow-2xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex-1 w-full sm:max-w-md">
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                                        Add New Colorway
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newColorInput}
                                            onChange={(e) => setNewColorInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addColor();
                                                }
                                            }}
                                            placeholder="e.g. Midnight Black, Burgundy Red, Navy Blue"
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => addColor()}
                                            disabled={!newColorInput.trim()}
                                            className="shrink-0"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Color
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-4">
                                    <span className="text-[11px] text-neutral-400 font-medium">Quick suggestions:</span>
                                    {['Tan', 'Black', 'Brown', 'Burgundy', 'Navy'].map((sug) => (
                                        <button
                                            key={sug}
                                            type="button"
                                            onClick={() => addColor(sug)}
                                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-brand-50 hover:text-brand-700 text-neutral-600 border border-neutral-200 transition-colors cursor-pointer"
                                        >
                                            + {sug}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* COLOR TABS BAR (Directly Above Section 2) */}
                {hasColors && colors.length > 0 && (
                    <div className="rounded-xl border border-brand-300/80 bg-white p-4 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-brand-600" />
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                                        Colorway BOM Workspaces
                                    </h4>
                                    <p className="text-[11px] text-neutral-500">
                                        Select a color tab below to configure its independent Bill of Materials.
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                                Editing BOM for: <strong>{colors[activeColorIndex]?.color_name}</strong>
                            </span>
                        </div>

                        {/* Tab Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            {colors.map((c, idx) => {
                                const isActive = idx === activeColorIndex;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveColorIndex(idx)}
                                        className={`group flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                                            isActive
                                                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30'
                                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-brand-500'}`} />
                                        <span>{c.color_name}</span>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                initiateDeleteColor(idx, c);
                                            }}
                                            className={`p-0.5 rounded hover:bg-red-500 hover:text-white transition-colors ml-1 ${
                                                isActive ? 'text-white/80' : 'text-neutral-400'
                                            }`}
                                            title={`Remove ${c.color_name}`}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. BILL OF MATERIALS (BOM) & COMPONENTS */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="mb-4 pb-3 border-b border-neutral-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                <Boxes className="w-5 h-5 text-neutral-700" />
                                2. Bill of Materials (BOM) & Components
                                {hasColors && colors[activeColorIndex] && (
                                    <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded ml-2">
                                        Colorway: {colors[activeColorIndex]?.color_name}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Specify all components, leather hides, hardware fittings, lining, and consumables required per piece.
                            </p>
                        </div>
                    </div>

                    {errors.materials && typeof errors.materials === 'string' && (
                        <Alert variant="danger" className="mb-4">
                            {errors.materials}
                        </Alert>
                    )}

                    {hasColors && colors.length === 0 ? (
                        <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-center space-y-2.5">
                            <Boxes className="w-7 h-7 text-neutral-500 mx-auto" />
                            <h4 className="text-xs font-bold text-neutral-900">No Colorway Created Yet</h4>
                            <p className="text-xs text-neutral-600 max-w-md mx-auto">
                                Components and materials will become configurable as soon as you create your first colorway above.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentBomRows.map((row, idx) => {
                                const selectedMat = materials.find((m) => m.id === parseInt(row.material_id) || m.id === row.material_id);
                                const variants = selectedMat?.variants || [];

                                return (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 relative space-y-2.5 shadow-2xs"
                                    >
                                        <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase">
                                            <span>
                                                Component Item #{idx + 1}
                                                {hasColors && colors[activeColorIndex] && ` (${colors[activeColorIndex].color_name})`}
                                            </span>
                                            {currentBomRows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeBomRow(idx)}
                                                    className="text-neutral-400 hover:text-danger-500 p-1 cursor-pointer transition-colors"
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
                                                    <option value="">— Select Material / Hide / Fitting —</option>
                                                    {materials.map((m) => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name} ({m.category} — {m.base_unit})
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>

                                            {selectedMat && variants.length > 1 && (
                                                <div className="sm:col-span-3">
                                                    <Select
                                                        label="Variation / Tone / Shade"
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
                                            )}

                                            {selectedMat ? (
                                                <>
                                                    <div className={variants.length > 1 ? 'sm:col-span-3' : 'sm:col-span-6'}>
                                                        <Input
                                                            label="Component / Part Note"
                                                            value={row.label}
                                                            onChange={(e) => updateBomRow(idx, 'label', e.target.value)}
                                                            placeholder="e.g. Outer Body, Lining, Buckle, Zipper"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <Input
                                                            label={`Qty (${row.unit || 'pcs'})`}
                                                            type="number"
                                                            step="0.001"
                                                            required
                                                            value={row.quantity_min}
                                                            onChange={(e) => updateBomRow(idx, 'quantity_min', e.target.value)}
                                                            placeholder="e.g. 1"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="sm:col-span-5">
                                                        <Input
                                                            label="Component / Part Label"
                                                            required
                                                            value={row.label}
                                                            onChange={(e) => updateBomRow(idx, 'label', e.target.value)}
                                                            placeholder="e.g. Outer Body Shell, YKK Zipper"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <Input
                                                            label={`Qty (${row.unit || 'pcs'})`}
                                                            type="number"
                                                            step="0.001"
                                                            required
                                                            value={row.quantity_min}
                                                            onChange={(e) => updateBomRow(idx, 'quantity_min', e.target.value)}
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
                                onClick={addBomRow}
                                className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-brand-500 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-brand-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                            >
                                <Plus className="w-4 h-4 text-neutral-600" />
                                <span>
                                    + Add Component / Material Item {hasColors && colors[activeColorIndex] ? `(${colors[activeColorIndex].color_name})` : ''}
                                </span>
                            </button>
                        </div>
                    )}

                    <div ref={bomBottomRef} />
                </Card>

                {/* Submit Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
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

            {/* Delete Colorway Double-Verification Modal */}
            <Modal
                isOpen={Boolean(colorToDelete)}
                onClose={() => setColorToDelete(null)}
                title="Delete Colorway"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-neutral-900">
                                Delete Colorway &ldquo;{colorToDelete?.color?.color_name}&rdquo;?
                            </h4>
                            <p className="text-xs text-neutral-600 leading-relaxed">
                                Are you sure you want to delete this colorway? It may contain configured materials and components.
                            </p>
                            {colorToDelete?.color && (
                                <div className="mt-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1 text-neutral-700">
                                    <div className="flex items-center justify-between font-medium">
                                        <span>Configured Components:</span>
                                        <span className="font-bold text-neutral-900">
                                            {colorToDelete.color.bomRows?.filter((r) => r.material_id || r.label).length || 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setColorToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={confirmDeleteColor}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete Colorway
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
