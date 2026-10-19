"use client";

import { useState } from "react";

import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import { Gear } from "./GearSvg";
import styles from "./GoldenCog.module.css";

/**
 * Inventor's optional secret: a tiny golden gear tucked among the workshop
 * clutter. Tapping it sets the gear turning, a little golden heart-shaped
 * mechanism pops up with sparkles, and the registered secret is collected
 * through the shared journey progress store. Collecting again never adds
 * to the count. Anchored to the 16:9 illustration so it stays put.
 */
export function GoldenCog({ futureSlug, left, top }: { futureSlug: string; left: string; top: string }) {
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
          className={styles.cog}
          style={{ left, top }}
          data-found={found}
          aria-label={found ? `${secret.name} (already found)` : "A tiny golden gear"}
          onClick={() => {
            const result = collectSecret(secret.id);
            setTaps((t) => t + 1);
            if (result === "collected") setMessage(secret.unlockMessage);
            else if (result === "already-collected") setMessage(`You already found the ${secret.name}. ⚙️`);
          }}
        >
          <svg viewBox="-22 -30 44 52" className={styles.art} aria-hidden="true">
            {/* Little golden heart mechanism, revealed once found. */}
            <g className={styles.heart}>
              <path d="M0 -10 C-4 -16 -12 -15 -12 -9 C-12 -4 -5 0 0 4 C5 0 12 -4 12 -9 C12 -15 4 -16 0 -10 Z" fill="#ffd36a" stroke="#b8741f" strokeWidth="1.2" transform="translate(0 -12)" />
              <circle cx="0" cy="-19" r="1.6" fill="#b8741f" />
            </g>
            <Gear cx={0} cy={6} r={9} teeth={10} spinning={found} className={styles.gear} />
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
