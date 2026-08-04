import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';

export default function UpdatePasswordForm() {
    const passwordInput        = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={updatePassword} className="space-y-5">
            <Input
                label="Current Password"
                id="current_password"
                type="password"
                name="current_password"
                ref={currentPasswordInput}
                value={data.current_password}
                autoComplete="current-password"
                onChange={(e) => setData('current_password', e.target.value)}
                error={errors.current_password}
            />

            <Input
                label="New Password"
                id="password"
                type="password"
                name="password"
                ref={passwordInput}
                value={data.password}
                autoComplete="new-password"
                onChange={(e) => setData('password', e.target.value)}
                error={errors.password}
            />

            <Input
                label="Confirm New Password"
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={data.password_confirmation}
                autoComplete="new-password"
                onChange={(e) => setData('password_confirmation', e.target.value)}
                error={errors.password_confirmation}
            />

            <div className="flex items-center gap-4 pt-1">
                <Button type="submit" variant="primary" isLoading={processing}>
                    Update Password
                </Button>
                {recentlySuccessful && (
                    <p className="text-sm text-success-700 font-medium">Password updated.</p>
                )}
            </div>
        </form>
    );
}
