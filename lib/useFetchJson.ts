"use client";

import { useEffect, useState } from "react";

interface FetchState<T> {
  key: string;
  data?: T;
  error?: string;
}

// Fetches JSON from our own /api routes whenever `url` or `reloadKey` changes.
// Keeps the last successful data while a new request is in flight, and
// aborts stale requests so a slow response can't overwrite a newer one.
export function useFetchJson<T>(url: string, reloadKey = 0) {
  const key = `${url}#${reloadKey}`;
  const [state, setState] = useState<FetchState<T>>({ key: "" });

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
        setState({ key, data: body as T });
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({ key, data: prev.data, error: err.message }));
      });

    return () => controller.abort();
  }, [url, key]);

  return {
    data: state.data,
    error: state.key === key ? state.error : undefined,
    loading: state.key !== key,
  };
}
