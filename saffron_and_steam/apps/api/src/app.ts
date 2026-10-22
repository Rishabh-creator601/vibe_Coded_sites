import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errors";
import { ordersRouter } from "./routes/orders";
import { publicRouter } from "./routes/public";

/** Limits how often one visitor can send forms, orders and bookings. */
function writeLimit(perTenMinutes: number) {
  return rateLimit({
    windowMs: 10 * 60_000,
    limit: perTenMinutes,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.method === "GET" || env.NODE_ENV === "test",
    handler: (_req, res) => {
      res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many requests. Try again in a few minutes." } });
    },
  });
}

export function createApp() {
  const app = express();
  // The browser reaches the API through the Next.js /api/v1 rewrite (PLAN.md section 5),
  // so the visitor's IP arrives in X-Forwarded-For.
  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.WEB_URL }));
  app.use(express.json({ limit: "20kb" }));

  const api = express.Router();
  api.get("/health", (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
  });
  api.use(["/contact", "/newsletter"], writeLimit(10));
  api.use(["/orders", "/reservations"], writeLimit(30));
  api.use(publicRouter);
  api.use(ordersRouter);

  app.use("/api/v1", api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
