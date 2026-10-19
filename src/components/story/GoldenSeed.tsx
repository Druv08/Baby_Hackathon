"use client";

import { useEffect, useState } from "react";

import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, getAllSecrets, isSecretCollected } from "@/lib/easter-eggs";
import styles from "./GoldenSeed.module.css";

/**
 * A future's hidden collectible, tucked into the scenery. Optional: it never
 * blocks the story. Saved through the shared journey progress store.
 */
export function HiddenSecret({ futureSlug, left, top }: { futureSlug: string; left: string; top: string }) {
  const secret = getSecretForFuture(futureSlug);
  const { progress, hydrated, collectSecret, secretCount } = useJourneyProgress();
  const [message, setMessage] = useSecretMessage();
  const [burst, setBurst] = useState(0);

  if (!secret) return null;
  const found = hydrated && isSecretCollected(progress, secret.id);

  return (
    <>
      <button
        type="button"
        className={styles.seed}
        style={{ left, top }}
        data-found={found}
        aria-label={found ? `${secret.name} (already found)` : "A tiny golden glimmer"}
        onClick={() => {
          const result = collectSecret(secret.id);
          setBurst((b) => b + 1);
          if (result === "collected") setMessage(secret.unlockMessage);
          else if (result === "already-collected") setMessage(`You already found the ${secret.name}. ✨`);
        }}
      >
        <span className={styles.core} aria-hidden="true" />
        {burst > 0 && (
          <span key={burst} className={styles.burst} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} style={{ transform: `rotate(${i * 45}deg)` }} />
            ))}
          </span>
        )}
      </button>

      <SecretToast message={message} secretCount={secretCount} />
    </>
  );
}

/** A message that clears itself after a few seconds. */
export function useSecretMessage() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);
  return [message, setMessage] as const;
}

/** Shared "You found…" toast with the running secret count. */
export function SecretToast({ message, secretCount }: { message: string | null; secretCount: number }) {
  return (
    <div className={styles.toast} role="status" aria-live="polite" data-visible={message !== null}>
      {message && (
        <>
          <span aria-hidden="true">🌟 </span>
          <strong>{message}</strong>
          <span className={styles.count}>
            Secrets found: {secretCount} / {getAllSecrets().length}
          </span>
          {secretCount === getAllSecrets().length && <a href="/journey#secret-ending">Your secret ending is ready →</a>}
        </>
      )}
    </div>
  );
}
