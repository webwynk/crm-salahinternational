import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast — Modern bottom notification system optimized for mobile and desktop.
 * Floats at bottom-center on mobile (above MobileBottomNav) and bottom-right on desktop.
 * Includes auto-dismiss progress bar, action trigger support, and touch dismiss.
 */
export default function Toast({ toast, onClose, duration = 4000 }) {
    const timerRef = React.useRef(null);
    const [progress, setProgress] = React.useState(100);

    const startTimer = React.useCallback(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                onClose();
            }
        }, 30);
        timerRef.current = interval;
    }, [onClose, duration]);

    const clearTimer = React.useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    React.useEffect(() => {
        if (toast) {
            setProgress(100);
            startTimer();
        }
        return clearTimer;
    }, [toast, startTimer, clearTimer]);

    const configs = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 shrink-0 text-success-500" />,
            border: 'border-l-4 border-l-success-500',
            barBg: 'bg-success-500',
            bg: 'bg-neutral-900 text-neutral-0 shadow-lg border-neutral-800',
        },
        danger: {
            icon: <AlertCircle className="w-5 h-5 shrink-0 text-danger-500" />,
            border: 'border-l-4 border-l-danger-500',
            barBg: 'bg-danger-500',
            bg: 'bg-neutral-900 text-neutral-0 shadow-lg border-neutral-800',
        },
        warning: {
            icon: <AlertTriangle className="w-5 h-5 shrink-0 text-warning-500" />,
            border: 'border-l-4 border-l-warning-500',
            barBg: 'bg-warning-500',
            bg: 'bg-neutral-900 text-neutral-0 shadow-lg border-neutral-800',
        },
        info: {
            icon: <Info className="w-5 h-5 shrink-0 text-brand-400" />,
            border: 'border-l-4 border-l-brand-500',
            barBg: 'bg-brand-500',
            bg: 'bg-neutral-900 text-neutral-0 shadow-lg border-neutral-800',
        },
    };

    const config = toast ? (configs[toast.type] || configs.info) : null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 pointer-events-none flex flex-col items-center md:items-end gap-2 pb-safe">
            <AnimatePresence mode="wait">
                {toast && config && (
                    <motion.div
                        key={toast.message + toast.type}
                        initial={{ opacity: 0, y: 40, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.94 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={clearTimer}
                        onMouseLeave={startTimer}
                        className={`pointer-events-auto relative max-w-sm w-full border ${config.bg} ${config.border} rounded-xl overflow-hidden p-4 flex items-start gap-3.5 backdrop-blur-md`}
                    >
                        {config.icon}
                        <div className="flex-1 min-w-0 pr-1">
                            <p className="text-xs font-semibold text-neutral-100 leading-snug">
                                {toast.message}
                            </p>
                            {toast.actionText && toast.onAction && (
                                <button
                                    onClick={() => {
                                        toast.onAction();
                                        onClose();
                                    }}
                                    className="mt-2 text-2xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
                                >
                                    {toast.actionText} →
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg transition-colors shrink-0 -mr-1 -mt-1 touch-manipulation"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Animated countdown progress bar at bottom edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
                            <div
                                className={`h-full ${config.barBg} transition-all duration-75 ease-linear`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

