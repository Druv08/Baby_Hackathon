"use client";

import { useState } from "react";

import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import { PUFF_PATH, RAINBOW_ARCS } from "./cloud-art";
import styles from "./RainbowCloud.module.css";

/**
 * Cloud's optional secret: a tiny cloud drifting among the pink clouds of
 * "Lost in the Endless Sky". Tapping it makes it glow, raises a rainbow and
 * collects the registered secret through the shared journey progress
 * store. Collecting again never adds to the count. Anchored to the
 * illustration's own aspect ratio so it stays put at every screen size.
 */
export function RainbowCloud({ futureSlug, left, top }: { futureSlug: string; left: string; top: string }) {
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
          className={styles.cloud}
          style={{ left, top }}
          data-found={found}
          aria-label={found ? `${secret.name} (already found)` : "A tiny drifting cloud"}
          onClick={() => {
            const result = collectSecret(secret.id);
            setTaps((t) => t + 1);
            if (result === "collected") setMessage(secret.unlockMessage);
            else if (result === "already-collected") setMessage(`You already found the ${secret.name}. 🌈`);
          }}
        >
          <svg viewBox="0 -24 100 86" className={styles.art} aria-hidden="true">
            <g className={styles.rainbow} key={taps}>
              {RAINBOW_ARCS.map((a) => (
                <path key={a.color} d={a.d} transform="translate(0 -22)" fill="none" stroke={a.color} strokeWidth={7} strokeLinecap="round" />
              ))}
            </g>
            <path d={PUFF_PATH} className={styles.puff} />
          </svg>
        </button>
      </div>
      <SecretToast message={message} secretCount={secretCount} />
    </>
  );
}
