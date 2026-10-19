"use client";

import { useState } from "react";

import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import styles from "./GoldenAcorn.module.css";

/**
 * Forest's optional secret: a tiny golden acorn among the roots of the
 * ancient tree. Tapping it makes it glow, a trail of fireflies rises and a
 * secret woodland path briefly lights up; the registered secret is
 * collected through the shared journey progress store. Collecting again
 * never adds to the count. Anchored to the 16:9 illustration.
 */
export function GoldenAcorn({ futureSlug, left, top }: { futureSlug: string; left: string; top: string }) {
  const secret = getSecretForFuture(futureSlug);
  const { progress, hydrated, collectSecret, secretCount } = useJourneyProgress();
  const [message, setMessage] = useSecretMessage();
  const [taps, setTaps] = useState(0);

  if (!secret) return null;
  const found = hydrated && isSecretCollected(progress, secret.id);

  return (
    <>
      <div className={styles.layer}>
        {taps > 0 && (
          <svg key={`path-${taps}`} className={styles.secretPath} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={`M${parseFloat(left)} ${parseFloat(top)} C 34 92, 52 84, 70 90 S 92 80, 98 84`} />
          </svg>
        )}
        <button
          type="button"
          className={styles.acorn}
          style={{ left, top }}
          data-found={found}
          aria-label={found ? `${secret.name} (already found)` : "A tiny golden acorn"}
          onClick={() => {
            const result = collectSecret(secret.id);
            setTaps((t) => t + 1);
            if (result === "collected") setMessage(secret.unlockMessage);
            else if (result === "already-collected") setMessage(`You already found the ${secret.name}. 🌰`);
          }}
        >
          <svg viewBox="0 0 24 30" className={styles.art} aria-hidden="true">
            <path d="M12 3 V7" stroke="#7a4f2a" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 12 C 3 6, 21 6, 21 12 Z" fill="#b8862f" stroke="#7a4f2a" strokeWidth="1.2" />
            <path className={styles.nut} d="M4.5 12 H19.5 C 19.5 21, 15 27, 12 28 C 9 27, 4.5 21, 4.5 12 Z" />
          </svg>
          {taps > 0 && (
            <span key={taps} className={styles.fireflies} aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <i key={i} style={{ "--x": `${(i - 2.5) * 12}px`, animationDelay: `${i * 0.12}s` } as React.CSSProperties} />
              ))}
            </span>
          )}
        </button>
      </div>
      <SecretToast message={message} secretCount={secretCount} />
    </>
  );
}
