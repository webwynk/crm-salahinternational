import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Drawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    width = 'max-w-md',
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    {/* Drawer Content */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className={`w-screen ${width} bg-white shadow-xl flex flex-col`}
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                                <div>
                                    <h3 className="text-md font-semibold text-neutral-900">{title}</h3>
                                    {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-md hover:bg-neutral-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
