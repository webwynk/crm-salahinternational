import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast — bottom-right stack notification with framer-motion slide.
 * Auto-dismisses after `duration` ms. Pauses on hover.
 *
 * Usage (in AppLayout):
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 *
 * Props:
 *   toast    — { message: string, type: 'success' | 'danger' | 'warning' | 'info' } | null
 *   onClose  — () => void
 *   duration — auto-dismiss ms (default 4000)
 */
export default function Toast({ toast, onClose, duration = 4000 }) {
    const timerRef = React.useRef(null);

    const startTimer = React.useCallback(() => {
        timerRef.current = setTimeout(onClose, duration);
    }, [onClose, duration]);

    const clearTimer = React.useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    React.useEffect(() => {
        if (toast) {
            startTimer();
        }
        return clearTimer;
    }, [toast, startTimer, clearTimer]);

    const configs = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 shrink-0 text-success-700" />,
            border: 'border-l-success-500',
        },
        danger: {
            icon: <AlertCircle className="w-5 h-5 shrink-0 text-danger-700" />,
            border: 'border-l-danger-500',
        },
        warning: {
            icon: <AlertTriangle className="w-5 h-5 shrink-0 text-warning-700" />,
            border: 'border-l-warning-500',
        },
        info: {
            icon: <Info className="w-5 h-5 shrink-0 text-info-700" />,
            border: 'border-l-info-500',
        },
    };

    const config = toast ? (configs[toast.type] || configs.info) : null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 pointer-events-none flex flex-col items-center md:items-end gap-2 pb-safe">
            <AnimatePresence mode="wait">
                {toast && config && (
                    <motion.div
                        key={toast.message + toast.type}
                        initial={{ opacity: 0, x: 64, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 64, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onMouseEnter={clearTimer}
                        onMouseLeave={startTimer}
                        className={`pointer-events-auto max-w-sm w-full bg-neutral-0 border border-neutral-200 border-l-4 ${config.border} rounded-md shadow-lg px-4 py-3 flex items-start gap-3`}
                    >
                        {config.icon}
                        <p className="text-sm text-neutral-800 flex-1 leading-snug pt-0.5">
                            {toast.message}
                        </p>
                        <button
                            onClick={onClose}
                            className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded transition-colors shrink-0 mt-0.5"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
