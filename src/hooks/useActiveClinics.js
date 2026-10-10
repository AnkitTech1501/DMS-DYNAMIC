import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';

/**
 * Centralizes fetching + loading-state for "active clinics" so every page
 * that needs this list (Doctors page, Add/Edit Doctor modal, etc.) shares
 * one implementation instead of duplicating fetch + isLoading logic.
 *
 * - `loading` starts true and only flips to false once the first real
 *   response lands, so consumers never judge an empty [] as "no clinics"
 *   before the network call actually resolves.
 * - `refresh()` returns the freshly fetched array directly, so callers that
 *   need the result immediately (e.g. "block opening a modal if empty")
 *   don't have to wait on a stale state closure.
 * - A ref guards against setting state after unmount (e.g. user navigates
 *   away while the request is in flight).
 */
export function useActiveClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const res = await api.get('/admin/clinics');
    const active = res.data.data.data.filter((c) => c.status === 'active');
    if (mountedRef.current) {
      setClinics(active);
      setLoading(false);
    }
    return active;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { clinics, loading, refresh };
}