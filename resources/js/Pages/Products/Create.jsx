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
import { Plus, Trash2, ArrowLeft, Tag, Scissors, Boxes, Info, Palette, X, AlertTriangle } from 'lucide-react';

export default function Create({ leatherMaterials = [], materials = [] }) {
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

    // Multi-color variations state
    const [hasColors, setHasColors] = useState(false);
    const [newColorInput, setNewColorInput] = useState('');
    const [activeColorIndex, setActiveColorIndex] = useState(0);
    const [colorToDelete, setColorToDelete] = useState(null);

    // Colors state (starts completely empty; no forced default color on toggle)
    const [colors, setColors] = useState([]);

    // Single BOM state (when hasColors is inactive)
    const [singleLeatherRows, setSingleLeatherRows] = useState([createDefaultLeatherRow('Main Exterior Shell')]);
    const [singleHardwareRows, setSingleHardwareRows] = useState([createDefaultHardwareRow('Hardware / Fitting')]);

    const { data, setData, post, processing, errors, transform } = useForm({
        code: '',
        name: '',
        category: 'Wallet',
        image_url: '',
        has_colors: false,
        materials: [],
        colors: [],
    });

    // Determine current active leather and hardware rows
    const currentLeatherRows = hasColors
        ? (colors[activeColorIndex]?.leatherRows || [])
        : singleLeatherRows;

    const currentHardwareRows = hasColors
        ? (colors[activeColorIndex]?.hardwareRows || [])
        : singleHardwareRows;

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
            leatherRows: [createDefaultLeatherRow(`${name} Outer Shell`)],
            hardwareRows: [createDefaultHardwareRow()],
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
            if (colors.length === 0) {
                alert('Please add at least one colorway variation before saving, or switch off multi-color mode.');
                return;
            }

            // Validate multi-color payload
            const formattedColors = colors.map((c, idx) => {
                const cMaterials = [
                    ...c.leatherRows.filter((r) => r.material_id && r.label),
                    ...c.hardwareRows.filter((r) => r.material_id && r.label),
                ];
                return {
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

        post(route('products.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Product & BOM — Leather CRM" />

            <PageHeader
                title="Create New Product"
                description="Define product specifications, leather cutting BOM (Sq. Ft), and hardware specifications"
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
                            Enter the product code, category, and upload a primary article photo.
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
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                        colors.length > 0
                                            ? 'bg-brand-100 text-brand-700 border-brand-200'
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }`}>
                                        {colors.length > 0
                                            ? `Active (${colors.length} ${colors.length === 1 ? 'Colorway' : 'Colorways'})`
                                            : 'Active (0 Colorways)'}
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

                {/* 2. DEDICATED LEATHER SPECIFICATIONS & CUTTING BOM */}
                <Card className="border-brand-200/80 bg-gradient-to-b from-brand-50/20 to-white shadow-2xs">
                    <div className="mb-4 pb-3 border-b border-brand-200/80 flex items-center justify-between">
                        <div>
                            <h3 className="text-md font-bold text-neutral-900 flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-brand-700" />
                                2. Leather Specifications & Cutting BOM (Sq. Ft)
                                {hasColors && colors[activeColorIndex] && (
                                    <span className="text-xs font-semibold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded ml-2">
                                        Colorway: {colors[activeColorIndex]?.color_name}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Specify leather hides, color shades, and exact cutting square footage required per piece.
                            </p>
                        </div>
                    </div>

                    {hasColors && colors.length === 0 ? (
                        <div className="p-6 rounded-xl bg-brand-50/50 border border-brand-200 text-center space-y-2.5">
                            <Palette className="w-7 h-7 text-brand-600 mx-auto" />
                            <h4 className="text-xs font-bold text-neutral-900">No Colorway Created Yet</h4>
                            <p className="text-xs text-neutral-600 max-w-md mx-auto">
                                Type a custom color name above and click <strong>"+ Add Color"</strong> (or pick a quick suggestion like <em>+ Tan</em>, <em>+ Black</em>) to start configuring leather cuts for it.
                            </p>
                        </div>
                    ) : leatherMaterials.length === 0 ? (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>No leather hides registered yet.</span>
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
                                <span>+ Add Leather Cut</span>
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
                            {hasColors && colors[activeColorIndex] && (
                                <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded ml-2">
                                    Colorway: {colors[activeColorIndex]?.color_name}
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Specify metallic hardware, zippers, sliders, reinforcement sheets, and inner backing components.
                        </p>
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
                                Hardware, lining, and consumables will become configurable as soon as you create your first colorway above.
                            </p>
                        </div>
                    ) : (
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
                                                {hasColors && colors[activeColorIndex] && ` (${colors[activeColorIndex].color_name})`}
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

                                            {selectedMat && variants.length > 1 && (
                                                <div className="sm:col-span-3">
                                                    <Select
                                                        label="Variation / Tone"
                                                        value={row.material_variant_id || ''}
                                                        onChange={(e) => updateHardwareRow(idx, 'material_variant_id', e.target.value)}
                                                    >
                                                        {variants.map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.name}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            )}

                                            {selectedMat ? (
                                                <>
                                                    <div className={variants.length > 1 ? 'sm:col-span-3' : 'sm:col-span-6'}>
                                                        <Input
                                                            label="Component / Fitting Note"
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
                                    + Add Hardware / Consumable Item {hasColors && colors[activeColorIndex] ? `(${colors[activeColorIndex].color_name})` : ''}
                                </span>
                            </button>
                        </div>
                    )}

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
                                Are you sure you want to delete this colorway? It may contain configured leather cuts and hardware materials.
                            </p>
                            {colorToDelete?.color && (
                                <div className="mt-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-1 text-neutral-700">
                                    <div className="flex items-center justify-between font-medium">
                                        <span>Leather Cutting Components:</span>
                                        <span className="font-bold text-neutral-900">
                                            {colorToDelete.color.leatherRows?.filter((r) => r.material_id).length || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between font-medium">
                                        <span>Hardware & Fittings:</span>
                                        <span className="font-bold text-neutral-900">
                                            {colorToDelete.color.hardwareRows?.filter((r) => r.material_id).length || 0}
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
