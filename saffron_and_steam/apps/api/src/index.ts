import { createApp } from "./app";
import { env } from "./config/env";
import { connectDb, disconnectDb } from "./db";
import { seedIfEmpty } from "./seed/seed";

try {
  await connectDb(env.MONGODB_URI);
} catch (err) {
  console.error(`[api] Can't reach MongoDB at ${env.MONGODB_URI.replace(/\/\/[^@]*@/, "//***@")}. Is it running?`);
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
if (env.AUTO_SEED && (await seedIfEmpty())) console.log("[api] Empty database: loaded the sample menu and settings.");

const server = createApp().listen(env.PORT, () => {
  console.log(`[api] Saffron & Steam API on http://localhost:${env.PORT}/api/v1 (demo mode ${env.DEMO_MODE ? "on" : "off"})`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => void disconnectDb().then(() => process.exit(0)));
  });
}
