import { z } from "zod";

// Reads apps/api/.env if there is one (variables already set in the shell win), then
// checks every setting. The API refuses to start if one is missing or wrong.
try {
  process.loadEnvFile(new URL("../../.env", import.meta.url));
} catch {
  // No .env file: rely on the shell / host environment.
}

const bool = z.enum(["true", "false"]).transform((v) => v === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, "must start with mongodb:// or mongodb+srv://"),
  /** The web app's origin, the only one CORS lets in. */
  WEB_URL: z.url().default("http://localhost:3000"),
  /** Express "trust proxy": how many proxies (Next.js rewrite, Render) sit in front. */
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  /**
   * Demo behaviour until the admin board and Razorpay exist: order statuses move on by
   * themselves, and POST …/demo-payment marks an order or booking as paid.
   */
  DEMO_MODE: bool.default(true),
  /** Load the sample menu and settings on start-up when the database is empty. */
  AUTO_SEED: bool.default(true),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid API settings (see apps/api/.env.example):");
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
