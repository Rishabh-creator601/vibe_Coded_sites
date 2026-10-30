import mongoose from "mongoose";
import { config } from "./config.js";
import { createApp } from "./app.js";
import TestAttempt from "./models/TestAttempt.js";

// Tests still "started" after an hour were never finished.
const cleanupStale = () =>
  TestAttempt.updateMany({ status: "started", startedAt: { $lt: new Date(Date.now() - 3600 * 1000) } }, { status: "abandoned" }).catch((e) =>
    console.error("cleanup failed", e.message),
  );

await mongoose.connect(config.mongoUri);
console.log("MongoDB connected");
await cleanupStale();
setInterval(cleanupStale, 3600 * 1000).unref();

createApp().listen(config.port, () => console.log(`API on http://localhost:${config.port}/api`));
