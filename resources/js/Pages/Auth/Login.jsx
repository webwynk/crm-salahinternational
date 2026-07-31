import React, { useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { url } = usePage();
    const isSessionExpired = url.includes('session=expired');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Sign In - Leather CRM" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-brand-500 text-white shadow-md mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                    Leather CRM System
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                    Sign in to your manufacturing workspace
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-neutral-200 rounded-md">
                    {/* Session Expired Banner */}
                    {isSessionExpired && (
                        <Alert variant="warning" className="mb-6">
                            Your session expired due to inactivity. Please sign in again.
                        </Alert>
                    )}

                    {/* Status Message */}
                    {status && (
                        <Alert variant="success" className="mb-6">
                            {status}
                        </Alert>
                    )}

                    {/* Generic Validation/Lockout Error Alert */}
                    {errors.email && errors.email.includes('locked') && (
                        <Alert variant="danger" className="mb-6" title="Account Locked">
                            {errors.email}
                        </Alert>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            label="Work Email"
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            required
                            placeholder="admin@salahinternational.com"
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email && !errors.email.includes('locked') ? errors.email : null}
                        />

                        <Input
                            label="Password"
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
                                />
                                <span className="text-sm text-neutral-700">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <a
                                    href={route('password.request')}
                                    className="text-sm font-medium text-brand-500 hover:text-brand-600 hover:underline"
                                >
                                    Forgot password?
                                </a>
                            )}
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={processing}
                            >
                                Sign in to Dashboard
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
