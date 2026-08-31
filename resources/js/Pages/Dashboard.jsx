import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import {
    Package,
    Layers,
    Users,
    ClipboardList,
    AlertTriangle,
    Plus,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Clock,
    FileText,
    Eye,
    Activity,
    Boxes,
    ArrowDownLeft,
    ArrowUpRight,
    RotateCcw,
} from 'lucide-react';

export default function Dashboard({
    stats,
    low_stock_materials = [],
    recent_assignments = [],
    recent_transactions = [],
}) {
    const { auth } = usePage().props;

    const kpiCards = [
        {
            title: 'Active Products',
            value: stats.total_products,
            unit: 'Models',
            icon: Package,
            accentBg: 'bg-brand-500/10 text-brand-700 border-brand-200/80',
            href: route('products.index'),
        },
        {
            title: 'Raw Materials & Stock',
            value: stats.total_materials,
            unit: 'Materials',
            icon: Layers,
            accentBg: 'bg-amber-500/10 text-amber-800 border-amber-200/80',
            href: route('materials.index'),
        },
        {
            title: 'Artisans on Floor',
            value: stats.total_labour,
            unit: 'Workers',
            icon: Users,
            accentBg: 'bg-emerald-500/10 text-emerald-800 border-emerald-200/80',
            href: route('labour.index'),
        },
        {
            title: 'Active in Production',
            value: stats.active_assignments,
            unit: 'Work Orders',
            icon: ClipboardList,
            accentBg: 'bg-sky-500/10 text-sky-800 border-sky-200/80',
            href: route('assignments.index'),
        },
    ];

    const quickActions = [
        { label: '+ New Work Order', href: route('assignments.create'), primary: true },
        { label: '+ Add Raw Material', href: route('materials.index') },
        { label: '+ New Product BOM', href: route('products.create') },
        { label: '+ Register Artisan', href: route('labour.index') },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard - Leather CRM" />

            <div className="space-y-6">

                {/* 2. HERO KPI METRICS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <Link key={kpi.title} href={kpi.href} className="group focus:outline-none">
                                <Card className="h-full hover:border-brand-300 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 border-neutral-200/90">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-neutral-500 tracking-wide uppercase">
                                                {kpi.title}
                                            </p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-extrabold text-neutral-900 tracking-tight tabular-nums font-sans">
                                                    {kpi.value}
                                                </span>
                                                <span className="text-xs font-medium text-neutral-500">
                                                    {kpi.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-2.5 rounded-xl border ${kpi.accentBg} transition-transform group-hover:scale-105 shrink-0`}>
                                            <Icon className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* 3. QUICK ACTION SHORTCUTS BAR */}
                <div className="p-3 bg-neutral-0 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 px-2">
                        <Activity className="w-4 h-4 text-brand-600" />
                        <span>Quick Factory Actions:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {quickActions.map((action, idx) => (
                            <Link key={idx} href={action.href}>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer ${
                                        action.primary
                                            ? 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200 font-semibold'
                                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                                    }`}
                                >
                                    {action.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 4. MAIN OPERATIONAL COMMAND GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Stock Reorder Center & Recent Stock Ledger (7 Cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* A. STOCK REORDER ALERTS */}
                        <Card className="border-neutral-200/90 shadow-2xs">
                            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-2 rounded-lg ${stats.low_stock_count > 0 ? 'bg-danger-50 text-danger-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {stats.low_stock_count > 0 ? (
                                            <AlertTriangle className="w-4 h-4" />
                                        ) : (
                                            <ShieldCheck className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-900">
                                            Inventory Reorder Alerts
                                        </h3>
                                        <p className="text-xs text-neutral-500">
                                            Materials near or below minimum threshold
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {stats.low_stock_count > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-danger-100 text-danger-800 border border-danger-200">
                                            {stats.low_stock_count} Low
                                        </span>
                                    )}
                                    <Link href={route('materials.index')}>
                                        <Button variant="ghost" size="sm" className="text-xs text-brand-700 hover:text-brand-800">
                                            Manage <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {low_stock_materials.length === 0 ? (
                                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50/60 to-neutral-50 border border-emerald-100 text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-2xs">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                                        All Raw Materials Healthy
                                    </h4>
                                    <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                                        100% of warehouse inventory balances are currently above safe reorder thresholds.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {low_stock_materials.map((inv) => {
                                        const reorder = parseFloat(inv.material?.reorder_level || 0);
                                        const current = parseFloat(inv.quantity_on_hand || 0);
                                        const ratio = reorder > 0 ? Math.min(100, Math.round((current / reorder) * 100)) : 0;
                                        const isCritical = current <= 0 || current < reorder * 0.5;

                                        return (
                                            <div
                                                key={inv.id}
                                                className="p-3 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-50 transition-colors space-y-2"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs text-neutral-900 truncate">
                                                                {inv.material?.name}
                                                            </span>
                                                            {inv.variant && inv.variant.name !== 'Standard' && (
                                                                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-neutral-200/80 text-neutral-700 rounded">
                                                                    {inv.variant.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-neutral-500">
                                                            Category: <strong className="text-neutral-700">{inv.material?.category}</strong>
                                                        </span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className={`text-xs font-bold tabular-nums block ${isCritical ? 'text-danger-700' : 'text-warning-700'}`}>
                                                            {current} / {reorder} {inv.unit}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                                            isCritical 
                                                                ? 'bg-danger-50 text-danger-700 border-danger-200' 
                                                                : 'bg-warning-50 text-warning-800 border-warning-200'
                                                        }`}>
                                                            {isCritical ? 'Critical' : 'Reorder Needed'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mini Progress Bar */}
                                                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${isCritical ? 'bg-danger-600' : 'bg-warning-500'}`}
                                                        style={{ width: `${ratio}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* B. RECENT STOCK LEDGER MOVEMENTS */}
                        <Card className="border-neutral-200/90 shadow-2xs">
                            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-brand-50 text-brand-700">
                                        <Boxes className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-900">
                                            Recent Stock Ledger Activity
                                        </h3>
                                        <p className="text-xs text-neutral-500">
                                            Audit trail of material restocks & production deductions
                                        </p>
                                    </div>
                                </div>
                                <Link href={route('materials.index')}>
                                    <Button variant="ghost" size="sm" className="text-xs text-brand-700 hover:text-brand-800">
                                        All Materials <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>

                            {recent_transactions.length === 0 ? (
                                <p className="text-xs text-neutral-500 py-6 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                                    No stock movements recorded yet.
                                </p>
                            ) : (
                                <div className="divide-y divide-neutral-100">
                                    {recent_transactions.map((tx) => {
                                        const isNegative = parseFloat(tx.change_qty) < 0;
                                        const isRestock = tx.type === 'RESTOCK';

                                        return (
                                            <div key={tx.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                                        isRestock 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : 'bg-brand-50 text-brand-700 border-brand-200'
                                                    }`}>
                                                        {isRestock ? (
                                                            <ArrowDownLeft className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-neutral-900 truncate">
                                                            {tx.material?.name}
                                                            {tx.variant && tx.variant.name !== 'Standard' ? ` (${tx.variant.name})` : ''}
                                                        </p>
                                                        <p className="text-[11px] text-neutral-500 truncate">
                                                            {tx.note || tx.type.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className={`text-xs font-bold tabular-nums font-sans ${isNegative ? 'text-brand-700' : 'text-emerald-700'}`}>
                                                        {isNegative ? '' : '+'}{tx.change_qty}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400 block tabular-nums">
                                                        Bal: {tx.balance_after}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Live Work Orders Activity Stream (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-neutral-200/90 shadow-2xs">
                            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Live Work Orders Stream
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Active batches & workbench production
                                    </p>
                                </div>
                                <Link href={route('assignments.index')}>
                                    <Button variant="ghost" size="sm" className="text-xs text-brand-700 hover:text-brand-800">
                                        View All ({stats.active_assignments}) <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>

                            {recent_assignments.length === 0 ? (
                                <div className="text-center py-8 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                                    <ClipboardList className="w-8 h-8 text-neutral-400 mx-auto" />
                                    <p className="text-xs text-neutral-600">No work orders issued yet.</p>
                                    <Link href={route('assignments.create')}>
                                        <Button variant="primary" size="sm">
                                            + Assign Work Order
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recent_assignments.map((wo) => {
                                        const statusBadge = {
                                            ASSIGNED: 'brand',
                                            COMPLETED: 'success',
                                            CANCELLED: 'danger',
                                        }[wo.status] || 'neutral';

                                        const initials = wo.labour?.name
                                            ? wo.labour.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                                            : 'AR';

                                        return (
                                            <div
                                                key={wo.id}
                                                className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all space-y-2.5"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-sans">
                                                        {wo.assignment_no}
                                                    </span>
                                                    <Badge variant={statusBadge}>{wo.status}</Badge>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                                                        {wo.product?.name}
                                                    </h4>
                                                    <span className="text-[11px] text-neutral-500">
                                                        Target Batch: <strong className="text-neutral-800 font-sans font-bold">{wo.quantity} Pcs</strong>
                                                    </span>
                                                </div>

                                                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                                                            {initials}
                                                        </div>
                                                        <span className="text-neutral-600 truncate font-medium">
                                                            {wo.labour?.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Link href={route('assignments.show', wo.id)}>
                                                            <button
                                                                className="p-1 text-neutral-400 hover:text-brand-700 hover:bg-neutral-100 rounded transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        </Link>
                                                        <a href={route('assignments.pdf', wo.id)} target="_blank" rel="noreferrer">
                                                            <button
                                                                className="p-1 text-neutral-400 hover:text-brand-700 hover:bg-neutral-100 rounded transition-colors"
                                                                title="Download PDF Work Order"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </button>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
