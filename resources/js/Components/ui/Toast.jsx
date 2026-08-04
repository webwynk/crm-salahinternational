import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ArrowRight } from 'lucide-react';

function ToastItem({ toast, onClose, duration = 4500 }) {
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
                onClose(toast.id || toast.message);
            }
        }, 30);
        timerRef.current = interval;
    }, [toast, onClose, duration]);

    const clearTimer = React.useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    React.useEffect(() => {
        setProgress(100);
        startTimer();
        return clearTimer;
    }, [toast, startTimer, clearTimer]);

    const configs = {
        success: {
            icon: <CheckCircle2 className="w-4 h-4 text-success-400 shrink-0" />,
            badgeBg: 'bg-success-500/20 text-success-400 border-success-500/30',
            barBg: 'bg-success-500',
        },
        danger: {
            icon: <AlertCircle className="w-4 h-4 text-danger-400 shrink-0" />,
            badgeBg: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
            barBg: 'bg-danger-500',
        },
        warning: {
            icon: <AlertTriangle className="w-4 h-4 text-warning-400 shrink-0" />,
            badgeBg: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
            barBg: 'bg-warning-500',
        },
        info: {
            icon: <Info className="w-4 h-4 text-brand-400 shrink-0" />,
            badgeBg: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
            barBg: 'bg-brand-500',
        },
    };

    const config = configs[toast.type] || configs.info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={clearTimer}
            onMouseLeave={startTimer}
            className="pointer-events-auto relative max-w-sm w-full bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden p-3.5 sm:p-4 flex items-start gap-3 text-neutral-100 ring-1 ring-white/10"
        >
            <div className={`p-1.5 rounded-xl border ${config.badgeBg} shrink-0`}>
                {config.icon}
            </div>

            <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-semibold text-neutral-100 leading-snug">
                    {toast.message}
                </p>
                {toast.actionText && toast.onAction && (
                    <button
                        onClick={() => {
                            toast.onAction();
                            onClose(toast.id || toast.message);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
                    >
                        {toast.actionText} <ArrowRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            <button
                onClick={() => onClose(toast.id || toast.message)}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg transition-colors shrink-0 -mr-1 -mt-1 touch-manipulation"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Countdown progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800">
                <div
                    className={`h-full ${config.barBg} transition-all duration-75 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </motion.div>
    );
}

export default function Toast({ toast, toasts = [], onClose, duration = 4500 }) {
    const list = toasts.length > 0 ? toasts : toast ? [{ ...toast, id: toast.id || toast.message }] : [];

    if (list.length === 0) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 pointer-events-none flex flex-col items-center md:items-end gap-2.5 pb-safe">
            <AnimatePresence mode="popLayout">
                {list.map((t) => (
                    <ToastItem
                        key={t.id || t.message}
                        toast={t}
                        onClose={onClose}
                        duration={duration}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}


