import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

/**
 * useInertiaLoading()
 *
 * Tracks active Inertia navigations and fires a slow-network
 * flag after 3 seconds if the request is still in flight.
 *
 * Returns:
 *   isLoading   — true while any Inertia request is active (for DataTable skeleton)
 *   slowNetwork — true after 3 s of continuous loading (for SlowNetworkBanner)
 */
export default function useInertiaLoading(delayMs = 3000) {
    const [isLoading, setIsLoading]     = useState(false);
    const [slowNetwork, setSlowNetwork] = useState(false);
    const timerRef                      = useRef(null);

    useEffect(() => {
        const stopStart = router.on("start", () => {
            setIsLoading(true);
            setSlowNetwork(false);
            timerRef.current = setTimeout(() => setSlowNetwork(true), delayMs);
        });

        const stopFinish = router.on("finish", () => {
            setIsLoading(false);
            setSlowNetwork(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        });

        return () => {
            stopStart();
            stopFinish();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [delayMs]);

    return { isLoading, slowNetwork };
}
