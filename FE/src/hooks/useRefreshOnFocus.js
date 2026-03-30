import { useEffect, useRef } from 'react';

/**
 * Auto-refresh a callback when:
 *  1. The browser tab becomes visible again (user switches back to this tab)
 *  2. The window regains focus (user clicks back on the browser window)
 *
 * @param {Function} callback - async or sync function to call on refresh
 * @param {Object}  [options]
 * @param {number}  [options.debounceMs=500]  - min ms between two refreshes
 * @param {boolean} [options.enabled=true]    - disable without removing the hook
 */
export function useRefreshOnFocus(callback, { debounceMs = 500, enabled = true } = {}) {
    const lastRefreshRef = useRef(0);
    const callbackRef = useRef(callback);

    // Always call the latest version of the callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        const refresh = () => {
            const now = Date.now();
            if (now - lastRefreshRef.current < debounceMs) return;
            lastRefreshRef.current = now;
            callbackRef.current?.();
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        };

        const handleFocus = () => {
            refresh();
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleFocus);
        };
    }, [enabled, debounceMs]);
}
