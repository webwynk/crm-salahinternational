import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/layout/Sidebar';
import Topbar from '@/Components/layout/Topbar';
import MobileBottomNav from '@/Components/layout/MobileBottomNav';
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
    const [toasts, setToasts] = useState([]);

    const addToast = (toastDetail) => {
        if (!toastDetail?.message) return;
        const newToast = {
            id: Date.now() + Math.random(),
            message: toastDetail.message,
            type: toastDetail.type || 'info',
            actionText: toastDetail.actionText,
            onAction: toastDetail.onAction,
        };
        setToasts((prev) => [...prev.slice(-2), newToast]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

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
        if (flash?.success)      addToast({ message: flash.success, type: 'success' });
        else if (flash?.error)   addToast({ message: flash.error,   type: 'danger'  });
        else if (flash?.warning) addToast({ message: flash.warning, type: 'warning' });
    }, [flash]);

    useEffect(() => {
        const handleCustomToast = (e) => {
            if (e.detail) {
                addToast(e.detail);
            }
        };
        window.addEventListener('show-toast', handleCustomToast);
        return () => window.removeEventListener('show-toast', handleCustomToast);
    }, []);


    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Offline top banner */}
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-danger-700 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md">
                    <WifiOff className="w-4 h-4" />
                    <span>You are offline — changes will not be saved until connection is restored.</span>
                </div>
            )}

            {/* Sidebar Shell */}
            <Sidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ${
                    isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-60'
                } ${isOffline ? 'pt-9' : ''} pb-16 md:pb-0`}
            >
                <Topbar onOpenMobile={() => setIsMobileOpen(true)} />

                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto"
                >
                    {children}
                </motion.main>
            </div>

            {/* Mobile Viewport (<768px) Bottom Tab Bar */}
            <MobileBottomNav />

            {/* Global Toast Stack */}
            <Toast toasts={toasts} onClose={removeToast} />
        </div>
    );
}
