"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
  const { hydrated, progress, welcomeMessage, discoveredCount, completedCount, secretCount, setVisitorName, secretEnding, foundSecrets } = useJourneyProgress();
  const [name, setName] = useState<string | null>(null);
  const [savedName, setSavedName] = useState(false);

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
      <form className="journey-name" noValidate onSubmit={event => { event.preventDefault(); setVisitorName(name ?? progress.visitorName); setSavedName(true); }}>
        <label htmlFor="journey-name">What should Maria call you? (optional)</label>
        <div><input id="journey-name" autoComplete="nickname" maxLength={30} value={name ?? progress.visitorName ?? ""} onChange={event => { setName(event.target.value); setSavedName(false); }} /><button className="btn btn-secondary" type="submit">Remember my name</button></div>
        <p role="status">{savedName ? "Saved on this device. Your other progress is safe." : "Your name stays on this device."}</p>
      </form>
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
      {secretEnding && <section id="secret-ending" className={styles.ending} aria-labelledby="ending-title">
        <p className="eyebrow">{secretEnding.counterLabel}</p>
        <h2 id="ending-title">{secretEnding.title}</h2>
        <Image src={secretEnding.characterImage} alt="Normal Maria: all eight futures are part of the same little dreamer" width={240} height={320} sizes="240px" />
        {secretEnding.lines.map(line => <p key={line}>{line}</p>)}
        <ul aria-label="Eight secrets found">{foundSecrets.map(secret => <li key={secret.id}>{secret.name}</li>)}</ul>
        <Link href="/#futures" className="btn btn-primary">Explore the dreams again</Link>
      </section>}

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
