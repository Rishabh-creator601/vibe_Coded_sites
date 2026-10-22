// Errors look like { error: { code, message, details? } } (PLAN.md section 8). The web
// app translates `code`, so the API never needs to know the visitor's language.

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "ITEM_UNAVAILABLE"
  | "DELIVERY_UNAVAILABLE"
  | "BELOW_MINIMUM"
  | "PAYMENT_METHOD_UNAVAILABLE"
  | "PICKUP_TIME_UNAVAILABLE"
  | "SLOT_UNAVAILABLE"
  | "SLOT_FULL"
  | "ALREADY_PAID"
  | "ORDER_CANCELLED"
  | "RATE_LIMITED"
  | "INTERNAL";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, "NOT_FOUND", `${what} not found`);
