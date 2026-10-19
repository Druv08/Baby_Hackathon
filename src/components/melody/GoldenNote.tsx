"use client";
import { useState } from "react";
import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import { useMelodyAudio } from "./useMelodyAudio";
import styles from "./Melody.module.css";

export function GoldenNote() {
  const { progress, hydrated, collectSecret, secretCount } = useJourneyProgress();
  const secret = getSecretForFuture("melody")!;
  const found = hydrated && isSecretCollected(progress, secret.id);
  const [message, setMessage] = useSecretMessage();
  const [burst, setBurst] = useState(false);
  const audio = useMelodyAudio();
  return <><button className={styles.secret} type="button" aria-label={found ? "Secret Note (already found)" : "A tiny golden musical note"} data-found={found} onClick={() => {
    const result = collectSecret(secret.id);
    setBurst(true); audio.play(["C", "E", "G"], "Music box");
    setMessage(result === "collected" ? "You found the Golden Musical Note! Saved as Secret Note in My Journey." : "You already found the Secret Note.");
  }}>{burst ? "♫" : "♪"}</button><SecretToast message={message} secretCount={secretCount} /></>;
}
