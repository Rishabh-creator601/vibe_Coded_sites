import rateLimit from "express-rate-limit";
import { AppError } from "../utils/http.js";

/** Validate req.body (or req.query with `source`) against a zod schema and replace it with the parsed value. */
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue.path.length ? `${issue.path.join(".")}: ` : "";
      return next(new AppError(400, "VALIDATION_ERROR", `${where}${issue.message}`));
    }
    Object.defineProperty(req, source, { value: parsed.data, writable: true, configurable: true });
    next();
  };

const limiter = ({ windowMs, max, keyGenerator }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, "RATE_LIMITED", "Too many requests, please slow down")),
  });

export const loginLimiter = limiter({ windowMs: 15 * 60 * 1000, max: 10, keyGenerator: (req) => req.ip });
export const testStartLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => String(req.user?._id || req.ip),
});

export function notFoundHandler(_req, _res, next) {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.type === "entity.too.large") err = new AppError(400, "VALIDATION_ERROR", "Request body is too large");
  else if (err.type === "entity.parse.failed") err = new AppError(400, "VALIDATION_ERROR", "Invalid JSON");
  if (!(err instanceof AppError)) {
    console.error(err);
    err = new AppError(500, "SERVER_ERROR", "Something went wrong");
  }
  res.status(err.status).json({ error: { code: err.code, message: err.message } });
}
