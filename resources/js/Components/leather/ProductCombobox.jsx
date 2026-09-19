import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, Package } from 'lucide-react';

/**
 * ProductCombobox — Enterprise Single-Tier In-Place Searchable Combobox.
 * 
 * Features:
 * - Single-Tier UX: Table cell trigger IS the active search input — ZERO redundant search bars!
 * - High-density display: Highlighted Amber SKU/Code badge + Name + Part No in compact layout
 * - React createPortal: NEVER clipped by table overflow-x-auto or parent borders
 * - Real-time dual search by Code, Name, and Part No
 * - Instant onMouseDown selection handling with zero blur race conditions
 * - Dynamic viewport positioning with auto-flip when near bottom
 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 */
export default function ProductCombobox({
    products = [],
    value,
    onChange,
    error,
    placeholder = 'Search by code or product name...',
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 380, openUpward: false });

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    // Find currently selected product
    const selectedProduct = useMemo(() => {
        return products.find((p) => String(p.id) === String(value)) || null;
    }, [products, value]);

    // Filter products in real time by code, name, or part_no
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase().trim();
        return products.filter((p) => {
            const codeMatch = (p.code || '').toLowerCase().includes(q);
            const nameMatch = (p.name || '').toLowerCase().includes(q);
            const partMatch = (p.part_no || '').toLowerCase().includes(q);
            return codeMatch || nameMatch || partMatch;
        });
    }, [products, searchQuery]);

    // Update portal coordinates based on trigger position
    const updatePosition = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 280;
        const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

        const calculatedWidth = Math.max(rect.width, 360);
        const maxLeft = window.innerWidth - calculatedWidth - 12;
        const left = Math.max(12, Math.min(rect.left, maxLeft));

        setDropdownCoords({
            top: openUpward ? rect.top - 4 : rect.bottom + 4,
            left,
            width: calculatedWidth,
            openUpward,
        });
    };

    // Open dropdown and enter editing mode
    const handleOpen = () => {
        if (disabled) return;
        updatePosition();
        setIsOpen(true);
        setIsEditing(true);
        setSearchQuery('');
        setHighlightedIndex(0);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    };

    // Close dropdown and reset editing mode
    const handleClose = () => {
        setIsOpen(false);
        setIsEditing(false);
        setSearchQuery('');
    };

    // Selection handler (instant & safe via onMouseDown)
    const handleSelect = (product) => {
        onChange(product.id);
        handleClose();
    };

    // Clear current selection
    const handleClear = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onChange('');
        setSearchQuery('');
        setIsEditing(true);
        setIsOpen(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    };

    // Reposition on scroll/resize
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();
        const handleScrollOrResize = () => {
            updatePosition();
        };

        window.addEventListener('resize', handleScrollOrResize);
        window.addEventListener('scroll', handleScrollOrResize, true);

        return () => {
            window.removeEventListener('resize', handleScrollOrResize);
            window.removeEventListener('scroll', handleScrollOrResize, true);
        };
    }, [isOpen]);

    // Click outside dismissal
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-combobox-item]');
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredProducts.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredProducts[highlightedIndex]) {
                    handleSelect(filteredProducts[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                handleClose();
                break;
            default:
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full text-xs">
            {/* Unified In-Place Trigger Input Container */}
            <div
                onClick={handleOpen}
                className={`w-full min-h-[34px] px-2.5 py-1 flex items-center justify-between gap-1.5 rounded-md border bg-white transition-all shadow-2xs ${
                    isOpen
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : error
                        ? 'border-danger-400 hover:border-danger-500'
                        : 'border-neutral-300 hover:border-neutral-400'
                } ${disabled ? 'opacity-60 bg-neutral-100 cursor-not-allowed' : 'cursor-text'}`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Search className={`w-3.5 h-3.5 shrink-0 ${isOpen ? 'text-brand-600' : 'text-neutral-400'}`} />

                    {isEditing || !selectedProduct ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setHighlightedIndex(0);
                                if (!isOpen) {
                                    updatePosition();
                                    setIsOpen(true);
                                }
                            }}
                            onFocus={() => {
                                if (!isOpen) handleOpen();
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            placeholder={selectedProduct ? selectedProduct.name : placeholder}
                            className="w-full bg-transparent text-xs text-neutral-900 placeholder-neutral-400 border-none outline-none focus:ring-0 p-0 font-medium h-6"
                        />
                    ) : (
                        <div className="flex items-center gap-1.5 truncate">
                            {/* Highlighted Amber SKU / Product Code Badge */}
                            {selectedProduct.code && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-amber-100 text-amber-900 border border-amber-300/90 shadow-2xs shrink-0">
                                    {selectedProduct.code}
                                </span>
                            )}
                            <span className="font-semibold text-neutral-900 text-xs truncate">
                                {selectedProduct.name}
                            </span>
                            {selectedProduct.part_no && (
                                <span className="text-[10.5px] text-neutral-500 font-mono shrink-0">
                                    ({selectedProduct.part_no})
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {selectedProduct && !disabled && (
                        <button
                            type="button"
                            onMouseDown={handleClear}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
                            title="Clear selection"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${
                            isOpen ? 'rotate-180 text-brand-600' : ''
                        }`}
                    />
                </div>
            </div>

            {/* Portaled Floating Dropdown Results (No redundant search input inside!) */}
            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: 'fixed',
                            top: dropdownCoords.openUpward ? undefined : `${dropdownCoords.top}px`,
                            bottom: dropdownCoords.openUpward
                                ? `${window.innerHeight - dropdownCoords.top}px`
                                : undefined,
                            left: `${dropdownCoords.left}px`,
                            width: `${dropdownCoords.width}px`,
                            zIndex: 9999,
                        }}
                        className="bg-white rounded-lg border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
                    >
                        {/* Compact Status Header */}
                        <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-[10.5px] font-semibold text-neutral-500 uppercase tracking-wider">
                            <span>Available Catalog</span>
                            <span className="font-mono text-brand-700">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                            </span>
                        </div>

                        {/* Filtered Product Rows List */}
                        <div
                            ref={listRef}
                            className="max-h-56 overflow-y-auto divide-y divide-neutral-100 scrollbar-thin scrollbar-thumb-neutral-200"
                        >
                            {filteredProducts.length === 0 ? (
                                <div className="p-5 text-center text-neutral-500 space-y-1">
                                    <Package className="w-5 h-5 mx-auto text-neutral-300" />
                                    <p className="text-xs font-semibold text-neutral-700">No matching products</p>
                                    <p className="text-[10.5px] text-neutral-400">
                                        No product found matching "{searchQuery}"
                                    </p>
                                </div>
                            ) : (
                                filteredProducts.map((p, idx) => {
                                    const isSelected = String(p.id) === String(value);
                                    const isHighlighted = idx === highlightedIndex;

                                    return (
                                        <div
                                            key={p.id}
                                            data-combobox-item
                                            onMouseEnter={() => setHighlightedIndex(idx)}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSelect(p);
                                            }}
                                            className={`px-3 py-2 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? 'bg-amber-50/80 text-brand-900'
                                                    : isHighlighted
                                                    ? 'bg-neutral-50 text-neutral-900'
                                                    : 'text-neutral-800 hover:bg-neutral-50/70'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                {/* Code Badge + Product Name */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {p.code && (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded font-mono font-bold text-[10.5px] bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs shrink-0">
                                                            {p.code}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-xs text-neutral-900 truncate">
                                                        {p.name}
                                                    </span>
                                                </div>

                                                {/* Part No & Consumption */}
                                                <div className="flex items-center gap-2.5 text-[10.5px] text-neutral-500">
                                                    {p.part_no && (
                                                        <span className="font-mono text-neutral-600">
                                                            Part: <strong className="text-neutral-800">{p.part_no}</strong>
                                                        </span>
                                                    )}
                                                    <span className="text-brand-700 font-semibold font-mono">
                                                        {p.leather_sqft != null
                                                            ? `${Number(p.leather_sqft).toFixed(2)} sq. ft / pc`
                                                            : '0.00 sq. ft / pc'}
                                                    </span>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="shrink-0 text-brand-600 bg-brand-50 p-1 rounded-full">
                                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>,
                    document.body
                )}

            {error && <p className="text-[11px] text-danger-600 mt-1 font-medium">{error}</p>}
        </div>
    );
}
