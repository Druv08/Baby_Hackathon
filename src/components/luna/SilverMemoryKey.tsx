"use client";

import Image from "next/image";
import { useState } from "react";

import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import styles from "./SilverMemoryKey.module.css";

/**
 * Luna's optional secret: a tiny silver key by the treasure chests in the
 * Memory Library. Tapping it makes the key glow, a little memory chest
 * opens and a glowing picture of Normal Maria appears — the memory of who
 * she was. Collected through the shared journey progress store (once).
 */
export function SilverMemoryKey({ futureSlug, left, top }: { futureSlug: string; left: string; top: string }) {
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
          className={styles.key}
          style={{ left, top }}
          data-found={found}
          aria-label={found ? `${secret.name} (already found)` : "A tiny silver key"}
          onClick={() => {
            const result = collectSecret(secret.id);
            setTaps((t) => t + 1);
            if (result === "collected") setMessage(secret.unlockMessage);
            else if (result === "already-collected") setMessage(`You already found the ${secret.name}. 🗝️`);
          }}
        >
          <svg viewBox="0 0 40 20" className={styles.keyArt} aria-hidden="true">
            <circle cx="9" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M15 10 H36 M30 10 V15 M35 10 V14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {found && (
            <span key={taps} className={styles.chest} aria-hidden="true">
              <span className={styles.lid} />
              <span className={styles.memory}>
                <Image src="/characters/1.png" alt="" width={1086} height={1448} sizes="48px" />
              </span>
              <span className={styles.box} />
            </span>
          )}
        </button>
      </div>
      <SecretToast message={message} secretCount={secretCount} />
    </>
  );
}
