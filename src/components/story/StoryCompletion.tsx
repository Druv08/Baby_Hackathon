"use client";

import { useEffect, useRef } from "react";

import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import styles from "./StoryCompletion.module.css";

/**
 * Marks a story complete once the visitor actually reaches its final scene
 * (this element is at least half visible). Opening the hero never does.
 */
export function StoryCompletion({ futureId }: { futureId: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { hydrated, isStoryComplete, completeStory } = useJourneyProgress();
  const done = hydrated && isStoryComplete(futureId);

  useEffect(() => {
    const el = ref.current;
    if (!el || done || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          completeStory(futureId);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, futureId, completeStory]);

  return (
    <p ref={ref} className={styles.note} role="status" data-done={done}>
      {done ? (
        <>
          <span aria-hidden="true">📖✓ </span>Story complete — saved to My Journey
        </>
      ) : (
        <span className="visually-hidden">Final scene</span>
      )}
    </p>
  );
}
