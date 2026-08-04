import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Alert from '@/Components/ui/Alert';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name:  user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Input
                label="Display Name"
                id="name"
                name="name"
                value={data.name}
                autoComplete="name"
                required
                autoFocus
                onChange={(e) => setData('name', e.target.value)}
                error={errors.name}
            />

            <Input
                label="Email Address"
                id="email"
                type="email"
                name="email"
                value={data.email}
                autoComplete="username"
                required
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
            />

            {mustVerifyEmail && user.email_verified_at === null && (
                <Alert variant="warning">
                    Your email address is unverified.{' '}
                    <Link
                        href={route('verification.send')}
                        method="post"
                        as="button"
                        className="font-semibold underline hover:text-warning-800"
                    >
                        Resend verification email
                    </Link>

                    {status === 'verification-link-sent' && (
                        <p className="mt-1 text-xs font-medium">
                            A new verification link has been sent to your email address.
                        </p>
                    )}
                </Alert>
            )}

            <div className="flex items-center gap-4 pt-1">
                <Button type="submit" variant="primary" isLoading={processing}>
                    Save Changes
                </Button>
                {recentlySuccessful && (
                    <p className="text-sm text-success-700 font-medium">Saved successfully.</p>
                )}
            </div>
        </form>
    );
}
