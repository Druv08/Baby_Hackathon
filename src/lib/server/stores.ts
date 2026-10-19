import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PublicMemory } from "@/types/api";
import type { FutureSlug } from "@/types/character";

/**
 * Storage interfaces used by the API handlers. The Supabase implementations
 * live below; tests substitute in-memory fakes.
 */
export interface MemoryStore {
  /** Approved memories only, newest first, strictly older than `before`. */
  listApproved(query: { limit: number; before?: string }): Promise<PublicMemory[]>;
  /** Publishes a validated submission straight away (`approved`). */
  insertApproved(memory: { visitorName: string; message: string; formSlug: FutureSlug | null }): Promise<void>;
}

export interface CounterStore {
  getVisits(): Promise<number>;
  /** Atomically records a visit; repeating a token never double-counts. */
  recordVisit(token: string): Promise<number>;
}

export interface RateLimitStore {
  /** Counts one hit; resolves `true` if still within `limit` for the window. */
  consume(bucket: string, limit: number, windowSeconds: number): Promise<boolean>;
}

export const SITE_VISITS_KEY = "site_visits";

interface MemoryRow {
  id: string;
  visitor_name: string;
  message: string;
  form_slug: FutureSlug | null;
  created_at: string;
}

/** Explicit public column list — never `select *`. */
const PUBLIC_MEMORY_COLUMNS = "id, visitor_name, message, form_slug, created_at";

export function createSupabaseClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function createSupabaseStores(db: SupabaseClient): {
  memories: MemoryStore;
  counters: CounterStore;
  rateLimits: RateLimitStore;
} {
  return {
    memories: {
      async listApproved({ limit, before }) {
        let query = db
          .from("memories")
          .select(PUBLIC_MEMORY_COLUMNS)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(limit);
        if (before) query = query.lt("created_at", before);
        const { data, error } = await query.returns<MemoryRow[]>();
        if (error) throw error;
        return data.map((row) => ({
          id: row.id,
          visitorName: row.visitor_name,
          message: row.message,
          formSlug: row.form_slug,
          createdAt: row.created_at,
        }));
      },
      async insertApproved({ visitorName, message, formSlug }) {
        const { error } = await db
          .from("memories")
          .insert({ visitor_name: visitorName, message, form_slug: formSlug, status: "approved" });
        if (error) throw error;
      },
    },
    counters: {
      async getVisits() {
        const { data, error } = await db
          .from("site_counters")
          .select("counter_value")
          .eq("counter_key", SITE_VISITS_KEY)
          .single<{ counter_value: number | string }>();
        if (error) throw error;
        return Number(data.counter_value);
      },
      async recordVisit(token) {
        const { data, error } = await db.rpc("record_visit", { p_token: token, p_counter_key: SITE_VISITS_KEY });
        if (error) throw error;
        return Number(data);
      },
    },
    rateLimits: {
      async consume(bucket, limit, windowSeconds) {
        const { data, error } = await db.rpc("consume_rate_limit", {
          p_bucket: bucket,
          p_limit: limit,
          p_window_seconds: windowSeconds,
        });
        if (error) throw error;
        return data === true;
      },
    },
  };
}
