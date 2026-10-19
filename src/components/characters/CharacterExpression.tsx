"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { expressionFor } from "@/data/expressions";
import { nightPreference } from "@/lib/site-preferences";
import styles from "./CharacterExpression.module.css";

/** Missing or unapproved variants always retain the locked original picture. */
export function CharacterExpression({ characterId, alt, ...props }: Omit<ImageProps, "src"> & { characterId: number }) {
  const night = useSyncExternalStore(nightPreference.subscribe, nightPreference.getSnapshot, () => false);
  const day = expressionFor(characterId, "day"), dreamy = expressionFor(characterId, "night");
  const [visitedNight, setVisitedNight] = useState(false), [ready, setReady] = useState("");
  useEffect(() => { if (night) setVisitedNight(true); }, [night]);
  const showNight = night && dreamy.hasVariant && ready === dreamy.src;
  return <span className={styles.stack} data-expression={showNight ? "night" : "canonical"}>
    <Image {...props} src={day.src} alt={day.alt ?? alt} aria-hidden={showNight} fetchPriority={props.fetchPriority ?? (props.priority ? "high" : undefined)}
      className={[props.className, styles.expression].filter(Boolean).join(" ")}
      style={{ ...props.style, opacity: showNight ? 0 : 1 }} />
    {dreamy.hasVariant && (night || visitedNight) && <Image {...props} src={dreamy.src} alt={dreamy.alt ?? alt}
      priority={false} fetchPriority="low" loading="lazy" aria-hidden={!showNight}
      className={[props.className, styles.expression].filter(Boolean).join(" ")}
      style={{ ...props.style, opacity: showNight ? 1 : 0 }} onLoad={() => setReady(dreamy.src)} />}
  </span>;
}
