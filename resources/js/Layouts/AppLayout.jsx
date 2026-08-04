import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/layout/Sidebar';
import Topbar from '@/Components/layout/Topbar';
import Toast from '@/Components/ui/Toast';
import { WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppLayout({ children }) {
    const { flash } = usePage().props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(
        typeof navigator !== 'undefined' ? !navigator.onLine : false
    );
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleOnline  = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (flash?.success)      setToast({ message: flash.success, type: 'success' });
        else if (flash?.error)   setToast({ message: flash.error,   type: 'danger'  });
        else if (flash?.warning) setToast({ message: flash.warning, type: 'warning' });
    }, [flash]);

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Offline banner — UI State #4 */}
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-danger-700 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md">
                    <WifiOff className="w-4 h-4" />
                    <span>You are offline — changes will not be saved until your connection is restored.</span>
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            {/* Main content */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
                    isCollapsed ? 'lg:pl-18' : 'lg:pl-60'
                } ${isOffline ? 'pt-9' : ''}`}
            >
                <Topbar onOpenMobile={() => setIsMobileOpen(true)} />

                <motion.main
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto"
                >
                    {children}
                </motion.main>
            </div>

            {/* Toast — UI State #10 (success / error feedback) */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}
