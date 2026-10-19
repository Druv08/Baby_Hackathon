"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchMemories, submitMemory } from "@/lib/api-client";
import { mergePages, sendErrorMessage } from "@/lib/memories/book";
import { fieldErrors, memorySubmissionSchema } from "@/lib/memories/validation";
import type { PublicMemory } from "@/types/api";
import type { FutureSlug } from "@/types/character";

export type LoadState = "idle" | "loading" | "ready" | "error";

/** Tracks whether the component is still mounted, so late responses are ignored. */
export function useMounted() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}

/**
 * Approved memories from the shared Memory Book, newest first, with
 * cursor pagination. Used by the Memory Book page and Luna's book.
 */
export function useMemoryFeed(pageSize: number) {
  const [memories, setMemories] = useState<PublicMemory[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [load, setLoad] = useState<LoadState>("idle");
  const mounted = useMounted();

  const loadPage = useCallback(
    async (before?: string): Promise<PublicMemory[] | null> => {
      setLoad("loading");
      const result = await fetchMemories({ limit: pageSize, before });
      if (!mounted.current) return null;
      if (!result.ok) {
        setLoad("error");
        return null;
      }
      setMemories((prev) => (before ? mergePages(prev, result.data.memories) : result.data.memories));
      setCursor(result.data.nextCursor);
      setLoad("ready");
      return result.data.memories;
    },
    [pageSize, mounted],
  );

  return { memories, cursor, load, loadPage, loadMore: () => (cursor ? loadPage(cursor) : Promise.resolve(null)) };
}

export type SendState = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * The "leave a memory" form state. Checks the same rules as the server, then
 * sends through the moderated API, where the memory waits as `pending`. A
 * successful send never adds it to the visible lanterns.
 */
export function useMemorySubmit() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [future, setFuture] = useState<FutureSlug | "">("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [send, setSend] = useState<SendState>({ kind: "idle" });
  const busy = useRef(false);
  const mounted = useMounted();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return; // one send at a time, however fast the clicks
    const parsed = memorySubmissionSchema.safeParse({ visitorName: name, message, formSlug: future || null, website });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setSend({ kind: "idle" });
      return;
    }
    busy.current = true;
    setErrors({});
    setSend({ kind: "sending" });
    const result = await submitMemory({
      visitorName: parsed.data.visitorName,
      message: parsed.data.message,
      formSlug: parsed.data.formSlug,
      ...(website ? { website } : {}),
    });
    busy.current = false;
    if (!mounted.current) return;
    if (result.ok) {
      setSend({ kind: "sent" });
      setMessage("");
      return;
    }
    if (result.error.fields) setErrors(result.error.fields);
    setSend({ kind: "error", message: sendErrorMessage(result.status, result.error.message) });
  }

  return { name, setName, message, setMessage, future, setFuture, website, setWebsite, errors, send, submit };
}
