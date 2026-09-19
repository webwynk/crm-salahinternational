import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import LeatherTabNav from '@/Components/leather/LeatherTabNav';
import DataTable from '@/Components/ui/DataTable';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import { Plus, Edit2, Phone, MapPin } from 'lucide-react';

export default function Cutters({ cutters, filters = {} }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editCutter, setEditCutter] = useState(null);

    // Form state for add/edit
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleOpenAdd = () => {
        setEditCutter(null);
        setName('');
        setPhone('');
        setAddress('');
        setNotes('');
        setIsActive(true);
        setErrors({});
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (c) => {
        setEditCutter(c);
        setName(c.name || '');
        setPhone(c.phone || '');
        setAddress(c.address || '');
        setNotes(c.notes || '');
        setIsActive(c.is_active ?? true);
        setErrors({});
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditCutter(null);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = {
            name,
            phone,
            address,
            notes,
            is_active: isActive,
        };

        if (editCutter) {
            // Fixed: router.match() is NOT a valid Inertia API. Use router.put() instead.
            router.put(route('leather.cutters.update', editCutter.id), payload, {
                onError: (errs) => {
                    setErrors(errs);
                    setLoading(false);
                },
                onSuccess: () => {
                    setLoading(false);
                    handleCloseModal();
                },
            });
        } else {
            router.post(route('leather.cutters.store'), payload, {
                onError: (errs) => {
                    setErrors(errs);
                    setLoading(false);
                },
                onSuccess: () => {
                    setLoading(false);
                    handleCloseModal();
                },
            });
        }
    };

    /**
     * Generate initials from a cutter name (e.g. "Rahim Cutting Master" → "RC")
     */
    const getInitials = (fullName) => {
        if (!fullName) return '??';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const columns = [
        {
            header: 'Cutter / Workshop Name',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                        {getInitials(row.name)}
                    </div>
                    <div>
                        <div className="font-bold text-neutral-900 text-xs">
                            {row.name}
                        </div>
                        {row.notes && (
                            <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                                {row.notes}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: 'Phone Number',
            accessor: 'phone',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-neutral-700">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="tabular-nums">{row.phone}</span>
                </div>
            ),
        },
        {
            header: 'Workshop / Address',
            accessor: 'address',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-xs">{row.address || 'Kolkata'}</span>
                </div>
            ),
        },
        {
            header: 'Challans Issued',
            accessor: 'challans_count',
            render: (row) => (
                <span className="text-xs font-semibold text-neutral-900 tabular-nums">
                    {row.challans_count ?? 0}
                </span>
            ),
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row) => (
                <Badge variant={row.is_active ? 'success' : 'neutral'}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'id',
            className: 'text-right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(row)}
                        className="flex items-center gap-1 text-xs"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Cutters Directory — Salah International" />

            <div className="space-y-6">
                <LeatherTabNav />

                <PageHeader
                    title="Leather Cutters Directory"
                    description="Manage specialized cutting masters and outside cutting workshops separate from assembly stitchers."
                    action={
                        <Button
                            variant="primary"
                            onClick={handleOpenAdd}
                            className="flex items-center gap-2 text-xs font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            Add Cutter
                        </Button>
                    }
                />

                <DataTable
                    columns={columns}
                    data={cutters.data}
                    pagination={cutters}
                    initialSearch={filters.search}
                    searchPlaceholder="Search cutters by name, phone, or workshop address..."
                    onSearch={(val) => {
                        router.get(
                            route('leather.cutters.index'),
                            { ...filters, search: val, page: 1 },
                            { preserveState: true, replace: true }
                        );
                    }}
                    emptyTitle="No cutters added yet"
                    emptyDescription="Add cutting masters and workshops to start issuing leather cutting challans."
                    emptyAction={
                        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add First Cutter
                        </Button>
                    }
                />
            </div>

            {/* Add / Edit Cutter Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                title={editCutter ? `Edit Cutter: ${editCutter.name}` : 'Add New Cutter / Workshop'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Cutter / Workshop Name"
                        placeholder="e.g. Rahim Cutting Master"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        required
                    />

                    <Input
                        label="Phone Number"
                        placeholder="e.g. 9830123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={errors.phone}
                        required
                    />

                    <Input
                        label="Workshop / Address"
                        placeholder="e.g. Topsia Road, Kolkata"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        error={errors.address}
                    />

                    <Textarea
                        label="Notes / Remarks"
                        rows={2}
                        placeholder="Optional notes regarding cutter rates, specialized tools, etc."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300"
                        />
                        <label htmlFor="is_active" className="text-xs font-semibold text-neutral-700">
                            Active (available for new challans)
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : editCutter ? 'Update Cutter' : 'Add Cutter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
