import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import StatusPill from '@/Components/ui/StatusPill';
import Button from '@/Components/ui/Button';
import { Edit3, ArrowLeft, Layers, Image as ImageIcon } from 'lucide-react';

export default function Show({ product }) {
    const leatherItems = product.materials?.filter((m) => m.material_type === 'LEATHER' || m.material?.is_leather) || [];
    const hardwareItems = product.materials?.filter((m) => m.material_type !== 'LEATHER' && !m.material?.is_leather && m.material_type !== 'PROCESS_NOTE') || [];
    const processNotes = product.materials?.filter((m) => m.material_type === 'PROCESS_NOTE') || [];

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
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-sans font-bold text-xs text-brand-700 bg-brand-50 px-3 py-1 rounded border border-brand-200">
                                    {product.code}
                                </span>
                                <StatusPill status={product.is_active ? 'ACTIVE' : 'INACTIVE'} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">{product.name}</h2>
                            <p className="text-sm text-neutral-600 mt-2">{product.description || 'No craft notes provided.'}</p>
                        </div>
                    </div>
                </Card>

                {/* 1. Dedicated Leather Cutting Specifications Table */}
                <Card className="border-brand-200/90 shadow-2xs">
                    <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-brand-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-brand-700" /> Leather Cutting Specifications (Per Single Unit)
                        </span>
                        <span className="text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                            Leather Hides BOM
                        </span>
                    </h3>
                    {leatherItems.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-3">No specific leather items assigned to this BOM.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-brand-50/40 text-xs font-semibold text-brand-900 uppercase border-b border-brand-200">
                                    <tr>
                                        <th className="px-3 py-2">Leather Component / Cut</th>
                                        <th className="px-3 py-2">Leather Hide & Tannage</th>
                                        <th className="px-3 py-2">Color Variation</th>
                                        <th className="px-3 py-2">Cutting Qty (Sq. Ft)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {leatherItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-brand-50/20">
                                            <td className="px-3 py-3 font-semibold text-neutral-900">{item.label}</td>
                                            <td className="px-3 py-3 font-medium text-neutral-700">
                                                {item.material ? item.material.name : 'Leather Hide'}
                                            </td>
                                            <td className="px-3 py-3 text-neutral-600">
                                                {item.variant ? item.variant.name : 'Standard'}
                                            </td>
                                            <td className="px-3 py-3 font-bold text-brand-800 tabular-nums">
                                                {item.quantity_min} {item.unit || 'sq_ft'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* 2. Hardware & Consumables Table */}
                <Card className="border-neutral-200 shadow-2xs">
                    <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-neutral-700" /> Hardware, Lining & Consumables
                    </h3>
                    {hardwareItems.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-3">No additional hardware fittings required.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-200">
                                    <tr>
                                        <th className="px-3 py-2">Fitting / Component</th>
                                        <th className="px-3 py-2">Material Master</th>
                                        <th className="px-3 py-2">Required Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {hardwareItems.map((h) => (
                                        <tr key={h.id} className="hover:bg-neutral-50">
                                            <td className="px-3 py-3 font-semibold text-neutral-900">{h.label}</td>
                                            <td className="px-3 py-3 text-neutral-700">
                                                {h.material ? h.material.name : 'Hardware'}
                                            </td>
                                            <td className="px-3 py-3 font-bold text-neutral-900 tabular-nums">
                                                {h.quantity_min} {h.unit}
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
