import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env";
import { HttpError } from "../lib/http-error";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
};

/** One place that turns thrown errors into JSON. No stack traces leave the server. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  // Malformed JSON from express.json().
  if (err?.type === "entity.parse.failed" || err?.type === "entity.too.large") {
    res.status(err.status ?? 400).json({ error: { code: "VALIDATION_FAILED", message: "The request body isn't valid JSON or is too large" } });
    return;
  }
  if (env.NODE_ENV !== "test") console.error(`[api] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong on our side" } });
};
