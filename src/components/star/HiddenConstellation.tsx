"use client";

import { useReducer } from "react";

import { SecretToast, useSecretMessage } from "@/components/story/GoldenSeed";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSecretForFuture, isSecretCollected } from "@/lib/easter-eggs";
import {
  constellationReducer,
  initialConstellation,
  isPatternComplete,
  type ConstellationAction,
  type ConstellationState,
  type Edge,
  type SkyStar,
} from "@/lib/projects/constellation";
import styles from "./HiddenConstellation.module.css";

/** Three faint stars in the observatory sky (percent of the illustration). */
const FAINT_STARS: SkyStar[] = [
  { id: "h1", x: 8, y: 30, label: "A very faint star" },
  { id: "h2", x: 19, y: 12, label: "Another faint star" },
  { id: "h3", x: 31, y: 32, label: "A third faint star" },
];
const TARGET: Edge[] = [
  ["h1", "h2"],
  ["h2", "h3"],
];

/**
 * Star's optional secret. Joining the three faint stars lights a hidden
 * constellation and collects "hidden-constellation" through the shared
 * journey progress store. Collecting again never adds to the count.
 * Rendered over the scene illustration only (its own aspect ratio), so it
 * never shifts when panels below the image change height.
 */
export function HiddenConstellation({ futureSlug }: { futureSlug: string }) {
  const secret = getSecretForFuture(futureSlug);
  const { progress, hydrated, collectSecret, secretCount } = useJourneyProgress();
  const [message, setMessage] = useSecretMessage();
  const [state, dispatch] = useReducer(
    (s: ConstellationState, a: ConstellationAction) => {
      const next = constellationReducer(s, a, { stars: FAINT_STARS, target: TARGET });
      // Any line that isn't part of the secret quietly resets the attempt.
      return next.rejected ? { ...initialConstellation } : next;
    },
    initialConstellation,
  );

  if (!secret) return null;
  const alreadyFound = hydrated && isSecretCollected(progress, secret.id);
  const complete = isPatternComplete(state.edges, TARGET);
  const glowing = complete || alreadyFound;
  const pos = (id: string) => FAINT_STARS.find((s) => s.id === id)!;

  function select(starId: string) {
    if (glowing) {
      // Already lit: confirm the find without touching progress.
      if (collectSecret(secret!.id) === "already-collected") setMessage(`You already found the ${secret!.name}. ✨`);
      return;
    }
    const willComplete =
      state.active !== null && isPatternComplete([...state.edges, [state.active, starId]], TARGET) && !complete;
    dispatch({ type: "select", starId });
    if (!willComplete) return;
    const result = collectSecret(secret!.id);
    if (result === "collected") setMessage(secret!.unlockMessage);
    else if (result === "already-collected") setMessage(`You already found the ${secret!.name}. ✨`);
  }

  return (
    <>
      <div className={styles.layer} data-glowing={glowing}>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {(glowing ? TARGET : state.edges).map(([a, b], i) => (
            <line key={i} x1={pos(a).x} y1={pos(a).y} x2={pos(b).x} y2={pos(b).y} />
          ))}
        </svg>
        {FAINT_STARS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.star}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-label={glowing ? `${secret.name} star` : s.label}
            aria-pressed={state.active === s.id}
            onClick={() => select(s.id)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
      <SecretToast message={message} secretCount={secretCount} />
    </>
  );
}
