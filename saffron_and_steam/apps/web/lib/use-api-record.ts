"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "./api";

export type ApiRecord<T> = { state: "loading" } | { state: "missing" } | { state: "error"; error: unknown } | { state: "ready"; data: T };

/**
 * Loads one order or booking from the API (`path` null = don't). With `pollMs`, it
 * reloads on that interval until `done(data)` is true, e.g. a delivered order.
 */
export function useApiRecord<T>(path: string | null, opts: { pollMs?: number; done?: (data: T) => boolean } = {}): ApiRecord<T> {
  const [result, setResult] = useState<{ path: string; record: ApiRecord<T> } | null>(null);
  const { pollMs, done } = opts;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      let record: ApiRecord<T>;
      try {
        record = { state: "ready", data: await apiFetch<T>(path) };
      } catch (error) {
        record = error instanceof ApiError && error.code === "NOT_FOUND" ? { state: "missing" } : { state: "error", error };
      }
      if (cancelled) return;
      setResult({ path, record });
      if (pollMs && record.state === "ready" && !done?.(record.data)) timer = setTimeout(load, pollMs);
    };
    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `done` is a predicate on the data; a new function each render shouldn't restart polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, pollMs]);

  return result && result.path === path ? result.record : { state: "loading" };
}
