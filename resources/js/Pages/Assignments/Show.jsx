import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { FileText, ArrowLeft, Download, UserCheck, Layers } from 'lucide-react';

export default function Show({ assignment }) {
    return (
        <AppLayout>
            <Head title={`Work Order ${assignment.assignment_no} - Leather CRM`} />

            <PageHeader
                title={`Work Order ${assignment.assignment_no}`}
                description={`Status: ${assignment.status} • Target: ${assignment.quantity} Pcs`}
                action={
                    <div className="flex items-center gap-2">
                        <Link href={route('assignments.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Assignments
                            </Button>
                        </Link>
                        <a href={route('assignments.pdf', assignment.id)} target="_blank" rel="noreferrer">
                            <Button variant="primary" size="sm">
                                <FileText className="w-4 h-4 mr-1.5" /> Download PDF Work Order
                            </Button>
                        </a>
                    </div>
                }
            />

            <div className="space-y-6 w-full">
                {/* General Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                            Production Assignment Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1 border-b border-neutral-200">
                                <span className="text-neutral-500">Work Order No:</span>
                                <strong className="text-neutral-900 font-mono tabular-nums">{assignment.assignment_no}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-200">
                                <span className="text-neutral-500">Product Name:</span>
                                <strong className="text-neutral-900">{assignment.product?.name} ({assignment.product?.code})</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-200">
                                <span className="text-neutral-500">Target Quantity:</span>
                                <strong className="text-brand-700 text-base tabular-nums">{assignment.quantity} Pcs</strong>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-neutral-500">Assigned Date:</span>
                                <strong className="text-neutral-900 tabular-nums">
                                    {new Date(assignment.created_at).toLocaleString('en-GB')}
                                </strong>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                            Artisan Worker & Supervisor
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1 border-b border-neutral-200">
                                <span className="text-neutral-500">Artisan Worker:</span>
                                <strong className="text-neutral-900">{assignment.labour?.name}</strong>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-200">
                                <span className="text-neutral-500">Phone Contact:</span>
                                <strong className="text-neutral-900">{assignment.labour?.phone}</strong>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-neutral-500">Assigned By:</span>
                                <strong className="text-neutral-900">{assignment.assigner?.name || 'System Admin'}</strong>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Deducted Raw Materials Ledger Table */}
                <Card>
                    <h3 className="text-md font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-brand-500" /> Deducted Raw Materials Ledger (Auto-Deducted)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase border-b border-neutral-200">
                                <tr>
                                    <th className="px-3 py-2">#</th>
                                    <th className="px-3 py-2">Material Description</th>
                                    <th className="px-3 py-2">Deducted Qty</th>
                                    <th className="px-3 py-2">Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {assignment.materials?.map((mat, idx) => (
                                    <tr key={mat.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-2.5 text-neutral-400 tabular-nums">{idx + 1}</td>
                                        <td className="px-3 py-2.5 font-semibold text-neutral-900">{mat.label}</td>
                                        <td className="px-3 py-2.5 font-bold text-danger-700 tabular-nums">
                                            -{parseFloat(mat.quantity_used).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-neutral-500">{mat.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
