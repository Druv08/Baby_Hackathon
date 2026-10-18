"use client";

import { useEffect, useState } from "react";

import { fetchVisitCount, recordVisit } from "@/lib/api-client";

const SESSION_KEY = "maria:visit-id";
const RECORDED_KEY = "maria:visit-recorded";

/**
 * Records one visit per browser session and returns the site's visit count
 * (`null` while loading or if the counter is unavailable — hide it then).
 *
 * The session's visitId is saved before the request, so React Strict Mode
 * double effects, rerenders, reloads and retries all reuse the same ID and
 * the server counts it once.
 */
let pending: Promise<number | null> | null = null;

function loadCount(): Promise<number | null> {
  return (pending ??= (async () => {
    let visitId: string | null = null;
    let alreadyRecorded = false;
    try {
      alreadyRecorded = sessionStorage.getItem(RECORDED_KEY) === "1";
      visitId = sessionStorage.getItem(SESSION_KEY);
      if (!visitId) {
        visitId = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, visitId);
      }
    } catch {
      // Storage blocked: still count once per page load via `pending`.
      visitId ??= crypto.randomUUID();
    }

    if (alreadyRecorded) {
      const result = await fetchVisitCount();
      return result.ok ? result.data.count : null;
    }
    // A failed attempt is retried on the next load with the same visitId.
    const result = await recordVisit(visitId);
    if (!result.ok) return null;
    try {
      sessionStorage.setItem(RECORDED_KEY, "1");
    } catch {
      // ignore
    }
    return result.data.count;
  })());
}

export function useVisitCounter(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    loadCount().then((c) => active && setCount(c));
    return () => {
      active = false;
    };
  }, []);
  return count;
}
