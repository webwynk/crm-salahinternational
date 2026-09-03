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
import { Plus, Trash2, ArrowLeft, Tag, Scissors, Boxes, Info, Palette, X } from 'lucide-react';

export default function Edit({ product, leatherMaterials = [], materials = [] }) {
    const leatherBottomRef = useRef(null);
    const hardwareBottomRef = useRef(null);

    // Helpers to generate fresh rows
    const createDefaultLeatherRow = (label = 'Main Leather Component') => ({
        material_id: leatherMaterials[0]?.id || '',
        material_variant_id: leatherMaterials[0]?.variants?.[0]?.id || null,
        material_type: 'LEATHER',
        label: leatherMaterials[0]?.name || label,
        quantity_min: '1.25',
        unit: leatherMaterials[0]?.base_unit || 'sq_ft',
    });

    const createDefaultHardwareRow = (label = 'Hardware Item') => ({
        material_id: materials[0]?.id || '',
        material_variant_id: materials[0]?.variants?.[0]?.id || null,
        material_type: 'HARDWARE',
        label: materials[0]?.name || label,
        quantity_min: '1',
        unit: materials[0]?.base_unit || 'pcs',
    });

    // Parse existing single-color materials
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

    // Multi-color variations initialization
    const initialHasColors = Boolean(product.has_colors && product.colors?.length > 0);
    const [hasColors, setHasColors] = useState(initialHasColors);
    const [newColorInput, setNewColorInput] = useState('');
    const [activeColorIndex, setActiveColorIndex] = useState(0);

    // Parse existing colors if available
    const initialColors = (product.colors && product.colors.length > 0)
        ? product.colors.map((c) => {
            const cLeather = (c.materials || [])
                .filter((m) => m.material_type === 'LEATHER' || m.material?.is_leather)
                .map((m) => ({
                    material_id: m.material_id || '',
                    material_variant_id: m.material_variant_id || null,
                    material_type: 'LEATHER',
                    label: m.label || '',
                    quantity_min: m.quantity_min || '',
                    unit: m.unit || 'sq_ft',
                }));

            const cHardware = (c.materials || [])
                .filter((m) => m.material_type !== 'LEATHER' && !m.material?.is_leather)
                .map((m) => ({
                    material_id: m.material_id || '',
                    material_variant_id: m.material_variant_id || null,
                    material_type: m.material_type || 'HARDWARE',
                    label: m.label || '',
                    quantity_min: m.quantity_min || '',
                    unit: m.unit || 'pcs',
                }));

            return {
                id: c.id,
                color_name: c.color_name,
                image_url: c.image_url || '',
                leatherRows: cLeather.length > 0 ? cLeather : [createDefaultLeatherRow(`${c.color_name} Leather Shell`)],
                hardwareRows: cHardware.length > 0 ? cHardware : [createDefaultHardwareRow()],
            };
        })
        : [
            {
                id: null,
                color_name: 'Cognac Tan',
                image_url: '',
                leatherRows: initialLeather.length > 0 ? initialLeather : [createDefaultLeatherRow('Tan Outer Shell')],
                hardwareRows: initialHardware.length > 0 ? initialHardware : [createDefaultHardwareRow()],
            },
        ];

    const [colors, setColors] = useState(initialColors);
    const [singleLeatherRows, setSingleLeatherRows] = useState(
        initialLeather.length > 0 ? initialLeather : [createDefaultLeatherRow('Main Exterior Shell')]
    );
    const [singleHardwareRows, setSingleHardwareRows] = useState(
        initialHardware.length > 0 ? initialHardware : [createDefaultHardwareRow('Hardware Item')]
    );

    const { data, setData, post, processing, errors, transform } = useForm({
        code: product.code || '',
        name: product.name || '',
        category: product.category || 'Wallet',
        image_url: product.image_url || '',
        has_colors: initialHasColors,
        materials: [],
        colors: [],
    });

    // Current active leather and hardware rows
    const currentLeatherRows = hasColors
        ? (colors[activeColorIndex]?.leatherRows || [])
        : singleLeatherRows;

    const currentHardwareRows = hasColors
        ? (colors[activeColorIndex]?.hardwareRows || [])
        : singleHardwareRows;

    // Toggle multi-color mode
    const toggleHasColors = () => {
        if (!hasColors) {
            setColors((prev) => {
                if (prev.length > 0) {
                    const first = { ...prev[0] };
                    first.leatherRows = [...singleLeatherRows];
                    first.hardwareRows = [...singleHardwareRows];
                    return [first, ...prev.slice(1)];
                }
                return [{
                    id: null,
                    color_name: 'Cognac Tan',
                    image_url: '',
                    leatherRows: [...singleLeatherRows],
                    hardwareRows: [...singleHardwareRows],
                }];
            });
            setHasColors(true);
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
            id: null,
            color_name: name,
            leatherRows: [createDefaultLeatherRow(`${name} Outer Shell`)],
            hardwareRows: [createDefaultHardwareRow()],
        };

        const updated = [...colors, newColor];
        setColors(updated);
        setActiveColorIndex(updated.length - 1);
        setNewColorInput('');
    };

    const removeColor = (indexToRemove) => {
        if (colors.length <= 1) {
            alert('A multi-color product must have at least one color variation. Disable multi-color if this product has only one standard color.');
            return;
        }

        const updated = colors.filter((_, i) => i !== indexToRemove);
        setColors(updated);
        if (activeColorIndex >= updated.length) {
            setActiveColorIndex(updated.length - 1);
        }
    };

    // Leather Row Handlers
    const addLeatherRow = () => {
        const newRow = {
            material_id: leatherMaterials[0]?.id || '',
            material_variant_id: leatherMaterials[0]?.variants?.[0]?.id || null,
            material_type: 'LEATHER',
            label: leatherMaterials[0]?.name || '',
            quantity_min: '',
            unit: leatherMaterials[0]?.base_unit || 'sq_ft',
        };

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].leatherRows = [...updated[activeColorIndex].leatherRows, newRow];
                }
                return updated;
            });
        } else {
            setSingleLeatherRows((prev) => [...prev, newRow]);
        }

        setTimeout(() => {
            leatherBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const removeLeatherRow = (index) => {
        if (currentLeatherRows.length <= 1) return;

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].leatherRows = updated[activeColorIndex].leatherRows.filter((_, i) => i !== index);
                }
                return updated;
            });
        } else {
            setSingleLeatherRows((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const updateLeatherRow = (index, field, value) => {
        const updater = (rows) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], [field]: value };

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

            return updated;
        };

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].leatherRows = updater(updated[activeColorIndex].leatherRows);
                }
                return updated;
            });
        } else {
            setSingleLeatherRows(updater);
        }
    };

    // Hardware Row Handlers
    const addHardwareRow = () => {
        const newRow = {
            material_id: '',
            material_variant_id: null,
            material_type: 'HARDWARE',
            label: '',
            quantity_min: '',
            unit: 'pcs',
        };

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].hardwareRows = [...updated[activeColorIndex].hardwareRows, newRow];
                }
                return updated;
            });
        } else {
            setSingleHardwareRows((prev) => [...prev, newRow]);
        }

        setTimeout(() => {
            hardwareBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const removeHardwareRow = (index) => {
        if (currentHardwareRows.length <= 1) return;

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].hardwareRows = updated[activeColorIndex].hardwareRows.filter((_, i) => i !== index);
                }
                return updated;
            });
        } else {
            setSingleHardwareRows((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const updateHardwareRow = (index, field, value) => {
        const updater = (rows) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], [field]: value };

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

            return updated;
        };

        if (hasColors) {
            setColors((prev) => {
                const updated = [...prev];
                if (updated[activeColorIndex]) {
                    updated[activeColorIndex].hardwareRows = updater(updated[activeColorIndex].hardwareRows);
                }
                return updated;
            });
        } else {
            setSingleHardwareRows(updater);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (hasColors) {
            const formattedColors = colors.map((c, idx) => {
                const cMaterials = [
                    ...c.leatherRows.filter((r) => r.material_id && r.label),
                    ...c.hardwareRows.filter((r) => r.material_id && r.label),
                ];
                return {
                    id: c.id || null,
                    color_name: c.color_name,
                    image_url: c.image_url || null,
                    sort_order: idx + 1,
                    materials: cMaterials.length > 0 ? cMaterials : [
                        {
                            material_id: leatherMaterials[0]?.id || materials[0]?.id || null,
                            material_type: 'LEATHER',
                            label: `${c.color_name} Leather Shell`,
                            quantity_min: '1.25',
                            unit: 'sq_ft',
                        },
                    ],
                };
            });

            transform((formData) => ({
                ...formData,
                _method: 'PUT',
                has_colors: true,
                colors: formattedColors,
                materials: [],
            }));
        } else {
            const combined = [
                ...singleLeatherRows.filter((r) => r.material_id && r.label),
                ...singleHardwareRows.filter((r) => r.material_id && r.label),
            ];

            transform((formData) => ({
                ...formData,
                _method: 'PUT',
                has_colors: false,
                colors: [],
                materials: combined.length > 0 ? combined : [
                    {
                        material_id: leatherMaterials[0]?.id || materials[0]?.id || null,
                        material_type: 'LEATHER',
                        label: 'Main Leather Shell',
                        quantity_min: '1.25',
                        unit: 'sq_ft',
                    },
                ],
            }));
        }

        post(route('products.update', product.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Product: ${product.name} — Leather CRM`} />

            <PageHeader
                title={`Edit Product: ${product.name}`}
                description="Update specifications, color variations, leather cutting BOM (Sq. Ft), and hardware specifications"
                action={
                    <Link href={route('products.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={submit} className="w-full space-y-6">

                {/* 1. General Product Specifications */}
                <Card className="border-neutral-200/90 shadow-2xs space-y-5">
                    <div className="pb-3 border-b border-neutral-200">
                        <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-brand-600" />
                            1. General Product Specifications
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Update the product code, category, and primary article photo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-[5fr_11fr_4fr] gap-4">
                                <Input
                                    label="Product Code / SKU"
                                    required
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g. WAL-001, BAG-LUX-02"
                                    error={errors.code}
                                />
                                <Input
                                    label="Product Name"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Minimalist Bifold Leather Wallet"
                                    error={errors.name}
                                />
                                <Input
                                    label="Category"
                                    placeholder="e.g. Wallet, Bag, Belt, Cardholder"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    error={errors.category}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col">
                            <ImageUpload
                                label="Primary Product Photo (Optional)"
                                value={data.image_url}
                                onChange={(url) => setData('image_url', url)}
                                error={errors.image_url}
                            />
                        </div>
                    </div>

                    {/* Multi-Color Variations Switcher Card */}
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
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-700 rounded border border-brand-200">
                                        Active ({colors.length} {colors.length === 1 ? 'Colorway' : 'Colorways'})
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-neutral-500">
                                Normally OFF (Single Standard BOM). When enabled, configure custom colorways (e.g. Cognac Tan, Black) with independent leather cuts and hardware.
                            </p>
                        </div>

                        {/* Switch Toggle Button */}
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

                    {/* Colorway Creator Panel (When Multi-Color is ON) */}
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

                                {/* Quick Colorway Suggestions */}
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
                {hasColors && (
                    <div className="rounded-xl border border-brand-300/80 bg-white p-4 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-brand-600" />
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                                        Colorway BOM Workspaces
                                    </h4>
                                    <p className="text-[11px] text-neutral-500">
                                        Select a color tab below to configure its independent cutting BOM and hardware.
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
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                            isActive ? 'bg-brand-700/60 text-white' : 'bg-neutral-200 text-neutral-600'
                                        }`}>
                                            {c.leatherRows.filter((r) => r.material_id).length} Cuts · {c.hardwareRows.filter((r) => r.material_id).length} Hardware
                                        </span>

                                        {colors.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeColor(idx);
                                                }}
                                                className={`p-0.5 rounded hover:bg-red-500 hover:text-white transition-colors ml-1 ${
                                                    isActive ? 'text-white/80' : 'text-neutral-400'
                                                }`}
                                                title={`Remove ${c.color_name}`}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Colorway Workspace Guidance Notice */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5 font-medium text-brand-900">
                                <Palette className="w-3.5 h-3.5 text-brand-600" />
                                Active Workspace: <strong className="text-brand-800 font-bold">{colors[activeColorIndex]?.color_name}</strong>
                            </span>
                            <span className="text-[11px] text-neutral-500 hidden sm:inline">
                                Leather cuts and hardware added in Sections 2 & 3 below apply strictly to this colorway.
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. DEDICATED LEATHER SPECIFICATIONS & CUTTING BOM */}
                <Card className="border-brand-200/80 bg-gradient-to-b from-brand-50/20 to-white shadow-2xs">
                    <div className="mb-4 pb-3 border-b border-brand-200/80 flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-brand-700" />
                                2. Leather Specifications & Cutting BOM (Sq. Ft)
                                {hasColors && (
                                    <span className="text-xs font-semibold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded ml-2">
                                        Colorway: {colors[activeColorIndex]?.color_name}
                                    </span>
                                )}
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
                            {currentLeatherRows.map((row, idx) => {
                                const selectedMat = leatherMaterials.find((m) => m.id === parseInt(row.material_id) || m.id === row.material_id);
                                const variants = selectedMat?.variants || [];

                                return (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-lg border border-brand-200/70 bg-white relative space-y-2.5 shadow-2xs"
                                    >
                                        <div className="flex items-center justify-between text-xs font-bold text-brand-900 uppercase">
                                            <span>
                                                Leather Component #{idx + 1}
                                                {hasColors && ` (${colors[activeColorIndex]?.color_name})`}
                                            </span>
                                            {currentLeatherRows.length > 1 && (
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
                                <span>
                                    + Add Leather Cut ({hasColors ? colors[activeColorIndex]?.color_name : 'Sq. Ft'})
                                </span>
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
                            {hasColors && (
                                <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded ml-2">
                                    Colorway: {colors[activeColorIndex]?.color_name}
                                </span>
                            )}
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
                        {currentHardwareRows.map((row, idx) => {
                            const selectedMat = materials.find((m) => m.id === parseInt(row.material_id) || m.id === row.material_id);
                            const variants = selectedMat?.variants || [];

                            return (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 relative space-y-2.5 shadow-2xs"
                                >
                                    <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase">
                                        <span>
                                            Hardware Item #{idx + 1}
                                            {hasColors && ` (${colors[activeColorIndex]?.color_name})`}
                                        </span>
                                        {currentHardwareRows.length > 1 && (
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
                            <span>
                                + Add Hardware / Consumable Item ({hasColors ? colors[activeColorIndex]?.color_name : 'Single BOM'})
                            </span>
                        </button>
                    </div>

                    <div ref={hardwareBottomRef} />
                </Card>

                {/* Submit Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link href={route('products.index')}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" isLoading={processing}>
                        Update Product & BOM
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
