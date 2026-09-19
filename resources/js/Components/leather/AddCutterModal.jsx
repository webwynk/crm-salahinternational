import React, { useState } from 'react';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import axios from 'axios';

export default function AddCutterModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post(
                route('leather.cutters.store'),
                { name, phone, address, notes },
                { headers: { Accept: 'application/json' } }
            );

            if (response.data?.cutter) {
                onSuccess(response.data.cutter);
                handleClose();
            }
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'Failed to add cutter. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setPhone('');
        setAddress('');
        setNotes('');
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Cutter / Workshop">
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                    <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {errors.general}
                    </div>
                )}

                <Input
                    label="Cutter / Workshop Name *"
                    placeholder="e.g. Rahim Cutting Master"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name?.[0] || errors.name}
                    required
                />

                <Input
                    label="Phone Number *"
                    placeholder="e.g. 9830123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone?.[0] || errors.phone}
                    required
                />

                <Input
                    label="Workshop / Address"
                    placeholder="e.g. Topsia Road, Kolkata"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    error={errors.address?.[0] || errors.address}
                />

                <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wider">
                        Notes / Remarks
                    </label>
                    <textarea
                        rows={2}
                        className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Optional notes regarding cutter rates, specialized tools, etc."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Saving Cutter...' : 'Add Cutter'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
