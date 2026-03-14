import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePolling — calls `fetchFn` on mount and every `interval` milliseconds.
 *
 * @param {() => Promise<any>} fetchFn  Async function that returns the data to store.
 * @param {number}             interval Polling interval in ms (default 30 000).
 * @returns {{ data: any, loading: boolean, error: string|null, lastUpdated: Date|null, refresh: () => void }}
 */
export default function usePolling(fetchFn, interval = 30000) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchFnRef = useRef(fetchFn);
    fetchFnRef.current = fetchFn;

    const run = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchFnRef.current();
            setData(result);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        run();
        const timer = setInterval(run, interval);
        return () => clearInterval(timer);
    }, [run, interval]);

    return { data, loading, error, lastUpdated, refresh: run };
}
