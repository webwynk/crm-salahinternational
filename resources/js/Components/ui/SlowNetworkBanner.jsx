import React from "react";
import { Hourglass } from "lucide-react";

/**
 * UI State #5 — Slow Network Banner
 * Shown after 3 seconds of active Inertia navigation.
 * Usage: <SlowNetworkBanner visible={slowNetwork} />
 */
export default function SlowNetworkBanner({ visible }) {
    if (!visible) return null;
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-sm text-white text-[12px] font-medium px-4 py-2.5 rounded-full shadow-lg animate-pulse pointer-events-none">
            <Hourglass className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            Still loading… taking longer than usual
        </div>
    );
}
