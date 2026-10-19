import "server-only";

import { fieldErrors, MEMORY_LIMITS, memoryListQuerySchema, memorySubmissionSchema } from "@/lib/memories/validation";
import type { MemoriesResponse, MemorySubmittedResponse } from "@/types/api";
import type { Backend } from "../backend";
import { errorResponse, getClientIp, jsonResponse, logServerError, readJsonBody } from "../http";
import { checkRateLimits, hashClientKey, RATE_RULES } from "../rate-limit";

const RECEIVED: MemorySubmittedResponse = {
  status: "received",
  message: "Thank you! Your memory is now glowing in Maria's Memory Book.",
};

const MEMORY_RULES = [RATE_RULES.memoryPerIpBurst, RATE_RULES.memoryPerIpDaily, RATE_RULES.memoryGlobal];

export function createMemoriesHandlers(getBackend: () => Backend | null) {
  return {
    /** GET /api/memories?limit=20&before=<ISO timestamp> */
    async GET(request: Request): Promise<Response> {
      const params = new URL(request.url).searchParams;
      const query = memoryListQuerySchema.safeParse({
        limit: params.get("limit") ?? undefined,
        before: params.get("before") ?? undefined,
      });
      if (!query.success) return errorResponse("validation_failed", { fields: fieldErrors(query.error) });

      const backend = getBackend();
      if (!backend) return errorResponse("unavailable");

      try {
        // Fetch one extra row to know whether another page exists.
        const rows = await backend.memories.listApproved({ limit: query.data.limit + 1, before: query.data.before });
        const page = rows.slice(0, query.data.limit);
        const body: MemoriesResponse = {
          // Re-map explicitly so only public fields can ever leave the server.
          memories: page.map(({ id, visitorName, message, formSlug, createdAt }) => ({
            id,
            visitorName,
            message,
            formSlug,
            createdAt,
          })),
          nextCursor: rows.length > query.data.limit ? (page.at(-1)?.createdAt ?? null) : null,
        };
        return jsonResponse(body, 200, { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" });
      } catch (error) {
        logServerError("list memories", error);
        return errorResponse("unavailable");
      }
    },

    /** POST /api/memories — validates, rate-limits and publishes a memory (auto-approved). */
    async POST(request: Request): Promise<Response> {
      const body = await readJsonBody(request, MEMORY_LIMITS.bodyMaxBytes);
      if (!body.ok) return body.response;

      const parsed = memorySubmissionSchema.safeParse(body.value);
      if (!parsed.success) return errorResponse("validation_failed", { fields: fieldErrors(parsed.error) });

      const backend = getBackend();
      if (!backend) return errorResponse("unavailable");

      const clientKey = hashClientKey(getClientIp(request), backend.rateLimitSecret);
      const rate = await checkRateLimits(MEMORY_RULES, clientKey, backend.rateLimits);
      if (rate === "limited") return errorResponse("rate_limited", { retryAfterSeconds: 600 });
      if (rate === "unavailable") return errorResponse("unavailable");

      // Honeypot filled in: answer like a success, store nothing.
      if (parsed.data.website) return jsonResponse(RECEIVED, 202);

      try {
        await backend.memories.insertApproved({
          visitorName: parsed.data.visitorName,
          message: parsed.data.message,
          formSlug: parsed.data.formSlug,
        });
        return jsonResponse(RECEIVED, 202);
      } catch (error) {
        logServerError("insert memory", error);
        return errorResponse("unavailable");
      }
    },
  };
}
