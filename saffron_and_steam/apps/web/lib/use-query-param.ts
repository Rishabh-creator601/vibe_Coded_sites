"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Reads ?name= from the URL in the browser (null while pre-rendering), so the page can stay static. */
export function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
