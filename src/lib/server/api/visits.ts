import "server-only";

import { z } from "zod";

import type { VisitsResponse } from "@/types/api";
import type { Backend } from "../backend";
import { errorResponse, getClientIp, jsonResponse, logServerError, readJsonBody } from "../http";
import { checkRateLimits, hashClientKey, RATE_RULES } from "../rate-limit";

const VISIT_BODY_MAX_BYTES = 256;

/** `visitId` is a random UUID the browser creates once per session. */
const visitBodySchema = z.object({
  visitId: z.uuid({ error: "visitId must be a UUID" }),
});

export function createVisitsHandlers(getBackend: () => Backend | null) {
  return {
    /** GET /api/visits — current recorded-visit count. */
    async GET(): Promise<Response> {
      const backend = getBackend();
      if (!backend) return errorResponse("unavailable");
      try {
        const body: VisitsResponse = { count: await backend.counters.getVisits() };
        return jsonResponse(body);
      } catch (error) {
        logServerError("read visits", error);
        return errorResponse("unavailable");
      }
    },

    /** POST /api/visits { visitId } — idempotent per visitId. */
    async POST(request: Request): Promise<Response> {
      const body = await readJsonBody(request, VISIT_BODY_MAX_BYTES);
      if (!body.ok) return body.response;

      const parsed = visitBodySchema.safeParse(body.value);
      if (!parsed.success) {
        return errorResponse("validation_failed", { fields: { visitId: "visitId must be a UUID" } });
      }

      const backend = getBackend();
      if (!backend) return errorResponse("unavailable");

      const clientKey = hashClientKey(getClientIp(request), backend.rateLimitSecret);
      const rate = await checkRateLimits([RATE_RULES.visitPerIp], clientKey, backend.rateLimits);
      if (rate === "limited") return errorResponse("rate_limited", { retryAfterSeconds: 3600 });
      if (rate === "unavailable") return errorResponse("unavailable");

      try {
        const body: VisitsResponse = { count: await backend.counters.recordVisit(parsed.data.visitId.toLowerCase()) };
        return jsonResponse(body);
      } catch (error) {
        logServerError("record visit", error);
        return errorResponse("unavailable");
      }
    },
  };
}
