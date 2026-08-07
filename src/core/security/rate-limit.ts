/**
 * Durable rate limiting (Upstash). Fail-closed in production if misconfigured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitBucket =
  | "lead"
  | "chat"
  | "login"
  | "n8n"
  | "ops"
  | "review";

type LimitResult = { success: boolean; reason?: string };

const memoryBuckets = new Map<string, { count: number; start: number }>();

function memoryLimit(
  key: string,
  max: number,
  windowMs: number
): LimitResult {
  const now = Date.now();
  const entry = memoryBuckets.get(key) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  memoryBuckets.set(key, entry);
  return entry.count <= max
    ? { success: true }
    : { success: false, reason: "rate_limited" };
}

function mode(): "upstash" | "memory" {
  const forced = String(process.env.RATE_LIMIT_MODE || "").toLowerCase();
  if (forced === "memory" || forced === "upstash") return forced;
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return "upstash";
  }
  return process.env.NODE_ENV === "production" ? "upstash" : "memory";
}

const LIMITS: Record<
  RateLimitBucket,
  { max: number; windowMs: number; prefix: string }
> = {
  lead: { max: 5, windowMs: 10 * 60 * 1000, prefix: "rl:lead" },
  chat: { max: 10, windowMs: 60 * 1000, prefix: "rl:chat" },
  login: { max: 40, windowMs: 15 * 60 * 1000, prefix: "rl:login" },
  n8n: { max: 60, windowMs: 60 * 1000, prefix: "rl:n8n" },
  ops: { max: 180, windowMs: 60 * 1000, prefix: "rl:ops" },
  review: { max: 60, windowMs: 60 * 1000, prefix: "rl:review" },
};

let redis: Redis | null = null;
const limiters = new Map<RateLimitBucket, Ratelimit>();

function getLimiter(bucket: RateLimitBucket): Ratelimit | null {
  if (mode() !== "upstash") return null;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redis) redis = new Redis({ url, token });
  let lim = limiters.get(bucket);
  if (!lim) {
    const cfg = LIMITS[bucket];
    lim = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        cfg.max,
        `${Math.ceil(cfg.windowMs / 1000)} s`
      ),
      prefix: cfg.prefix,
      analytics: false,
    });
    limiters.set(bucket, lim);
  }
  return lim;
}

export async function rateLimit(
  bucket: RateLimitBucket,
  identity: string
): Promise<LimitResult> {
  const cfg = LIMITS[bucket];
  const key = `${bucket}:${identity || "unknown"}`;
  const m = mode();

  if (m === "memory") {
    return memoryLimit(key, cfg.max, cfg.windowMs);
  }

  const lim = getLimiter(bucket);
  if (!lim) {
    // Production without Upstash: fail closed for public abuse surfaces
    if (process.env.NODE_ENV === "production") {
      return { success: false, reason: "rate_limit_unconfigured" };
    }
    return memoryLimit(key, cfg.max, cfg.windowMs);
  }

  try {
    const res = await lim.limit(key);
    return res.success
      ? { success: true }
      : { success: false, reason: "rate_limited" };
  } catch {
    if (process.env.NODE_ENV === "production") {
      return { success: false, reason: "rate_limit_error" };
    }
    return memoryLimit(key, cfg.max, cfg.windowMs);
  }
}

export function clientIpFromHeaders(headers: Headers): string {
  const xf = String(headers.get("x-forwarded-for") || "")
    .split(",")[0]
    .trim();
  return xf || "unknown";
}
