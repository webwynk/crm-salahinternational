import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import { Gem } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => () => reset('password'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Confirm Password — Leather CRM" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white shadow-sm mb-4">
                    <Gem className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Confirm Password</h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                    This is a secure area. Please confirm your password to continue.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-sm px-8 py-8">
                    <form onSubmit={submit} className="space-y-5">
                        <Input
                            label="Password"
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            required
                            autoFocus
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={processing}
                        >
                            Confirm Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
