// Vercel serverless entry: the same Express app, with the MongoDB connection cached between invocations.
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import { config } from "../src/config.js";

const app = createApp();
let connecting = null;

export default async function handler(req, res) {
  try {
    connecting ??= mongoose.connect(config.mongoUri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
    await connecting;
  } catch (err) {
    connecting = null;
    console.error("MongoDB connection failed:", err.message);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Database is unavailable" } });
  }
  return app(req, res);
}
