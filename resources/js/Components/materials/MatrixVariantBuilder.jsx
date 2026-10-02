import React, { useState, useMemo, useEffect } from 'react';
import {
    Layers,
    Sparkles,
    Check,
    Plus,
    X,
    Search,
    AlertCircle,
    CheckSquare,
    Square,
    RotateCcw,
    SlidersHorizontal,
    Tag,
} from 'lucide-react';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';

// Helper function to add one or more tags (supports comma-separated string, enter, or array)
function addDimensionTags(rawInput, currentList, setList) {
    if (!rawInput) return;
    const parts = rawInput
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

    if (parts.length === 0) return;

    setList((prev) => {
        const next = [...prev];
        parts.forEach((p) => {
            if (!next.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
                next.push(p);
            }
        });
        return next;
    });
}

function removeDimensionTag(tagToRemove, setList) {
    setList((prev) => prev.filter((item) => item !== tagToRemove));
}

// Simple color helper for table preview dots
function getSimpleColorHex(colorName) {
    if (!colorName) return '#94a3b8';
    const lower = colorName.toLowerCase().trim();
    const commonColors = {
        black: '#171717',
        white: '#f8fafc',
        red: '#dc2626',
        blue: '#2563eb',
        navy: '#1e3a8a',
        green: '#16a34a',
        yellow: '#eab308',
        orange: '#ea580c',
        brown: '#78350f',
        grey: '#64748b',
        gray: '#64748b',
        gold: '#d97706',
        silver: '#94a3b8',
        purple: '#9333ea',
        pink: '#ec4899',
        tan: '#b45309',
        khaki: '#c2b280',
        cream: '#fef08a',
        beige: '#f5f5dc',
        maroon: '#800000',
        burgundy: '#800020',
        teal: '#0d9488',
        olive: '#65a30d',
    };
    for (const [key, hex] of Object.entries(commonColors)) {
        if (lower.includes(key)) return hex;
    }
    return '#94a3b8';
}

// Reusable Dimension Tag Input Card
function DimensionTagSection({
    title,
    icon: Icon,
    items,
    setItems,
    inputVal,
    setInputVal,
    placeholder,
    helperText,
    badgeColorClass = 'bg-brand-50 border-brand-200 text-brand-900',
}) {
    const handleAdd = (e) => {
        if (e) e.preventDefault();
        addDimensionTags(inputVal, items, setItems);
        setInputVal('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handlePaste = (e) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText && (pastedText.includes(',') || pastedText.includes('\n'))) {
            e.preventDefault();
            addDimensionTags(pastedText, items, setItems);
            setInputVal('');
        }
    };

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5 text-brand-600" />
                    {title} ({items.length})
                </label>
                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setItems([])}
                        className="text-[11px] font-semibold text-neutral-400 hover:text-danger-600 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Input with Add button */}
            <form onSubmit={handleAdd} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none bg-neutral-0"
                    />
                </div>
                <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={!inputVal.trim()}
                    className="shrink-0 text-xs py-2 px-3"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                </Button>
            </form>

            {/* Active Tags Display */}
            {items.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50/80 rounded-lg border border-neutral-200/60 max-h-40 overflow-y-auto">
                    {items.map((item) => (
                        <span
                            key={item}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-2xs ${badgeColorClass}`}
                        >
                            <span>{item}</span>
                            <button
                                type="button"
                                onClick={() => removeDimensionTag(item, setItems)}
                                className="text-neutral-400 hover:text-danger-600 p-0.5 rounded transition-colors"
                                title={`Remove ${item}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-[11px] text-neutral-400 italic px-1">
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default function MatrixVariantBuilder({
    baseUnit = 'pcs',
    defaultReorderLevel = '100',
    defaultInitialStock = '0',
    onChange,
}) {
    // Dimension States (Manual entry, empty clean slate)
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [customSizeInput, setCustomSizeInput] = useState('');

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [customTypeInput, setCustomTypeInput] = useState('');

    const [selectedColors, setSelectedColors] = useState([]);
    const [customColorInput, setCustomColorInput] = useState('');

    // Generated Combinations State
    const [generatedItems, setGeneratedItems] = useState([]);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Review / Table Filter & Bulk Inputs
    const [tableSearch, setTableSearch] = useState('');
    const [bulkStock, setBulkStock] = useState('');
    const [bulkReorder, setBulkReorder] = useState('');

    // Flexible dimension fallback lists (handles cases where a dimension is skipped)
    const sizesList = selectedSizes.length > 0 ? selectedSizes : [''];
    const typesList = selectedTypes.length > 0 ? selectedTypes : [''];
    const colorsList = selectedColors.length > 0 ? selectedColors : [''];

    const hasAnySelection = selectedSizes.length > 0 || selectedTypes.length > 0 || selectedColors.length > 0;
    const totalPotentialCombos = hasAnySelection ? sizesList.length * typesList.length * colorsList.length : 0;

    // Generate Matrix Combinations Function
    const handleGenerate = () => {
        if (totalPotentialCombos === 0) return;

        const results = [];
        let idCounter = 1;

        sizesList.forEach((size) => {
            typesList.forEach((type) => {
                colorsList.forEach((color) => {
                    const prefix = [size, type].filter(Boolean).join(' ');
                    const name = prefix && color ? `${prefix} - ${color}` : (prefix || color);

                    results.push({
                        id: `gen-${idCounter++}`,
                        enabled: true,
                        size: size || '—',
                        type: type || '—',
                        color: color || '—',
                        name: name.trim(),
                        initial_stock: defaultInitialStock,
                        reorder_level: defaultReorderLevel,
                    });
                });
            });
        });

        setGeneratedItems(results);
        setHasGenerated(true);
    };

    // Keep parent form updated whenever generatedItems changes
    useEffect(() => {
        if (!hasGenerated) return;

        const activeVariants = generatedItems
            .filter((item) => item.enabled)
            .map((item) => ({
                name: item.name.trim(),
                sku: null,
                initial_stock: item.initial_stock || '0',
                reorder_level: item.reorder_level || '0',
            }));

        if (onChange) {
            onChange(activeVariants);
        }
    }, [generatedItems, hasGenerated]);

    // Handle Item Modifications in Grid
    const handleToggleItem = (id) => {
        setGeneratedItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
        );
    };

    const handleItemFieldChange = (id, field, value) => {
        setGeneratedItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    // Bulk Actions
    const handleSelectAll = (enable) => {
        setGeneratedItems((prev) => prev.map((item) => ({ ...item, enabled: enable })));
    };

    const handleApplyBulkStock = () => {
        if (bulkStock === '') return;
        setGeneratedItems((prev) =>
            prev.map((item) => (item.enabled ? { ...item, initial_stock: bulkStock } : item))
        );
    };

    const handleApplyBulkReorder = () => {
        if (bulkReorder === '') return;
        setGeneratedItems((prev) =>
            prev.map((item) => (item.enabled ? { ...item, reorder_level: bulkReorder } : item))
        );
    };

    // Filtered Items for Display
    const filteredItems = useMemo(() => {
        if (!tableSearch) return generatedItems;
        const q = tableSearch.toLowerCase();
        return generatedItems.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.color.toLowerCase().includes(q) ||
                i.type.toLowerCase().includes(q) ||
                i.size.toLowerCase().includes(q)
        );
    }, [generatedItems, tableSearch]);

    const enabledCount = generatedItems.filter((i) => i.enabled).length;

    return (
        <div className="space-y-5">
            {/* 1. ATTRIBUTE DIMENSION BUILDERS (ALL MANUAL ENTRY) */}
            <div className="p-4 bg-neutral-0 rounded-xl border border-neutral-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                            Step 1: Manually Enter Attribute Dimensions
                        </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500">
                        Combines Sizes × Types × Colors
                    </span>
                </div>

                {/* Dimension A: Sizes */}
                <DimensionTagSection
                    title="Sizes / Gauges"
                    icon={Tag}
                    items={selectedSizes}
                    setItems={setSelectedSizes}
                    inputVal={customSizeInput}
                    setInputVal={setCustomSizeInput}
                    placeholder="Type sizes (e.g. 3, 5, #5, 20cm) and press Enter or comma..."
                    helperText="No sizes added yet. Type your custom sizes above and press Enter."
                    badgeColorClass="bg-brand-50 border-brand-200 text-brand-900"
                />

                {/* Dimension B: Types / Finishes */}
                <div className="pt-3 border-t border-neutral-100">
                    <DimensionTagSection
                        title="Types / Finishes"
                        icon={Layers}
                        items={selectedTypes}
                        setItems={setSelectedTypes}
                        inputVal={customTypeInput}
                        setInputVal={setCustomTypeInput}
                        placeholder="Type finishes/types (e.g. Nickel, Metal, Kata) and press Enter or comma..."
                        helperText="No types added yet. Type your custom finishes or types above and press Enter."
                        badgeColorClass="bg-neutral-100 border-neutral-300 text-neutral-800"
                    />
                </div>

                {/* Dimension C: Colors */}
                <div className="pt-3 border-t border-neutral-100">
                    <DimensionTagSection
                        title="Colors / Variations"
                        icon={Sparkles}
                        items={selectedColors}
                        setItems={setSelectedColors}
                        inputVal={customColorInput}
                        setInputVal={setCustomColorInput}
                        placeholder="Type colors (e.g. Red, Black, Blue) and press Enter, or paste list..."
                        helperText="No colors added yet. Type or paste your 30+ colors here (e.g. Red, Black, Navy, Brown...)."
                        badgeColorClass="bg-brand-50 border-brand-300 text-brand-950"
                    />
                </div>

                {/* GENERATE ACTION BAR */}
                <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-50/40 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                        {totalPotentialCombos > 0 ? (
                            <span className="text-xs text-neutral-700">
                                <strong>{selectedSizes.length || 1}</strong> Size{selectedSizes.length !== 1 ? 's' : ''} ×{' '}
                                <strong>{selectedTypes.length || 1}</strong> Type{selectedTypes.length !== 1 ? 's' : ''} ×{' '}
                                <strong>{selectedColors.length || 1}</strong> Color{selectedColors.length !== 1 ? 's' : ''} ={' '}
                                <span className="font-bold text-brand-700 text-sm">
                                    {totalPotentialCombos} Combinations
                                </span>
                            </span>
                        ) : (
                            <span className="text-xs text-neutral-500 italic">
                                No attributes added yet. Type your custom sizes, finishes, or colors above to generate combinations.
                            </span>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={totalPotentialCombos === 0}
                        onClick={handleGenerate}
                        className="shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        {hasGenerated ? 'Re-Generate Combinations' : 'Generate Matrix Combinations'}
                    </Button>
                </div>
            </div>

            {/* 2. GENERATED COMBINATIONS TABLE & BULK CONTROLS */}
            {hasGenerated && (
                <div className="p-4 bg-neutral-0 rounded-xl border border-neutral-200 shadow-2xs space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-200">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                    Step 2: Review & Set Stock
                                </h4>
                                <Badge variant={enabledCount > 0 ? 'success' : 'neutral'} size="sm">
                                    {enabledCount} of {generatedItems.length} Enabled
                                </Badge>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                                Uncheck any combinations you don’t have in stock. Set initial stock or reorder alert per item.
                            </p>
                        </div>

                        {/* Table Search */}
                        <div className="relative w-full sm:w-56">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Filter combinations..."
                                value={tableSearch}
                                onChange={(e) => setTableSearch(e.target.value)}
                                className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Bulk Action Controls */}
                    <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleSelectAll(true)}
                                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800"
                            >
                                <CheckSquare className="w-3.5 h-3.5" /> Select All
                            </button>
                            <span className="text-neutral-300">|</span>
                            <button
                                type="button"
                                onClick={() => handleSelectAll(false)}
                                className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-700"
                            >
                                <Square className="w-3.5 h-3.5" /> Deselect All
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-neutral-500">Bulk Stock:</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    placeholder="Qty"
                                    value={bulkStock}
                                    onChange={(e) => setBulkStock(e.target.value)}
                                    className="w-16 h-7 text-xs px-2 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyBulkStock}
                                    className="h-7 px-2 text-[11px] font-bold bg-neutral-200 hover:bg-neutral-300 rounded text-neutral-800"
                                >
                                    Apply
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-neutral-500">Bulk Reorder:</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    placeholder="Min"
                                    value={bulkReorder}
                                    onChange={(e) => setBulkReorder(e.target.value)}
                                    className="w-16 h-7 text-xs px-2 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyBulkReorder}
                                    className="h-7 px-2 text-[11px] font-bold bg-neutral-200 hover:bg-neutral-300 rounded text-neutral-800"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Combinations Scrollable Table */}
                    <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-lg">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-neutral-50 sticky top-0 z-10 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="p-2.5 w-10 text-center">Use</th>
                                    <th className="p-2.5">Variation Name</th>
                                    <th className="p-2.5 w-24">Size</th>
                                    <th className="p-2.5 w-28">Type</th>
                                    <th className="p-2.5 w-32">Color</th>
                                    <th className="p-2.5 w-28">Initial ({baseUnit})</th>
                                    <th className="p-2.5 w-28">Reorder Min</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-neutral-400">
                                            No combinations match your filter "{tableSearch}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${
                                                item.enabled ? 'hover:bg-neutral-50' : 'bg-neutral-100/50 opacity-40'
                                            }`}
                                        >
                                            <td className="p-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.enabled}
                                                    onChange={() => handleToggleItem(item.id)}
                                                    className="w-4 h-4 text-brand-600 rounded border-neutral-300 focus:ring-brand-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-2.5">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    disabled={!item.enabled}
                                                    onChange={(e) =>
                                                        handleItemFieldChange(item.id, 'name', e.target.value)
                                                    }
                                                    className="w-full font-semibold text-neutral-900 bg-transparent border-0 border-b border-transparent hover:border-neutral-300 focus:border-brand-500 focus:bg-neutral-0 focus:outline-none px-1 py-0.5"
                                                />
                                            </td>
                                            <td className="p-2.5 font-sans font-medium text-neutral-700">
                                                {item.size}
                                            </td>
                                            <td className="p-2.5 text-neutral-600">{item.type}</td>
                                            <td className="p-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-neutral-300"
                                                        style={{ backgroundColor: getSimpleColorHex(item.color) }}
                                                    />
                                                    <span className="truncate">{item.color}</span>
                                                </div>
                                            </td>
                                            <td className="p-2.5">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    min="0"
                                                    disabled={!item.enabled}
                                                    value={item.initial_stock}
                                                    onChange={(e) =>
                                                        handleItemFieldChange(item.id, 'initial_stock', e.target.value)
                                                    }
                                                    className="w-24 text-xs px-2 py-1 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none disabled:bg-neutral-100"
                                                />
                                            </td>
                                            <td className="p-2.5">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    min="0"
                                                    disabled={!item.enabled}
                                                    value={item.reorder_level}
                                                    onChange={(e) =>
                                                        handleItemFieldChange(item.id, 'reorder_level', e.target.value)
                                                    }
                                                    className="w-24 text-xs px-2 py-1 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none disabled:bg-neutral-100"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
