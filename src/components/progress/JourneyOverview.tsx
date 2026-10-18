"use client";

import Link from "next/link";

import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import styles from "./JourneyOverview.module.css";

export interface JourneyFuture {
  id: number;
  slug: string;
  label: string;
  icon: string;
  profession: string;
}

/** Visitor's saved progress across the eight futures. */
export function JourneyOverview({ futures }: { futures: JourneyFuture[] }) {
  const { hydrated, progress, welcomeMessage, discoveredCount, completedCount, secretCount } = useJourneyProgress();

  if (!hydrated) {
    return (
      <p className={styles.loading} role="status">
        Opening your journey map…
      </p>
    );
  }

  const stats = [
    { label: "Futures explored", value: discoveredCount, icon: "🗺️" },
    { label: "Stories finished", value: completedCount, icon: "📖" },
    { label: "Secrets found", value: secretCount, icon: "✨" },
  ];

  return (
    <div className={styles.wrap}>
      <p className={styles.welcome}>
        {welcomeMessage ?? "Your journey is just beginning. Pick any future to start exploring!"}
      </p>

      <dl className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <dt>
              <span aria-hidden="true">{s.icon} </span>
              {s.label}
            </dt>
            <dd>
              {s.value} <span className={styles.of}>/ 8</span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className={styles.futures}>
        {futures.map((f) => {
          const visited = (progress.discoveredForms as number[]).includes(f.id);
          const finished = (progress.completedStories as number[]).includes(f.id);
          const status = finished ? "Story finished" : visited ? "Visited" : "Not visited yet";
          return (
            <li key={f.slug}>
              <Link href={`/futures/${f.slug}`} className={styles.future} data-visited={visited}>
                <span className={styles.futureIcon} aria-hidden="true">
                  {f.icon}
                </span>
                <span className={styles.futureText}>
                  <strong>{f.label}</strong>
                  <span>{f.profession}</span>
                </span>
                <span className="badge">{status}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
