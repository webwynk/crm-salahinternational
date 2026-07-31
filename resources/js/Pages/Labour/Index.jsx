import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Drawer from '@/Components/ui/Drawer';
import Input from '@/Components/ui/Input';
import { Plus, Edit3, UserCheck, Phone, MapPin } from 'lucide-react';

export default function Index({ labour, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        address: '',
        skill_tags_str: '',
        is_active: true,
    });

    const handleSearch = (val) => {
        setSearch(val);
        router.get(route('labour.index'), { ...filters, search: val, page: 1 }, { preserveState: true, replace: true });
    };

    const openAddDrawer = () => {
        setEditingWorker(null);
        reset();
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (worker) => {
        setEditingWorker(worker);
        setData({
            name: worker.name,
            phone: worker.phone,
            address: worker.address || '',
            skill_tags_str: Array.isArray(worker.skill_tags) ? worker.skill_tags.join(', ') : '',
            is_active: worker.is_active,
        });
        setIsDrawerOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const skillTagsArray = data.skill_tags_str
            ? data.skill_tags_str.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        if (editingWorker) {
            put(route('labour.update', editingWorker.id), {
                data: {
                    ...data,
                    skill_tags: skillTagsArray,
                },
                onSuccess: () => setIsDrawerOpen(false),
            });
        } else {
            post(route('labour.store'), {
                data: {
                    ...data,
                    skill_tags: skillTagsArray,
                },
                onSuccess: () => {
                    reset();
                    setIsDrawerOpen(false);
                },
            });
        }
    };

    const columns = [
        {
            header: 'Artisan Name',
            accessor: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-bold text-neutral-900 block">{row.name}</span>
                    <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {row.phone}
                    </span>
                </div>
            ),
        },
        {
            header: 'Address / Location',
            accessor: 'address',
            render: (row) => (
                <span className="text-xs text-neutral-600 truncate max-w-xs block">
                    {row.address || 'N/A'}
                </span>
            ),
        },
        {
            header: 'Craft Skills & Tags',
            accessor: 'skill_tags',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(row.skill_tags) && row.skill_tags.length > 0 ? (
                        row.skill_tags.map((tag) => (
                            <Badge key={tag} variant="brand" size="sm">
                                {tag}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-neutral-400">General Craftsman</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Assigned Work Orders',
            accessor: 'assignments_count',
            render: (row) => (
                <Badge variant="neutral">{row.assignments_count || 0} Orders</Badge>
            ),
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row) => (
                <Badge variant={row.is_active ? 'success' : 'danger'}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Labour Artisans - Leather CRM" />

            <PageHeader
                title="Labour Artisans Master"
                description="Manage leather craftsmen, contact details, skill specialization tags, and work history"
                action={
                    <Button variant="primary" onClick={openAddDrawer}>
                        <Plus className="w-4 h-4 mr-1.5" /> + Add Artisan Worker
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={labour.data}
                pagination={labour}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search artisan by name or phone..."
                emptyTitle="No labour records found"
                emptyDescription="Add artisan workers to assign production work orders."
                emptyActionLabel="+ Add Artisan Worker"
                onEmptyAction={openAddDrawer}
                renderRowActions={(row) => (
                    <Button variant="outline" size="sm" onClick={() => openEditDrawer(row)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                )}
            />

            {/* Add / Edit Worker Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={editingWorker ? `Edit Artisan: ${editingWorker.name}` : 'Add New Artisan Worker'}
                subtitle="Record contact details and craft specialization skills"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Artisan Name"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />

                    <Input
                        label="Phone Number"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        error={errors.phone}
                    />

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Workshop Address</label>
                        <textarea
                            rows={2}
                            placeholder="Shop / Unit location details..."
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full text-base px-3.5 py-2.5 rounded-sm border border-neutral-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>

                    <Input
                        label="Skill Tags (Comma separated)"
                        placeholder="e.g. Saddle Stitching, Pattern Cutting, Edge Paint"
                        value={data.skill_tags_str}
                        onChange={(e) => setData('skill_tags_str', e.target.value)}
                        error={errors.skill_tags}
                        helperText="Separate multiple skill tags with commas"
                    />

                    {editingWorker && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded text-brand-500 border-neutral-300"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
                                Worker account active
                            </label>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                        <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={processing}>
                            {editingWorker ? 'Update Artisan' : 'Save Artisan'}
                        </Button>
                    </div>
                </form>
            </Drawer>
        </AppLayout>
    );
}
