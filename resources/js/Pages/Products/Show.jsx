import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import StatusPill from '@/Components/ui/StatusPill';
import Button from '@/Components/ui/Button';
import { Edit3, ArrowLeft, Layers, Image as ImageIcon } from 'lucide-react';

export default function Show({ product }) {
    const consumables = product.materials?.filter((m) => m.material_type === 'CONSUMABLE') || [];
    const hardware = product.materials?.filter((m) => m.material_type === 'HARDWARE') || [];
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
                                <ArrowLeft className="w-4 h-4" /> Back to Products
                            </Button>
                        </Link>
                        <Link href={route('products.edit', product.id)}>
                            <Button variant="primary" size="sm">
                                <Edit3 className="w-4 h-4" /> Edit Product
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
                                <span className="font-mono font-bold text-xs text-brand-700 bg-brand-50 px-3 py-1 rounded border border-brand-200">
                                    {product.code}
                                </span>
                                <StatusPill status={product.is_active ? 'ACTIVE' : 'INACTIVE'} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">{product.name}</h2>
                            <p className="text-sm text-neutral-600 mt-2">{product.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </Card>

                {/* Consumable Raw Materials Table */}
                <Card>
                    <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-brand-600" /> Consumable Raw Materials (Auto-Deducted on Work Order)
                    </h3>
                    {consumables.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-3">No consumable raw materials assigned to this BOM.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-200">
                                    <tr>
                                        <th className="px-3 py-2">Component Label</th>
                                        <th className="px-3 py-2">Material Master</th>
                                        <th className="px-3 py-2">Deduction Qty (per pc)</th>
                                        <th className="px-3 py-2">Dimensions / Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {consumables.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50">
                                            <td className="px-3 py-3 font-semibold text-neutral-900">{item.label}</td>
                                            <td className="px-3 py-3 font-medium text-neutral-700">
                                                {item.material ? item.material.name : 'Custom Material'}
                                            </td>
                                            <td className="px-3 py-3 font-bold text-brand-700 tabular-nums">
                                                {item.quantity_max
                                                    ? `${item.quantity_min} – ${item.quantity_max} ${item.unit}`
                                                    : `${item.quantity_min} ${item.unit}`}
                                            </td>
                                            <td className="px-3 py-3 text-neutral-500">{item.dimension_note || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Hardware & Process Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
                            Hardware Fittings
                        </h3>
                        {hardware.length === 0 ? (
                            <p className="text-sm text-neutral-500">No hardware fittings required.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {hardware.map((h) => (
                                    <li key={h.id} className="p-2.5 rounded border border-neutral-200 bg-neutral-50">
                                        <strong className="text-neutral-900 block">{h.label}</strong>
                                        <span className="text-xs text-neutral-600 block tabular-nums">
                                            Qty: {h.quantity_min} {h.unit} {h.dimension_note ? `(${h.dimension_note})` : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
                            Process & Stitching Specifications
                        </h3>
                        {processNotes.length === 0 ? (
                            <p className="text-sm text-neutral-500">No special process notes.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {processNotes.map((n) => (
                                    <li key={n.id} className="p-2.5 rounded border border-neutral-200 bg-neutral-50">
                                        <strong className="text-neutral-900 block">{n.label}</strong>
                                        {n.dimension_note && (
                                            <span className="text-xs text-neutral-600 block mt-0.5">{n.dimension_note}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
