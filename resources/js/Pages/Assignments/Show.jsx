import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import StatusPill from '@/Components/ui/StatusPill';
import Button from '@/Components/ui/Button';
import {
    FileText,
    ArrowLeft,
    Layers,
    Scissors,
    User,
    Phone,
    Calendar,
    Clock,
    DollarSign,
    Image as ImageIcon,
    Package,
    Palette,
    Tag,
} from 'lucide-react';

export default function Show({ assignment }) {
    const isLeatherItem = (m) => {
        const isLeatherFlag = Boolean(m.material && m.material.is_leather);
        const isLeatherUnit = ['sq_ft', 'sq_dm', 'sq_m', 'hides'].includes((m.unit || '').toLowerCase());
        const isLeatherType = (m.material_type || '').toUpperCase() === 'LEATHER';
        return isLeatherFlag || isLeatherUnit || isLeatherType;
    };

    const leatherMaterials = assignment.materials?.filter(isLeatherItem) || [];
    const otherMaterials = assignment.materials?.filter((m) => !isLeatherItem(m)) || [];

    const totalLeatherSqft = leatherMaterials.reduce(
        (sum, m) => sum + Math.abs(parseFloat(m.quantity_used) || 0),
        0
    );

    const totalLaborCost = assignment.rate && assignment.quantity
        ? (parseFloat(assignment.rate) * parseInt(assignment.quantity, 10)).toFixed(2)
        : null;

    return (
        <AppLayout>
            <Head title={`Work Order ${assignment.assignment_no} — Leather CRM`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3 flex-wrap">
                        <span>Work Order <span className="font-mono text-brand-700">{assignment.assignment_no}</span></span>
                    </div>
                }
                description={
                    <div className="flex items-center gap-2.5 flex-wrap text-xs text-neutral-500 font-medium mt-1">
                        <StatusPill status={assignment.status} />
                        <span>•</span>
                        <span>Target: <strong className="text-neutral-900 font-mono font-bold">{assignment.quantity} Pcs</strong></span>
                        {assignment.color && (
                            <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-semibold">
                                    <Palette className="w-3 h-3" /> {assignment.color.color_name}
                                </span>
                            </>
                        )}
                        <span>•</span>
                        <span>Assigned: <strong className="text-neutral-700">{new Date(assignment.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                    </div>
                }
                action={
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href={route('assignments.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Assignments
                            </Button>
                        </Link>
                        <a
                            href={route('assignments.pdf', { assignment: assignment.id, type: 'exporter' })}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-1.5 text-neutral-600" /> Exporter Copy PDF
                            </Button>
                        </a>
                        <a
                            href={route('assignments.pdf', { assignment: assignment.id, type: 'fabricator' })}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-900 bg-amber-50/60 hover:bg-amber-100/70">
                                <FileText className="w-4 h-4 mr-1.5 text-amber-700" /> Fabricator Copy PDF
                            </Button>
                        </a>
                    </div>
                }
            />

            <div className="space-y-6 w-full">
                {/* Executive Work Order Dossier Hero Card */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* High-Definition Product Showcase */}
                        <div className="shrink-0">
                            {assignment.product?.image_url ? (
                                <Link
                                    href={route('products.show', assignment.product.id)}
                                    className="block group"
                                    title="View Product Specifications"
                                >
                                    <img
                                        src={assignment.product.image_url}
                                        alt={assignment.product.name}
                                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border border-neutral-200/90 bg-neutral-0 shadow-xs group-hover:border-brand-400 group-hover:shadow-sm transition-all"
                                    />
                                </Link>
                            ) : (
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-neutral-50 border border-neutral-200/90 flex flex-col items-center justify-center text-neutral-400">
                                    <ImageIcon className="w-10 h-10 mb-1.5 stroke-[1.25] text-neutral-400" />
                                    <span className="text-[11px] font-medium text-neutral-400">No Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Manufacturing Specifications Grid */}
                        <div className="flex-1 min-w-0 w-full">
                            {/* Product Title & Badges */}
                            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                        href={route('products.show', assignment.product.id)}
                                        className="text-base sm:text-lg font-bold text-neutral-900 hover:text-brand-700 transition-colors"
                                    >
                                        {assignment.product?.name}
                                    </Link>
                                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                                        {assignment.product?.code}
                                    </span>
                                    {assignment.product?.part_no && (
                                        <span className="font-mono text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                                            Part No: <strong>{assignment.product.part_no}</strong>
                                        </span>
                                    )}
                                    {assignment.color && (
                                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                            <Palette className="w-3 h-3 text-amber-700" /> {assignment.color.color_name}
                                        </span>
                                    )}
                                </div>
                                <StatusPill status={assignment.status} />
                            </div>

                            {/* Technical Attribute Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Work Order No</span>
                                    <p className="text-sm font-bold font-mono text-neutral-900 mt-0.5 truncate">{assignment.assignment_no}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-brand-50/40 border border-brand-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800">Target Quantity</span>
                                    <p className="text-sm font-bold font-mono text-brand-900 mt-0.5 truncate">{assignment.quantity} Pcs</p>
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Artisan Worker</span>
                                    <p className="text-sm font-bold text-neutral-900 mt-0.5 truncate">{assignment.labour?.name || 'Unassigned'}</p>
                                    {assignment.labour?.phone && (
                                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{assignment.labour.phone}</p>
                                    )}
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Assigned By</span>
                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5 truncate">{assignment.assigner?.name || 'System Admin'}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Piece Rate</span>
                                    <p className="text-sm font-bold font-mono text-neutral-900 mt-0.5 truncate">
                                        {assignment.rate ? `₹${parseFloat(assignment.rate).toFixed(2)} / pc` : '—'}
                                    </p>
                                    {totalLaborCost && (
                                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Total: ₹{parseFloat(totalLaborCost).toLocaleString()}</p>
                                    )}
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Delivery Deadline</span>
                                    <p className="text-sm font-bold font-mono text-neutral-900 mt-0.5 truncate">
                                        {assignment.delivery_date
                                            ? new Date(assignment.delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Assigned Date</span>
                                    <p className="text-xs font-semibold font-mono text-neutral-800 mt-1 truncate">
                                        {new Date(assignment.created_at).toLocaleString('en-GB')}
                                    </p>
                                </div>

                                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Category</span>
                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5 truncate">{assignment.product?.category || 'General'}</p>
                                </div>
                            </div>

                            {/* Production Notes / Instructions */}
                            {assignment.notes && (
                                <div className="mt-4 pt-3.5 border-t border-neutral-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Supervisor Notes / Instructions</span>
                                    <p className="text-xs sm:text-sm text-neutral-700 mt-1 leading-relaxed max-w-3xl bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70">
                                        {assignment.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* 1. Issued Leather Hides Ledger (Sq. Ft Auto-Deducted) */}
                {leatherMaterials.length > 0 && (
                    <Card className="border-brand-200/90 shadow-2xs">
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-200">
                                <div className="flex items-center gap-2">
                                    <Scissors className="w-5 h-5 text-brand-700" />
                                    <h3 className="text-md font-bold text-neutral-900">
                                        Issued Leather Hides Ledger (Sq. Ft Auto-Deducted)
                                    </h3>
                                </div>
                                <span className="text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 self-start sm:self-auto">
                                    Total Issued: <strong>{totalLeatherSqft.toFixed(2)} sq ft</strong>
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-brand-50/40 text-xs font-semibold text-brand-900 uppercase border-b border-brand-200">
                                        <tr>
                                            <th className="px-4 py-2.5 w-12 text-center">#</th>
                                            <th className="px-4 py-2.5">Leather Component / Part</th>
                                            <th className="px-4 py-2.5">Hide Tannage & Variant</th>
                                            <th className="px-4 py-2.5 text-right">Issued Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 bg-white">
                                        {leatherMaterials.map((mat, idx) => (
                                            <tr key={mat.id || idx} className="hover:bg-brand-50/20 transition-colors">
                                                <td className="px-4 py-3 text-center text-xs font-mono text-neutral-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-neutral-900">
                                                    {mat.label}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-700">
                                                    <span className="font-medium">
                                                        {mat.material?.name || 'Leather Hide'}
                                                    </span>
                                                    {mat.variant && (
                                                        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                            {mat.variant.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-brand-800 font-mono text-sm tabular-nums">
                                                        -{Math.abs(parseFloat(mat.quantity_used)).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 ml-1.5">
                                                        {mat.unit || 'sq_ft'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-brand-50/30 border-t border-brand-200 text-xs font-semibold text-brand-900">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2.5 text-neutral-600">
                                                Total Leather Cuts Issued: <strong className="text-neutral-900 font-mono">{leatherMaterials.length}</strong>
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-bold text-brand-900">
                                                -{totalLeatherSqft.toFixed(2)} sq ft
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </Card>
                )}

                {/* 2. Deducted Hardware & Consumables Ledger */}
                <Card className="border-neutral-200/90 shadow-2xs">
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-neutral-700" />
                                <h3 className="text-md font-bold text-neutral-900">
                                    Deducted Hardware & Consumables Ledger
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 self-start sm:self-auto">
                                {otherMaterials.length} {otherMaterials.length === 1 ? 'Component' : 'Components'}
                            </span>
                        </div>

                        {otherMaterials.length === 0 ? (
                            <div className="py-10 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                                    <Package className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <h4 className="text-sm font-semibold text-neutral-800 mb-1">No Hardware or Consumables Deducted</h4>
                                <p className="text-xs text-neutral-500 max-w-sm">
                                    This work order does not have any additional hardware fittings, lining, or consumables recorded.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase border-b border-neutral-200">
                                        <tr>
                                            <th className="px-4 py-2.5 w-12 text-center">#</th>
                                            <th className="px-4 py-2.5">Fitting / Component Description</th>
                                            <th className="px-4 py-2.5">Material Master & Variant</th>
                                            <th className="px-4 py-2.5 text-right">Deducted Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 bg-white">
                                        {otherMaterials.map((mat, idx) => (
                                            <tr key={mat.id || idx} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-4 py-3 text-center text-xs font-mono text-neutral-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-neutral-900">
                                                    {mat.label}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-700">
                                                    <span className="font-medium">
                                                        {mat.material ? mat.material.name : '—'}
                                                    </span>
                                                    {mat.variant && (
                                                        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                            {mat.variant.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-neutral-900 font-mono text-sm tabular-nums">
                                                        -{Math.abs(parseFloat(mat.quantity_used)).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 ml-1.5">
                                                        {mat.unit || 'pcs'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-neutral-50/70 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2.5 text-neutral-500">
                                                Total Hardware Components Deducted: <strong className="text-neutral-900 font-mono">{otherMaterials.length}</strong>
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-[11px] text-neutral-400 font-normal">
                                                Auto-deducted on assignment creation
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
