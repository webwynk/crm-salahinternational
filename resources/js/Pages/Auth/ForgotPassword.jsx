import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import { Gem, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Forgot Password — Leather CRM" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white shadow-sm mb-4">
                    <Gem className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Reset your password</h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Enter your work email — we'll send a reset link
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-sm px-8 py-8">
                    {status && (
                        <Alert variant="success" className="mb-6">
                            {status}
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
                            autoFocus
                            placeholder="admin@salahinternational.com"
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={processing}
                        >
                            Send Reset Link
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
