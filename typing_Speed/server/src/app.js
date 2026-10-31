import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/common.js";
import { AppError } from "./utils/http.js";
import auth from "./routes/auth.js";
import levels from "./routes/levels.js";
import practice from "./routes/practice.js";
import tests from "./routes/tests.js";
import users from "./routes/users.js";
import leaderboard from "./routes/leaderboard.js";

// On serverless hosts nothing calls mongoose.connect() up front, so connect on first use and
// reuse the connection between invocations. Locally index.js has already connected (readyState 1).
let connecting = null;
// Guest practice text is generated from static data, so those routes don't need the database.
const NO_DB = /^\/practice\/(drill$|[a-z]+\/(text|wordbank)$)/;

async function ensureDb(req, _res, next) {
  if (mongoose.connection.readyState === 1 || (req.method === "GET" && NO_DB.test(req.path))) return next();
  try {
    connecting ??= mongoose.connect(config.mongoUri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
    await connecting;
    next();
  } catch (err) {
    connecting = null;
    console.error("MongoDB connection failed:", err.message);
    next(new AppError(503, "SERVER_ERROR", "Database is unavailable"));
  }
}

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());

  app.get("/api/health", async (_req, res) => {
    await ensureDb(_req, res, () => {}); // report the real state; never fail the health check itself
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
  });
  app.use("/api", ensureDb);
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

// Vercel's Express preset loads this file and expects the app as the default export.
export default createApp();
