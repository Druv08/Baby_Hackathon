import type { FutureSlug } from "./character";

/** A memory as returned to the public. Render every field as plain text. */
export interface PublicMemory {
  id: string;
  visitorName: string;
  message: string;
  formSlug: FutureSlug | null;
  createdAt: string;
}

export interface MemoriesResponse {
  memories: PublicMemory[];
  /** Pass as `?before=` to load older memories; `null` when there are no more. */
  nextCursor: string | null;
}

export interface MemorySubmission {
  visitorName: string;
  message: string;
  formSlug?: FutureSlug | null;
  /** Honeypot field; real visitors leave it empty. */
  website?: string;
}

export interface MemorySubmittedResponse {
  status: "received";
  message: string;
}

/** Recorded visits: one per browser session, not unique people. */
export interface VisitsResponse {
  count: number;
}

export type ApiErrorCode =
  | "invalid_json"
  | "unsupported_media_type"
  | "payload_too_large"
  | "validation_failed"
  | "rate_limited"
  | "unavailable"
  | "internal_error";

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Per-field messages for `validation_failed`. */
    fields?: Record<string, string>;
  };
}
