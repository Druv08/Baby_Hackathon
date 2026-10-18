import { z } from "zod";

import { CHARACTER_SLUGS, type FutureSlug } from "@/types/character";

export const MEMORY_LIMITS = {
  visitorNameMax: 40,
  messageMax: 280,
  /** Max request body for POST /api/memories, in bytes. */
  bodyMaxBytes: 2048,
  pageSizeDefault: 20,
  pageSizeMax: 50,
} as const;

export const FUTURE_SLUGS = CHARACTER_SLUGS.filter((s): s is FutureSlug => s !== "normal");

/** Length in user-perceived code points, matching Postgres `char_length`. */
const codePoints = (s: string) => [...s].length;

// Letters (any script), combining marks, digits, spaces and . ' - _
const NAME_PATTERN = /^[\p{L}\p{M}\p{N} .'\-_]+$/u;
// Links are the main spam vector; a child's memory doesn't need them.
const LINK_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|info|biz)\b)/i;

function normalizeName(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function normalizeMessage(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ") // collapse spaces/tabs, keep newlines
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f​-‏‪-‮⁦-⁩]/g, "") // control & bidi chars
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const memorySubmissionSchema = z.object({
  visitorName: z
    .string({ error: "Please tell Maria your name." })
    .transform(normalizeName)
    .refine((v) => v.length > 0, "Please tell Maria your name.")
    .refine((v) => codePoints(v) <= MEMORY_LIMITS.visitorNameMax, `Names can be up to ${MEMORY_LIMITS.visitorNameMax} characters.`)
    .refine((v) => NAME_PATTERN.test(v), "Names can use letters, numbers, spaces and . ' - _"),
  message: z
    .string({ error: "Please write a memory for Maria." })
    .transform(normalizeMessage)
    .refine((v) => v.length > 0, "Please write a memory for Maria.")
    .refine((v) => codePoints(v) <= MEMORY_LIMITS.messageMax, `Memories can be up to ${MEMORY_LIMITS.messageMax} characters.`)
    .refine((v) => !LINK_PATTERN.test(v), "Links aren't allowed in memories."),
  formSlug: z
    .enum(FUTURE_SLUGS, { error: "Unknown future." })
    .nullish()
    .transform((v) => v ?? null),
  /** Honeypot: hidden in the form; real visitors leave it empty. */
  website: z.string().max(200).optional(),
});

export type ValidMemorySubmission = z.output<typeof memorySubmissionSchema>;

export const memoryListQuerySchema = z.object({
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int("limit must be a whole number")
    .min(1, "limit must be at least 1")
    .max(MEMORY_LIMITS.pageSizeMax, `limit can be at most ${MEMORY_LIMITS.pageSizeMax}`)
    .default(MEMORY_LIMITS.pageSizeDefault),
  before: z.iso.datetime({ offset: true, error: "before must be an ISO timestamp" }).optional(),
});

/** Flattens Zod issues into `{ field: firstMessage }`. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "body";
    fields[key] ??= issue.message;
  }
  return fields;
}
