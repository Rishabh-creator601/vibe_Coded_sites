import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Guests open their order or booking with a random token in the link (PLAN.md 13), so
 * references can't be guessed. Only the token's SHA-256 hash is stored.
 */
export function newToken(): { token: string; hash: string } {
  const token = randomBytes(18).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(token: unknown, hash: string): boolean {
  if (typeof token !== "string" || token.length === 0) return false;
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True for MongoDB's duplicate-key error (E11000). */
export function isDuplicateKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}
