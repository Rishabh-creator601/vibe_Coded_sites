import { defineConfig } from "vitest/config";

// Tests run against a real MongoDB in a throwaway database (dropped before and after).
// Locally that's the MongoDB on this machine; set MONGODB_TEST_URI to use another one.
export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: "test",
      MONGODB_URI: process.env.MONGODB_TEST_URI ?? "mongodb://127.0.0.1:27017/saffron_and_steam_test",
      DEMO_MODE: "true",
      AUTO_SEED: "false",
    },
  },
});
