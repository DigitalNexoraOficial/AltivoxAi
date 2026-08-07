/**
 * Review token crypto (Bloque 6 · ADR-016).
 * Plaintext never persisted; only SHA-256 hash stored.
 */

import { createHash, randomBytes } from "node:crypto";

/** Generate a URL-safe high-entropy token (plaintext, return once). */
export function generateReviewTokenPlaintext(): string {
  return randomBytes(32).toString("base64url");
}

/** Hash plaintext for storage / lookup. */
export function hashReviewToken(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

export function isExpired(expiresAtIso: string, now = new Date()): boolean {
  const t = Date.parse(expiresAtIso);
  if (Number.isNaN(t)) return true;
  return t <= now.getTime();
}
