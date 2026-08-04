import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/layout/PageHeader';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout>
            <Head title="Profile & Settings" />

            <PageHeader
                title="Profile & Settings"
                description="Manage your account details and security preferences"
            />

            <div className="max-w-2xl space-y-6">
                {/* Profile Info */}
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="text-sm font-semibold text-neutral-900">Profile Information</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Update your display name and email address</p>
                    </div>
                    <div className="px-6 py-6">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                </div>

                {/* Password */}
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="text-sm font-semibold text-neutral-900">Change Password</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Use a strong, unique password for your account</p>
                    </div>
                    <div className="px-6 py-6">
                        <UpdatePasswordForm />
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-neutral-0 border border-danger-500/30 rounded-md shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-danger-500/20 bg-danger-50/50">
                        <h2 className="text-sm font-semibold text-danger-700">Danger Zone</h2>
                        <p className="text-xs text-danger-600 mt-0.5">Permanent actions that cannot be undone</p>
                    </div>
                    <div className="px-6 py-6">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
