import type { PublicMemory } from "@/types/api";
import type { Backend } from "../backend";
import { createMemoryRateLimitStore } from "../rate-limit";

/** In-memory backend for API tests. Mirrors the database's rules. */
export interface StoredMemory extends PublicMemory {
  status: "pending" | "approved" | "rejected";
}

export function createTestBackend() {
  const memories: StoredMemory[] = [];
  const tokens = new Set<string>();
  const state = { visits: 0, fail: false, failRateLimit: false };
  const shared = createMemoryRateLimitStore();

  const guard = () => {
    if (state.fail) throw Object.assign(new Error("connection to db.secret-host:5432 failed, key=sk_live_SECRET"), { code: "ECONNREFUSED" });
  };

  const backend: Backend = {
    memories: {
      async listApproved({ limit, before }) {
        guard();
        return memories
          .filter((m) => m.status === "approved" && (!before || m.createdAt < before))
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
          .slice(0, limit)
          // Return the full stored row (incl. status) to prove the handler strips it.
          .map((m) => ({ ...m }));
      },
      async insertApproved({ visitorName, message, formSlug }) {
        guard();
        memories.push({
          id: crypto.randomUUID(),
          visitorName,
          message,
          formSlug,
          createdAt: new Date(Date.UTC(2026, 9, 18, 12, 0, memories.length)).toISOString(),
          status: "approved",
        });
      },
    },
    counters: {
      async getVisits() {
        guard();
        return state.visits;
      },
      async recordVisit(token) {
        guard();
        if (!tokens.has(token)) {
          tokens.add(token);
          state.visits += 1;
        }
        return state.visits;
      },
    },
    rateLimits: {
      local: createMemoryRateLimitStore(),
      shared: {
        consume: (bucket, limit, windowSeconds) => {
          if (state.failRateLimit) return Promise.reject(new Error("rate limit store down"));
          return shared.consume(bucket, limit, windowSeconds);
        },
      },
    },
    rateLimitSecret: "test-secret",
  };

  return { backend, memories, tokens, state };
}

export function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
