import { useState, useEffect, useCallback, useRef } from 'react';
import api from './api';

/**
 * useFetch — cancellable data fetcher hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/customers', { page: 1 });
 *
 * Automatically cancels in-flight requests on argument change or component unmount.
 * Returns a stable `refetch` function to manually trigger re-fetch.
 */
const useFetch = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Stable string key so useEffect only re-runs when params actually change
  const paramsKey = JSON.stringify(params);

  const execute = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint, { params, signal });
      if (!signal.aborted) {
        setData(res.data);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err?.response?.data?.error || err.message || 'Request failed');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey]);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    execute(controller.signal);
    return () => controller.abort();
  }, [execute]);

  const refetch = useCallback(() => {
    // Cancel any current request, then start a fresh one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    execute(controller.signal);
  }, [execute]);

  return { data, loading, error, refetch };
};

export default useFetch;
