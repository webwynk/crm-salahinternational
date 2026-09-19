import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import StatusPill from '@/Components/ui/StatusPill';
import Button from '@/Components/ui/Button';
import { Edit3, ArrowLeft, Layers, Image as ImageIcon, Palette } from 'lucide-react';

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
                description={`Product Code: ${product.code} • Category: ${product.category || 'General'}`}
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
                {/* General Info Card with Product Image */}
                <Card>
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-32 h-32 rounded-lg object-cover border border-neutral-200 shrink-0 bg-neutral-0 shadow-xs"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-lg bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center shrink-0 text-neutral-400">
                                <ImageIcon className="w-8 h-8 mb-1" strokeWidth={1.5} />
                                <span className="text-[11px]">No Photo</span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                                <span className="font-sans font-bold text-xs text-brand-700 bg-brand-50 px-3 py-1 rounded border border-brand-200">
                                    {product.code}
                                </span>
                                {product.part_no && (
                                    <span className="font-sans font-semibold text-xs text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                                        Part No: <strong>{product.part_no}</strong>
                                    </span>
                                )}
                                {product.category && (
                                    <span className="text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                                        {product.category}
                                    </span>
                                )}
                                {product.leather_sqft && (
                                    <span className="font-sans font-semibold text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                                        Leather: <strong>{Number(product.leather_sqft).toFixed(2)} sq ft</strong>
                                    </span>
                                )}
                                <StatusPill status={product.is_active ? 'ACTIVE' : 'INACTIVE'} />
                                {hasColors && (
                                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                                        {product.colors.length} {product.colors.length === 1 ? 'Colorway' : 'Colorways'}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">{product.name}</h2>
                            {product.description && (
                                <p className="text-xs text-neutral-600 mt-2 leading-relaxed max-w-2xl">
                                    {product.description}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Colorway Switcher (if multi-color) */}
                {hasColors && (
                    <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-brand-600" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                                    Colorway Variations
                                </h4>
                            </div>
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
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
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30'
                                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-brand-500'}`} />
                                        <span>{c.color_name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                                            {c.materials?.length || 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Unified Bill of Materials (BOM) & Components */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-brand-700" /> Bill of Materials (BOM) & Components
                            {hasColors && activeColor && (
                                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 ml-1">
                                    {activeColor.color_name}
                                </span>
                            )}
                        </span>
                        <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                            {currentMaterials.length} {currentMaterials.length === 1 ? 'Component' : 'Components'}
                        </span>
                    </h3>

                    {currentMaterials.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-3">No components or materials assigned to this BOM.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase border-b border-neutral-200">
                                    <tr>
                                        <th className="px-3 py-2">Component / Part</th>
                                        <th className="px-3 py-2">Material Master</th>
                                        <th className="px-3 py-2">Variation / Tone</th>
                                        <th className="px-3 py-2">Type</th>
                                        <th className="px-3 py-2 text-right">Required Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {currentMaterials.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/60">
                                            <td className="px-3 py-3 font-semibold text-neutral-900">{item.label}</td>
                                            <td className="px-3 py-3 font-medium text-neutral-700">
                                                {item.material ? item.material.name : '—'}
                                            </td>
                                            <td className="px-3 py-3 text-neutral-600">
                                                {item.variant ? item.variant.name : '—'}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                                    item.material_type === 'LEATHER'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : item.material_type === 'HARDWARE'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-neutral-100 text-neutral-700'
                                                }`}>
                                                    {item.material_type || 'CONSUMABLE'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 font-bold text-neutral-900 text-right tabular-nums">
                                                {item.quantity_min} {item.unit || 'pcs'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
