// Talks to the Express API (apps/api) through the same-origin /api/v1 rewrite in
// next.config.ts. With NEXT_PUBLIC_USE_API unset, the site runs as a browser-only demo:
// orders and bookings are kept in localStorage and nothing here is called.

export const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

/** Error codes the API sends back (apps/api/src/lib/http-error.ts). */
export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "ITEM_UNAVAILABLE"
  | "DELIVERY_UNAVAILABLE"
  | "BELOW_MINIMUM"
  | "PAYMENT_METHOD_UNAVAILABLE"
  | "PICKUP_TIME_UNAVAILABLE"
  | "SLOT_UNAVAILABLE"
  | "SLOT_FULL"
  | "ORDER_CANCELLED"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "NETWORK";

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(code);
  }
}

/**
 * fetch() for the API. Throws ApiError with the API's error code, or "NETWORK" when the
 * API can't be reached. `base` is only needed on the server, where there's no origin.
 */
export async function apiFetch<T>(path: string, init: { method?: "GET" | "POST"; body?: unknown; base?: string } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${init.base ?? ""}/api/v1${path}`, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("NETWORK", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // The rewrite answers 500/502 with an HTML page when the API is down.
    const error = data?.error;
    throw new ApiError(error?.code ?? (res.status >= 500 ? "NETWORK" : "INTERNAL"), res.status, error?.details);
  }
  return data as T;
}
