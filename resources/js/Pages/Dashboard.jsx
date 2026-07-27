import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Package, Layers, Users, ClipboardList, AlertTriangle, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard({ stats, low_stock_materials = [], recent_assignments = [] }) {
    const kpiCards = [
        {
            title: 'Active Products',
            value: stats.total_products,
            icon: Package,
            color: 'text-brand-500 bg-brand-50 border-brand-200',
            href: route('products.index'),
        },
        {
            title: 'Raw Materials',
            value: stats.total_materials,
            icon: Layers,
            color: 'text-info-500 bg-info-50 border-info-200',
            href: route('materials.index'),
        },
        {
            title: 'Artisans / Labour',
            value: stats.total_labour,
            icon: Users,
            color: 'text-success-500 bg-success-50 border-success-200',
            href: route('labour.index'),
        },
        {
            title: 'Active Work Orders',
            value: stats.active_assignments,
            icon: ClipboardList,
            color: 'text-warning-500 bg-warning-50 border-warning-200',
            href: route('assignments.index'),
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard - Leather CRM" />

            <PageHeader
                title="Manufacturing Dashboard"
                description="Overview of production, material inventory stock, and active work orders"
                action={
                    <Link href={route('assignments.create')}>
                        <Button variant="primary" size="md">
                            <Plus className="w-4 h-4 mr-1.5" /> Assign Work Order
                        </Button>
                    </Link>
                }
            />

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpiCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link key={card.title} href={card.href}>
                            <Card className="hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                            {card.title}
                                        </p>
                                        <p className="text-2xl font-bold text-neutral-900 mt-1">{card.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${card.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Low Stock Alert Section & Recent Work Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Low Stock Materials Alert (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-warning-500" />
                                <h3 className="text-md font-bold text-neutral-900">
                                    Stock Reorder Alerts ({stats.low_stock_count})
                                </h3>
                            </div>
                            <Link href={route('materials.index')}>
                                <Button variant="link" size="sm">
                                    View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        {low_stock_materials.length === 0 ? (
                            <p className="text-sm text-neutral-500 py-4 text-center bg-neutral-50 rounded border border-neutral-200">
                                All raw material inventory levels are healthy above reorder thresholds.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-200">
                                        <tr>
                                            <th className="px-3 py-2">Material Name</th>
                                            <th className="px-3 py-2">Category</th>
                                            <th className="px-3 py-2">Stock On Hand</th>
                                            <th className="px-3 py-2">Reorder Level</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {low_stock_materials.map((inv) => (
                                            <tr key={inv.material_id} className="hover:bg-neutral-50">
                                                <td className="px-3 py-2.5 font-medium text-neutral-900">
                                                    {inv.material.name}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <Badge variant="neutral">{inv.material.category}</Badge>
                                                </td>
                                                <td className="px-3 py-2.5 font-bold text-danger-700">
                                                    {inv.quantity_on_hand} {inv.unit}
                                                </td>
                                                <td className="px-3 py-2.5 text-neutral-500">
                                                    {inv.material.reorder_level} {inv.unit}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Recent Work Orders Feed (1 col) */}
                <div className="space-y-4">
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-md font-bold text-neutral-900">Recent Assignments</h3>
                            <Link href={route('assignments.index')}>
                                <Button variant="link" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </div>

                        {recent_assignments.length === 0 ? (
                            <p className="text-sm text-neutral-500 py-4 text-center bg-neutral-50 rounded border border-neutral-200">
                                No work orders created yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recent_assignments.map((wo) => (
                                    <Link
                                        key={wo.id}
                                        href={route('assignments.show', wo.id)}
                                        className="block p-3 rounded border border-neutral-200 hover:border-brand-400 hover:bg-brand-50/30 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs text-brand-700">{wo.assignment_no}</span>
                                            <Badge variant="brand">{wo.status}</Badge>
                                        </div>
                                        <p className="text-xs font-semibold text-neutral-800 truncate">
                                            {wo.product?.name} ({wo.quantity} pcs)
                                        </p>
                                        <p className="text-[11px] text-neutral-500 mt-0.5">
                                            Artisan: {wo.labour?.name}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
