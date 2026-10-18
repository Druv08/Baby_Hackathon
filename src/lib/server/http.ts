import "server-only";

import type { ApiErrorCode, ApiErrorResponse } from "@/types/api";

const NO_STORE = { "Cache-Control": "no-store" };

export function jsonResponse<T>(body: T, status = 200, headers: Record<string, string> = NO_STORE): Response {
  return Response.json(body, {
    status,
    headers: { ...headers, "X-Content-Type-Options": "nosniff" },
  });
}

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_json: "The request body must be valid JSON.",
  unsupported_media_type: "Send the request as application/json.",
  payload_too_large: "The request is too large.",
  validation_failed: "Some fields need another look.",
  rate_limited: "Too many requests. Please wait a little and try again.",
  unavailable: "This feature is resting right now. Please try again later.",
  internal_error: "Something went wrong. Please try again later.",
};

const STATUS: Record<ApiErrorCode, number> = {
  invalid_json: 400,
  unsupported_media_type: 415,
  payload_too_large: 413,
  validation_failed: 400,
  rate_limited: 429,
  unavailable: 503,
  internal_error: 500,
};

/** Error responses carry only fixed, user-safe messages — never raw errors. */
export function errorResponse(
  code: ApiErrorCode,
  extra: { fields?: Record<string, string>; retryAfterSeconds?: number } = {},
): Response {
  const body: ApiErrorResponse = { error: { code, message: DEFAULT_MESSAGES[code] } };
  if (extra.fields) body.error.fields = extra.fields;
  const headers: Record<string, string> = { ...NO_STORE };
  if (extra.retryAfterSeconds) headers["Retry-After"] = String(extra.retryAfterSeconds);
  return jsonResponse(body, STATUS[code], headers);
}

/** Logs server-side without echoing request content. */
export function logServerError(context: string, error: unknown): void {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined;
  const name = error instanceof Error ? error.name : typeof error;
  console.error(`[api] ${context} failed`, { name, code });
}

export type BodyResult = { ok: true; value: unknown } | { ok: false; response: Response };

/**
 * Reads a JSON body with a hard byte cap, enforced while streaming so a
 * missing or false Content-Length can't bypass it.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<BodyResult> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(contentType)) {
    return { ok: false, response: errorResponse("unsupported_media_type") };
  }
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, response: errorResponse("payload_too_large") };
  }
  if (!request.body) return { ok: false, response: errorResponse("invalid_json") };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => {});
      return { ok: false, response: errorResponse("payload_too_large") };
    }
    chunks.push(value);
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, response: errorResponse("invalid_json") };
  }
}

/** Client IP from the platform proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}
