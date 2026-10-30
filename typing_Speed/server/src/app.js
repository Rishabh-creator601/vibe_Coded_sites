import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/common.js";
import auth from "./routes/auth.js";
import levels from "./routes/levels.js";
import practice from "./routes/practice.js";
import tests from "./routes/tests.js";
import users from "./routes/users.js";
import leaderboard from "./routes/leaderboard.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
  app.use("/api/auth", auth);
  app.use("/api/levels", levels);
  app.use("/api/practice", practice);
  app.use("/api/tests", tests);
  app.use("/api/users", users);
  app.use("/api/leaderboard", leaderboard);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
