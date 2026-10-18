import type {
  ApiErrorResponse,
  MemoriesResponse,
  MemorySubmission,
  MemorySubmittedResponse,
  VisitsResponse,
} from "@/types/api";

/** Typed browser helpers for the public API. Never throws on HTTP errors. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: ApiErrorResponse["error"] };

async function request<T>(input: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, init);
    const body = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: body as T };
    return {
      ok: false,
      status: res.status,
      error: (body as ApiErrorResponse | null)?.error ?? { code: "internal_error", message: "Something went wrong." },
    };
  } catch {
    return { ok: false, status: 0, error: { code: "unavailable", message: "You appear to be offline." } };
  }
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function fetchMemories(options: { limit?: number; before?: string } = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(options.limit));
  if (options.before) params.set("before", options.before);
  const qs = params.toString();
  return request<MemoriesResponse>(`/api/memories${qs ? `?${qs}` : ""}`);
}

export function submitMemory(submission: MemorySubmission) {
  return request<MemorySubmittedResponse>("/api/memories", json(submission));
}

export function fetchVisitCount() {
  return request<VisitsResponse>("/api/visits");
}

export function recordVisit(visitId: string) {
  return request<VisitsResponse>("/api/visits", json({ visitId }));
}
