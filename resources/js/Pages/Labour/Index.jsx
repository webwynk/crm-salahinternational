import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Drawer from '@/Components/ui/Drawer';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Checkbox from '@/Components/ui/Checkbox';
import SlowNetworkBanner from '@/Components/ui/SlowNetworkBanner';
import useInertiaLoading from '@/hooks/useInertiaLoading';
import { Plus, Edit3, Phone } from 'lucide-react';

export default function Index({ labour, filters = {} }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.is_admin ?? false;

    const { isLoading, slowNetwork } = useInertiaLoading();

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
                    isAdmin ? (
                        <Button variant="primary" onClick={openAddDrawer}>
                            <Plus className="w-4 h-4 mr-1.5" /> Add Artisan Worker
                        </Button>
                    ) : null
                }
            />

            <DataTable
                columns={columns}
                data={labour.data}
                pagination={labour}
                isLoading={isLoading}
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search artisan by name or phone..."
                emptyTitle="No labour records found"
                emptyDescription="Add artisan workers to assign production work orders."
                emptyActionLabel={isAdmin ? "Add Artisan Worker" : undefined}
                onEmptyAction={isAdmin ? openAddDrawer : undefined}
                renderRowActions={(row) => (
                    isAdmin ? (
                        <Button variant="outline" size="sm" onClick={() => openEditDrawer(row)}>
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                    ) : null
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

                    <Textarea
                        label="Workshop Address"
                        rows={2}
                        placeholder="Shop / Unit location details..."
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        error={errors.address}
                    />

                    <Input
                        label="Skill Tags (Comma separated)"
                        placeholder="e.g. Saddle Stitching, Pattern Cutting, Edge Paint"
                        value={data.skill_tags_str}
                        onChange={(e) => setData('skill_tags_str', e.target.value)}
                        error={errors.skill_tags}
                        helperText="Separate multiple skill tags with commas"
                    />

                    {editingWorker && (
                        <Checkbox
                            id="is_active"
                            label="Worker account active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
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

            {/* UI State #5 — Slow Network floating banner */}
            <SlowNetworkBanner visible={slowNetwork} />
        </AppLayout>
    );
}
