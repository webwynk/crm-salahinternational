import React, { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import { Gem } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Register — Leather CRM" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white shadow-sm mb-4">
                    <Gem className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                    Create your account
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Leather Goods Manufacturing System
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-neutral-0 border border-neutral-200 rounded-md shadow-sm px-8 py-8">
                    <form onSubmit={submit} className="space-y-5">
                        <Input
                            label="Full Name"
                            id="name"
                            name="name"
                            value={data.name}
                            autoComplete="name"
                            required
                            autoFocus
                            placeholder="John Doe"
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                        />

                        <Input
                            label="Work Email"
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            required
                            placeholder="user@salahinternational.com"
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full mt-2"
                            isLoading={processing}
                        >
                            Register
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
