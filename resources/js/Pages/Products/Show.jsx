import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import StatusPill from '@/Components/ui/StatusPill';
import Button from '@/Components/ui/Button';
import { Edit3, ArrowLeft, Layers, Image as ImageIcon, Palette, Package } from 'lucide-react';

export default function Show({ product }) {
    const hasColors = Boolean(product.has_colors && product.colors?.length > 0);
    const [activeColorIndex, setActiveColorIndex] = useState(0);

    const activeColor = hasColors ? product.colors[activeColorIndex] : null;
    const currentMaterials = hasColors
        ? (activeColor?.materials || [])
        : (product.materials || []);

    return (
        <AppLayout>
            <Head title={`${product.name} Specs — Leather CRM`} />

            <PageHeader
                title={product.name}
                description={
                    <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-500 font-medium mt-1">
                        <span>Product Code: <strong className="text-neutral-900 font-mono">{product.code}</strong></span>
                        {product.part_no && (
                            <>
                                <span>•</span>
                                <span>Part No: <strong className="text-neutral-900 font-mono">{product.part_no}</strong></span>
                            </>
                        )}
                        {product.category && (
                            <>
                                <span>•</span>
                                <span>Category: <strong className="text-neutral-900">{product.category}</strong></span>
                            </>
                        )}
                    </div>
                }
                action={
                    <div className="flex items-center gap-2">
                        <Link href={route('products.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
                            </Button>
                        </Link>
                        <Link href={route('products.edit', product.id)}>
                            <Button variant="primary" size="sm">
                                <Edit3 className="w-4 h-4 mr-1.5" /> Edit Product
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="space-y-6 w-full">
                {/* Executive Product Dossier Card */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* High-Definition Product Showcase */}
                        <div className="shrink-0">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border border-neutral-200/90 bg-neutral-0 shadow-xs"
                                />
                            ) : (
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-neutral-50 border border-neutral-200/90 flex flex-col items-center justify-center text-neutral-400">
                                    <ImageIcon className="w-10 h-10 mb-1.5 stroke-[1.25] text-neutral-400" />
                                    <span className="text-[11px] font-medium text-neutral-400">No Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Manufacturing Specifications Grid */}
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusPill status={product.is_active ? 'ACTIVE' : 'INACTIVE'} />
                                    {hasColors && (
                                        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                                            {product.colors.length} {product.colors.length === 1 ? 'Colorway' : 'Colorways'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Technical Attribute Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Product SKU</span>
                                    <p className="text-sm font-bold font-mono text-neutral-900 mt-0.5 truncate">{product.code}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Part Number</span>
                                    <p className="text-sm font-bold font-mono text-neutral-900 mt-0.5 truncate">{product.part_no || '—'}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Category</span>
                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5 truncate">{product.category || 'General'}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Leather / Unit</span>
                                    <p className="text-sm font-bold font-mono text-amber-900 mt-0.5 truncate">
                                        {product.leather_sqft ? `${Number(product.leather_sqft).toFixed(2)} sq ft` : '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Description / Notes */}
                            {product.description && (
                                <div className="mt-4 pt-3.5 border-t border-neutral-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Specification Notes</span>
                                    <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed max-w-3xl">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Unified Bill of Materials (BOM) & Components */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="space-y-4">
                        {/* Header & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-brand-700" />
                                <h3 className="text-md font-bold text-neutral-900">
                                    Bill of Materials (BOM) & Components
                                </h3>
                                {hasColors && activeColor && (
                                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                        {activeColor.color_name}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 self-start sm:self-auto">
                                {currentMaterials.length} {currentMaterials.length === 1 ? 'Component' : 'Components'}
                            </span>
                        </div>

                        {/* Integrated Colorway Segmented Control (if multi-color) */}
                        {hasColors && (
                            <div className="rounded-xl border border-brand-200/80 bg-brand-50/20 p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Palette className="w-4 h-4 text-brand-600" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                                            Colorway Variations
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                        Viewing: <strong>{activeColor?.color_name}</strong>
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {product.colors.map((c, idx) => {
                                        const isActive = idx === activeColorIndex;
                                        return (
                                            <button
                                                key={c.id || idx}
                                                type="button"
                                                onClick={() => setActiveColorIndex(idx)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-500/25'
                                                        : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-2xs'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-brand-500'}`} />
                                                <span>{c.color_name}</span>
                                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                                }`}>
                                                    {c.materials?.length || 0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Table Content */}
                        {currentMaterials.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                                    <Package className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <h4 className="text-sm font-semibold text-neutral-800 mb-1">No BOM Components Configured</h4>
                                <p className="text-xs text-neutral-500 max-w-sm mb-4">
                                    This product variation does not have any bill of materials components or materials assigned yet.
                                </p>
                                <Link href={route('products.edit', product.id)}>
                                    <Button variant="outline" size="sm">
                                        <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Configure BOM
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase border-b border-neutral-200">
                                        <tr>
                                            <th className="px-4 py-2.5 w-12 text-center">#</th>
                                            <th className="px-4 py-2.5">Component / Part</th>
                                            <th className="px-4 py-2.5">Material Master & Variant</th>
                                            <th className="px-4 py-2.5 text-right">Required Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 bg-white">
                                        {currentMaterials.map((item, idx) => (
                                            <tr key={item.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-4 py-3 text-center text-xs font-mono text-neutral-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-neutral-900">
                                                    {item.label}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-700">
                                                    <span className="font-medium">
                                                        {item.material ? item.material.name : '—'}
                                                    </span>
                                                    {item.variant && (
                                                        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                            {item.variant.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-neutral-900 font-mono text-sm tabular-nums">
                                                        {item.quantity_min}
                                                    </span>
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 ml-1.5">
                                                        {item.unit || 'pcs'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-neutral-50/70 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2.5 text-neutral-500">
                                                Total Components in this BOM: <strong className="text-neutral-900 font-mono">{currentMaterials.length}</strong>
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-[11px] text-neutral-400 font-normal">
                                                Per single product unit
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
