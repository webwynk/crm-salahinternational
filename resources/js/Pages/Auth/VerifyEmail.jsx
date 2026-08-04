import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Alert from '@/Components/ui/Alert';
import { Gem } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Verify Email — Leather CRM" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white shadow-sm mb-4">
                    <Gem className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Verify your email</h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Thanks for signing up! Please check your inbox for a verification link.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-sm px-8 py-8">
                    {status === 'verification-link-sent' && (
                        <Alert variant="success" className="mb-6">
                            A new verification link has been sent to your email address.
                        </Alert>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={processing}
                        >
                            Resend Verification Email
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm font-medium text-neutral-500 hover:text-danger-600 transition-colors"
                        >
                            Sign Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
