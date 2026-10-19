"use client";

import { useState } from "react";

import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import styles from "./OceanPearl.module.css";

/**
 * Aqua's optional secret: a tiny closed seashell tucked into the coral.
 * Tapping it opens the shell, a pearl glows, sparkles drift up and the
 * registered secret is collected through the shared journey progress store.
 * Collecting again never adds to the count. Anchored to the 4:3
 * illustration so it stays put at every screen size.
 */
export function OceanPearl({ futureSlug, left, top }: { futureSlug: string; left: string; top: string }) {
  const secret = getSecretForFuture(futureSlug);
  const { progress, hydrated, collectSecret, secretCount } = useJourneyProgress();
  const [message, setMessage] = useSecretMessage();
  const [taps, setTaps] = useState(0);

  if (!secret) return null;
  const found = hydrated && isSecretCollected(progress, secret.id);

  return (
    <>
      <div className={styles.layer}>
        <button
          type="button"
          className={styles.shell}
          style={{ left, top }}
          data-found={found}
          aria-label={found ? `${secret.name} (already found)` : "A tiny closed seashell"}
          onClick={() => {
            const result = collectSecret(secret.id);
            setTaps((t) => t + 1);
            if (result === "collected") setMessage(secret.unlockMessage);
            else if (result === "already-collected") setMessage(`You already found the ${secret.name}. 🫧`);
          }}
        >
          <svg viewBox="0 0 40 34" className={styles.art} aria-hidden="true">
            <path className={styles.bottom} d="M4 22 Q20 34 36 22 Q20 26 4 22 Z" />
            <circle className={styles.pearl} cx="20" cy="21" r="4.2" />
            <g className={styles.lid}>
              <path d="M4 22 Q4 6 20 4 Q36 6 36 22 Q20 18 4 22 Z" />
              <path d="M20 5 V19 M12 7 L15 20 M28 7 L25 20" fill="none" />
            </g>
          </svg>
          {taps > 0 && (
            <span key={taps} className={styles.sparkles} aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <i key={i} style={{ "--a": `${i * 60}deg` } as React.CSSProperties} />
              ))}
            </span>
          )}
        </button>
      </div>
      <SecretToast message={message} secretCount={secretCount} />
    </>
  );
}
