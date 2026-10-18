"use client";

import { useEffect, useState } from "react";

import styles from "./StoryProgress.module.css";

/** Sticky "Scene 1 → 5" indicator; each step links to its scene. */
export function StoryProgress({ scenes }: { scenes: { id: number; title: string }[] }) {
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(Number((e.target as HTMLElement).dataset.scene), e.intersectionRatio);
        let best: number | null = null;
        let bestRatio = 0.15;
        for (const [id, ratio] of visible) if (ratio > bestRatio) [best, bestRatio] = [id, ratio];
        setCurrent(best);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 1] },
    );
    document.querySelectorAll<HTMLElement>("[data-scene]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={styles.progress} aria-label="Story progress">
      <ol>
        {scenes.map((s) => (
          <li key={s.id}>
            <a href={`#scene-${s.id}`} aria-current={current === s.id ? "step" : undefined} data-done={current !== null && s.id < current}>
              <span className={styles.dot} aria-hidden="true">
                {s.id}
              </span>
              <span className={styles.label}>{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
