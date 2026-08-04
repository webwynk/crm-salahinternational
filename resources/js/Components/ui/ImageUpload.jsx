import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import Button from '@/Components/ui/Button';

export default function ImageUpload({
    value = '',
    onChange,
    label = 'Product Image',
    helperText = 'PNG, JPG, WEBP up to 5MB, or enter image URL',
    error,
}) {
    const [previewUrl, setPreviewUrl] = useState(value || '');
    const [useUrlInput, setUseUrlInput] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
            if (onChange) onChange(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleRemove = () => {
        setPreviewUrl('');
        if (onChange) onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}

            {previewUrl ? (
                <div className="relative rounded-md border border-neutral-200 overflow-hidden bg-neutral-50 p-2 flex items-center gap-4">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-md border border-neutral-200 shrink-0 bg-neutral-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">Image Attached</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{previewUrl.slice(0, 40)}...</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-neutral-100 rounded-md transition-colors"
                        title="Remove image"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : useUrlInput ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="https://example.com/product-image.jpg"
                            value={previewUrl}
                            onChange={(e) => {
                                setPreviewUrl(e.target.value);
                                if (onChange) onChange(e.target.value);
                            }}
                            className="w-full text-sm px-3.5 py-2 border border-neutral-300 rounded-md bg-neutral-0 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                        <Button variant="ghost" size="sm" onClick={() => setUseUrlInput(false)}>
                            File Upload
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 hover:border-brand-500 rounded-md p-6 text-center cursor-pointer transition-colors bg-neutral-0 hover:bg-brand-50/20 group"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-brand-50 text-neutral-500 group-hover:text-brand-600 flex items-center justify-center mx-auto mb-2 transition-colors">
                        <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-800">
                        Click to upload <span className="font-normal text-neutral-500">or drag & drop</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{helperText}</p>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUseUrlInput(true);
                        }}
                        className="mt-3 text-xs text-brand-600 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                        <LinkIcon className="w-3 h-3" /> Or enter image URL
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-danger-700 font-medium">{error}</p>}
        </div>
    );
}
