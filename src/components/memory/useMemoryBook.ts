"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchMemories } from "@/lib/api-client";
import { mergePages } from "@/lib/memories/book";
import type { PublicMemory } from "@/types/api";

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
