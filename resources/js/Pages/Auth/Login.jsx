import React, { useEffect } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import Checkbox from '@/Components/ui/Checkbox';
import { Gem, Lock, Mail } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { url } = usePage();
    const isSessionExpired = url.includes('session=expired');

    const { data, setData, post, processing, errors, reset } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    useEffect(() => () => reset('password'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const isLocked = errors.email && errors.email.includes('locked');

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Sign In — Leather CRM" />

            {/* Brand header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white shadow-sm mb-4">
                    <Gem className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                    Salah International CRM
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Sign in to your manufacturing workspace
                </p>
            </div>

            {/* Card */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-sm px-8 py-8">
                    {/* UI State #8 — Session Expired */}
                    {isSessionExpired && (
                        <Alert variant="warning" className="mb-6">
                            Your session expired due to inactivity. Please sign in again.
                        </Alert>
                    )}

                    {/* UI State #10 — Status message (e.g. password reset sent) */}
                    {status && (
                        <Alert variant="success" className="mb-6">
                            {status}
                        </Alert>
                    )}

                    {/* UI State #8 — Account locked */}
                    {isLocked && (
                        <Alert variant="danger" title="Account Locked" className="mb-6">
                            {errors.email}
                        </Alert>
                    )}

                    <form onSubmit={submit} className="space-y-5">
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
                            error={!isLocked ? errors.email : null}
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
                            <Checkbox
                                id="remember"
                                label="Remember me"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full mt-2"
                            isLoading={processing}
                        >
                            Sign in
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-neutral-400">
                    Leather Goods Manufacturing System · Internal Access Only
                </p>
            </div>
        </div>
    );
}
