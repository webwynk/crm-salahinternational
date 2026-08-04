import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';

export default function DeleteUserForm() {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(false),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-neutral-600">
                Once your account is deleted, all its resources and data will be permanently removed.
                Download any information you need before proceeding.
            </p>

            <Button
                variant="danger"
                onClick={() => setConfirmingDeletion(true)}
            >
                Delete Account
            </Button>

            <Modal isOpen={confirmingDeletion} onClose={closeModal} title="Delete Account?">
                <form onSubmit={deleteUser} className="space-y-5">
                    <p className="text-sm text-neutral-600">
                        This action cannot be undone. Enter your password to confirm you want to permanently delete this account.
                    </p>

                    <Input
                        label="Your Password"
                        id="delete_password"
                        type="password"
                        name="password"
                        ref={passwordInput}
                        value={data.password}
                        autoFocus
                        placeholder="Confirm your current password"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="danger" isLoading={processing}>
                            Yes, Delete My Account
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
