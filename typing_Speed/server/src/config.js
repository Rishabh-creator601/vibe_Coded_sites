import "dotenv/config";

const env = process.env;

export const config = {
  port: Number(env.PORT) || 5000,
  mongoUri: env.MONGODB_URI || "mongodb://127.0.0.1:27017/typing_speed",
  jwtSecret: env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: env.JWT_EXPIRES_IN || "7d",
  clientUrl: env.CLIENT_URL || "http://localhost:3000",
  isProd: env.NODE_ENV === "production",
  // A test can sit unstarted on the page this long before the first keystroke.
  testStartGraceSec: Number(env.TEST_START_GRACE_S) || 300,
};
