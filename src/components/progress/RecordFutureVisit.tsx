"use client";

import { useEffect } from "react";

import { progressStore } from "@/lib/progress/store";

/** Marks a future as discovered when its page is opened. Renders nothing. */
export function RecordFutureVisit({ futureId }: { futureId: number }) {
  useEffect(() => {
    progressStore.discoverFuture(futureId);
  }, [futureId]);
  return null;
}
