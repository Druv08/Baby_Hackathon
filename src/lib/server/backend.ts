import "server-only";

import { getServerConfig } from "./env";
import { createMemoryRateLimitStore } from "./rate-limit";
import {
  createSupabaseClient,
  createSupabaseStores,
  type CounterStore,
  type MemoryStore,
  type RateLimitStore,
} from "./stores";

export interface Backend {
  memories: MemoryStore;
  counters: CounterStore;
  rateLimits: { local: RateLimitStore; shared: RateLimitStore };
  /** Turns a client IP into a pseudonymous rate-limit key. */
  rateLimitSecret: string;
}

let cached: Backend | null | undefined;

/** Lazily builds the Supabase-backed backend; `null` when not configured. */
export function getBackend(): Backend | null {
  if (cached !== undefined) return cached;
  const config = getServerConfig();
  if (!config) return (cached = null);
  const stores = createSupabaseStores(createSupabaseClient(config.supabaseUrl, config.supabaseServiceRoleKey));
  cached = {
    memories: stores.memories,
    counters: stores.counters,
    rateLimits: { local: createMemoryRateLimitStore(), shared: stores.rateLimits },
    rateLimitSecret: config.rateLimitSecret,
  };
  return cached;
}
