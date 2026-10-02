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
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import {
    STANDARD_SIZES,
    STANDARD_TYPES,
    STANDARD_LEATHER_COLORS,
} from '@/constants/materialAttributes';

export default function MatrixVariantBuilder({
    baseUnit = 'pcs',
    defaultReorderLevel = '100',
    defaultInitialStock = '0',
    onChange,
}) {
    // Dimension States (Empty clean slate by default)
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

    // Toggle Size Selection
    const toggleSize = (sizeVal) => {
        setSelectedSizes((prev) =>
            prev.includes(sizeVal) ? prev.filter((s) => s !== sizeVal) : [...prev, sizeVal]
        );
    };

    const handleAddCustomSize = (e) => {
        e.preventDefault();
        const trimmed = customSizeInput.trim();
        if (trimmed && !selectedSizes.includes(trimmed)) {
            setSelectedSizes((prev) => [...prev, trimmed]);
            setCustomSizeInput('');
        }
    };

    // Toggle Type Selection
    const toggleType = (typeVal) => {
        setSelectedTypes((prev) =>
            prev.includes(typeVal) ? prev.filter((t) => t !== typeVal) : [...prev, typeVal]
        );
    };

    const handleAddCustomType = (e) => {
        e.preventDefault();
        const trimmed = customTypeInput.trim();
        if (trimmed && !selectedTypes.includes(trimmed)) {
            setSelectedTypes((prev) => [...prev, trimmed]);
            setCustomTypeInput('');
        }
    };

    // Toggle Color Selection
    const toggleColor = (colorName) => {
        setSelectedColors((prev) =>
            prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
        );
    };

    const handleAddCustomColor = (e) => {
        e.preventDefault();
        const trimmed = customColorInput.trim();
        if (trimmed && !selectedColors.includes(trimmed)) {
            setSelectedColors((prev) => [...prev, trimmed]);
            setCustomColorInput('');
        }
    };

    const handleSelectTopColors = () => {
        const top5 = ['Black', 'Dark Brown', 'Tan / Cognac', 'Red', 'Navy Blue'];
        setSelectedColors(top5);
    };

    const handleSelectAllColors = () => {
        setSelectedColors(STANDARD_LEATHER_COLORS.map((c) => c.name));
    };

    const handleClearColors = () => {
        setSelectedColors([]);
    };

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

    // Helper to find color hex
    const getColorHex = (name) => {
        const found = STANDARD_LEATHER_COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return found ? found.hex : '#94a3b8';
    };

    return (
        <div className="space-y-5">
            {/* 1. ATTRIBUTE DIMENSION BUILDERS */}
            <div className="p-4 bg-neutral-0 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                            Step 1: Choose Attribute Dimensions
                        </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500">
                        Combines Sizes × Types × Colors
                    </span>
                </div>

                {/* Dimension A: Sizes */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-neutral-400" />
                            Sizes / Gauges ({selectedSizes.length} selected)
                        </label>
                        <form onSubmit={handleAddCustomSize} className="flex items-center gap-1.5">
                            <input
                                type="text"
                                placeholder="+ Custom Size (e.g. #8, 20cm)"
                                value={customSizeInput}
                                onChange={(e) => setCustomSizeInput(e.target.value)}
                                className="h-6 text-[11px] px-2 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none w-36"
                            />
                            <button
                                type="submit"
                                className="h-6 px-1.5 text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {STANDARD_SIZES.map((sz) => {
                            const isSelected = selectedSizes.includes(sz.value);
                            return (
                                <button
                                    key={sz.value}
                                    type="button"
                                    onClick={() => toggleSize(sz.value)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border ${
                                        isSelected
                                            ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-2xs font-semibold'
                                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-brand-600" />}
                                    {sz.label}
                                </button>
                            );
                        })}

                        {/* Custom user-added sizes */}
                        {selectedSizes
                            .filter((s) => !STANDARD_SIZES.some((std) => std.value === s))
                            .map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => toggleSize(s)}
                                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 border border-brand-500 text-brand-800 flex items-center gap-1.5"
                                >
                                    <Check className="w-3 h-3 text-brand-600" />
                                    {s}
                                    <X
                                        className="w-3 h-3 text-neutral-400 hover:text-danger-600 ml-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSize(s);
                                        }}
                                    />
                                </button>
                            ))}
                    </div>
                </div>

                {/* Dimension B: Types / Finishes */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-neutral-400" />
                            Types / Finishes ({selectedTypes.length} selected)
                        </label>
                        <form onSubmit={handleAddCustomType} className="flex items-center gap-1.5">
                            <input
                                type="text"
                                placeholder="+ Custom Type"
                                value={customTypeInput}
                                onChange={(e) => setCustomTypeInput(e.target.value)}
                                className="h-6 text-[11px] px-2 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none w-32"
                            />
                            <button
                                type="submit"
                                className="h-6 px-1.5 text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {STANDARD_TYPES.map((t) => {
                            const isSelected = selectedTypes.includes(t.value);
                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => toggleType(t.value)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border ${
                                        isSelected
                                            ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-2xs font-semibold'
                                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-brand-600" />}
                                    {t.label}
                                </button>
                            );
                        })}

                        {/* Custom user-added types */}
                        {selectedTypes
                            .filter((t) => !STANDARD_TYPES.some((std) => std.value === t))
                            .map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => toggleType(t)}
                                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 border border-brand-500 text-brand-800 flex items-center gap-1.5"
                                >
                                    <Check className="w-3 h-3 text-brand-600" />
                                    {t}
                                    <X
                                        className="w-3 h-3 text-neutral-400 hover:text-danger-600 ml-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleType(t);
                                        }}
                                    />
                                </button>
                            ))}
                    </div>
                </div>

                {/* Dimension C: Colors Palette */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                            Colors ({selectedColors.length} selected)
                        </label>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[11px]">
                                <button
                                    type="button"
                                    onClick={handleSelectTopColors}
                                    className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                                >
                                    Top 5
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSelectAllColors}
                                    className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                                >
                                    All 22
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearColors}
                                    className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-danger-600 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>

                            <form onSubmit={handleAddCustomColor} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    placeholder="+ Custom Color"
                                    value={customColorInput}
                                    onChange={(e) => setCustomColorInput(e.target.value)}
                                    className="h-6 text-[11px] px-2 border border-neutral-300 rounded focus:border-brand-500 focus:outline-none w-28"
                                />
                                <button
                                    type="submit"
                                    className="h-6 px-1.5 text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-neutral-50/50 rounded-lg border border-neutral-200/60">
                        {STANDARD_LEATHER_COLORS.map((col) => {
                            const isSelected = selectedColors.includes(col.name);
                            return (
                                <button
                                    key={col.name}
                                    type="button"
                                    onClick={() => toggleColor(col.name)}
                                    className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1.5 border ${
                                        isSelected
                                            ? 'bg-neutral-0 border-brand-500 shadow-2xs font-bold text-neutral-900 ring-1 ring-brand-500'
                                            : 'bg-neutral-0 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                                    }`}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-neutral-300"
                                        style={{ backgroundColor: col.hex }}
                                    />
                                    {col.name}
                                    {isSelected && <Check className="w-3 h-3 text-brand-600 ml-0.5" />}
                                </button>
                            );
                        })}

                        {/* Custom user-added colors */}
                        {selectedColors
                            .filter((c) => !STANDARD_LEATHER_COLORS.some((std) => std.name === c))
                            .map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => toggleColor(c)}
                                    className="px-2 py-1 rounded text-xs font-bold bg-neutral-0 border border-brand-500 text-neutral-900 shadow-2xs flex items-center gap-1.5 ring-1 ring-brand-500"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-neutral-400" />
                                    {c}
                                    <X
                                        className="w-3 h-3 text-neutral-400 hover:text-danger-600 ml-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleColor(c);
                                        }}
                                    />
                                </button>
                            ))}
                    </div>
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
                                No attributes selected yet. Select or type sizes, finishes, or colors above to generate combinations.
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
                                                        style={{ backgroundColor: getColorHex(item.color) }}
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
