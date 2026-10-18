import "server-only";

import { createHmac } from "node:crypto";

import type { RateLimitStore } from "./stores";

export interface RateRule {
  /** Bucket name prefix, e.g. `memories:ip`. */
  name: string;
  limit: number;
  windowSeconds: number;
  /** `ip` = per client, `global` = across all clients. */
  scope: "ip" | "global";
}

export const RATE_RULES = {
  memoryPerIpBurst: { name: "memories:ip:10m", limit: 3, windowSeconds: 600, scope: "ip" },
  memoryPerIpDaily: { name: "memories:ip:1d", limit: 10, windowSeconds: 86_400, scope: "ip" },
  memoryGlobal: { name: "memories:global:1h", limit: 300, windowSeconds: 3_600, scope: "global" },
  visitPerIp: { name: "visits:ip:1h", limit: 30, windowSeconds: 3_600, scope: "ip" },
} as const satisfies Record<string, RateRule>;

/** Pseudonymous client key: raw IPs are never stored. */
export function hashClientKey(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("base64url").slice(0, 22);
}

/**
 * Best-effort per-instance limiter. It only cuts obvious floods before they
 * reach the database; the shared database limiter is authoritative because
 * serverless instances don't share memory.
 */
export function createMemoryRateLimitStore(maxBuckets = 10_000, now: () => number = Date.now): RateLimitStore {
  const buckets = new Map<string, { start: number; hits: number }>();
  return {
    async consume(bucket, limit, windowSeconds) {
      const t = now();
      const windowMs = windowSeconds * 1000;
      let entry = buckets.get(bucket);
      if (!entry || t - entry.start >= windowMs) {
        if (buckets.size >= maxBuckets) {
          for (const [key, value] of buckets) if (t - value.start >= windowMs) buckets.delete(key);
          if (buckets.size >= maxBuckets) buckets.clear();
        }
        entry = { start: t, hits: 0 };
        buckets.set(bucket, entry);
      }
      entry.hits += 1;
      return entry.hits <= limit;
    },
  };
}

export type RateLimitOutcome = "allowed" | "limited" | "unavailable";

/**
 * Checks every rule against the local limiter, then the shared one.
 * Fails closed: if the shared limiter errors, the write is refused.
 */
export async function checkRateLimits(
  rules: readonly RateRule[],
  clientKey: string,
  stores: { local: RateLimitStore; shared: RateLimitStore },
): Promise<RateLimitOutcome> {
  const bucketFor = (rule: RateRule) => (rule.scope === "ip" ? `${rule.name}:${clientKey}` : rule.name);

  for (const rule of rules) {
    if (!(await stores.local.consume(bucketFor(rule), rule.limit, rule.windowSeconds))) return "limited";
  }
  try {
    for (const rule of rules) {
      if (!(await stores.shared.consume(bucketFor(rule), rule.limit, rule.windowSeconds))) return "limited";
    }
  } catch {
    return "unavailable";
  }
  return "allowed";
}
