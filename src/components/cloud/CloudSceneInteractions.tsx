"use client";

import { useReducer, useState } from "react";

import {
  BRIDGE_CLOUDS,
  BRIDGE_GAPS,
  CHIMES,
  STEP_COUNT,
  WORRIED_CLOUD_MESSAGES,
  bridgeReducer,
  chimesReducer,
  initialBridge,
  initialChimes,
  initialSteps,
  isBridgeComplete,
  stepsReducer,
  worriedCloudLevel,
  type CloudSize,
} from "@/lib/projects/cloud-story";
import styles from "./CloudSceneInteractions.module.css";

/** A fluffy cloud outline, optionally with the little cloud friend's face. */
export function Puff({ face = false, stretch = false, className }: { face?: boolean; stretch?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 62"
      preserveAspectRatio={stretch ? "none" : undefined}
      className={`${styles.puff} ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 54 C9 54 5 41 14 35 C10 22 26 15 35 22 C39 9 60 7 66 20 C76 13 91 22 86 35 C96 39 93 54 80 54 Z" />
      {face && (
        <g className={styles.face}>
          <circle cx="40" cy="36" r="3.2" />
          <circle cx="60" cy="36" r="3.2" />
          <path d="M45 44 Q50 48 55 44" fill="none" />
          <circle cx="34" cy="43" r="3" className={styles.blush} />
          <circle cx="66" cy="43" r="3" className={styles.blush} />
        </g>
      )}
    </svg>
  );
}

/** Scene 1: tapping the worried cloud makes it bounce and brighten. */
export function WorriedCloud() {
  const [taps, setTaps] = useState(0);
  const level = worriedCloudLevel(taps);
  return (
    <>
      {/* Anchored to the illustration itself (its own aspect ratio). */}
      <div className={styles.imageLayer}>
        <button
          type="button"
          className={styles.worriedCloud}
          style={{ left: "41.5%", top: "79%" }}
          data-level={level}
          aria-label="Tap the worried little cloud"
          onClick={() => setTaps((t) => t + 1)}
        >
          <span key={taps} className={styles.bounce} data-active={taps > 0} aria-hidden="true">
            {taps > 0 && (
              <>
                <i style={{ left: "12%", animationDelay: "0s" }} />
                <i style={{ left: "50%", animationDelay: "0.15s" }} />
                <i style={{ left: "84%", animationDelay: "0.3s" }} />
              </>
            )}
          </span>
        </button>
      </div>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">☁️ </span>
        {WORRIED_CLOUD_MESSAGES[level]}
      </p>
    </>
  );
}

/** Scene 2: three cloud steps, climbed one at a time. Entirely optional. */
export function CloudSteps() {
  const [state, dispatch] = useReducer(stepsReducer, initialSteps);
  const done = state.climbed === STEP_COUNT;
  const caption = done
    ? "“Being brave doesn’t mean I’m not scared!” Maria is above the waterfall!"
    : state.wobble !== null
      ? "Whoa, the staircase wobbles! One step at a time…"
      : state.climbed === 0
        ? "Help Maria climb: tap the first cloud step."
        : state.climbed === 1
          ? "“Okay. Just one more step.”"
          : "Two steps! Just one more…";
  return (
    <div className={styles.panel} data-tone="sky">
      <div className={styles.stairs} data-done={done}>
        {Array.from({ length: STEP_COUNT }, (_, i) => {
          const climbed = i < state.climbed;
          const next = i === state.climbed && !done;
          return (
            <button
              key={i}
              type="button"
              className={styles.step}
              style={{ "--rise": `${i * 26}px` } as React.CSSProperties}
              data-climbed={climbed}
              data-next={next}
              data-wobble={state.wobble === i}
              aria-label={`Cloud step ${i + 1}${climbed ? " (climbed)" : next ? " (next)" : ""}`}
              onClick={() => dispatch({ type: "step", index: i })}
            >
              <Puff />
              <span className={styles.paw} aria-hidden="true">
                {climbed ? "🐾" : ""}
              </span>
            </button>
          );
        })}
        {done && (
          <span className={styles.cheer} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
      <div className={styles.row}>
        <p className={styles.inline} role="status">
          {caption}
        </p>
        {state.climbed > 0 && (
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
            Climb again
          </button>
        )}
      </div>
    </div>
  );
}

/** Scene 3: ring a wind chime and watch which way the clouds drift. */
export function WindChimes() {
  const [state, dispatch] = useReducer(chimesReducer, initialChimes);
  const rung = CHIMES.find((c) => c.id === state.rung);
  return (
    <div className={styles.panel} data-tone="mist">
      <div className={styles.skyWindow} data-drift={rung?.drift ?? "none"} data-found={state.found} aria-hidden="true">
        <svg viewBox="0 0 160 50" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="cloud-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7d9e8" />
              <stop offset="1" stopColor="#fbeee4" />
            </linearGradient>
            <symbol id="cloud-puff" viewBox="0 0 100 62">
              <path d="M22 54 C9 54 5 41 14 35 C10 22 26 15 35 22 C39 9 60 7 66 20 C76 13 91 22 86 35 C96 39 93 54 80 54 Z" fill="#fff" />
            </symbol>
          </defs>
          <rect width="160" height="50" fill="url(#cloud-sky)" />
          {/* The floating island the right wind leads to. */}
          <g className={styles.island}>
            <path d="M118 22 h26 l-6 9 h-14 z" fill="#b99a86" />
            <path d="M118 22 h26 q-2 -4 -6 -4 h-14 q-4 0 -6 4 z" fill="#8fbf7a" />
            <rect x="126" y="12" width="7" height="6" fill="#f2c9a0" />
            <path d="M125 12 l4.5 -4 l4.5 4 z" fill="#c9776c" />
          </g>
          <path className={styles.route} d="M20 36 Q 70 10 120 22" fill="none" />
          {/* Keyed so each ring replays the wind trail. */}
          <path key={state.rings} className={styles.windTrail} d="M6 28 C 40 18, 70 38, 104 26 S 150 24, 156 18" fill="none" />
          <g className={styles.driftClouds}>
            <use href="#cloud-puff" x="20" y="21" width="28" height="17" />
            <use href="#cloud-puff" x="51" y="12" width="22" height="13" />
            <use href="#cloud-puff" x="74" y="24" width="30" height="18" />
          </g>
          {/* Thick fog that clears once the right chime rings. */}
          <rect className={styles.fog} width="160" height="50" fill="#fff" />
        </svg>
      </div>
      <div className={styles.chimes}>
        {CHIMES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.chime}
            aria-label={`Ring the ${c.label.toLowerCase()}`}
            aria-pressed={state.rung === c.id}
            data-correct={state.found && c.id === "right"}
            onClick={() => dispatch({ type: "ring", id: c.id })}
          >
            <span key={state.rung === c.id ? state.rings : 0} className={styles.chimeBody} data-swing={state.rung === c.id} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className={styles.chimeLabel}>{c.label.replace(" wind chime", "")}</span>
          </button>
        ))}
      </div>
      <p className={styles.inline} role="status">
        {rung ? rung.message : "Tap a golden wind chime. Which one shows the way?"}
        {state.found && rung?.id !== "right" ? " (The right chime already showed the way.)" : ""}
      </p>
    </div>
  );
}

const SIZE_WORD: Record<CloudSize, string> = { small: "small", medium: "medium", large: "big" };

/** Scene 4: guide three cloud platforms into the gaps of the bridge. */
export function CloudBridge() {
  const [state, dispatch] = useReducer(bridgeReducer, initialBridge);
  const complete = isBridgeComplete(state);
  const caption = complete
    ? "“We did it! We found our way home!” The bridge glows golden."
    : state.last === "wrong-fit"
      ? "That cloud doesn’t fit there. Try a gap that matches its size."
      : state.last === "pick-first"
        ? "First pick a cloud below, then tap the gap it fits."
        : state.selected
          ? `Now tap the gap that fits the ${SIZE_WORD[state.selected]} cloud.`
          : state.placed.some(Boolean)
            ? "It settled in! Choose the next cloud."
            : "Pick a cloud, then tap the gap in the bridge it fits.";
  return (
    <div className={styles.panel} data-tone="sky">
      <div className={styles.bridge} data-complete={complete}>
        <span className={styles.cliff} aria-hidden="true">
          🐾
        </span>
        {BRIDGE_GAPS.map((size, i) => {
          const filled = state.placed[i];
          return (
            <button
              key={i}
              type="button"
              className={styles.gap}
              data-size={size}
              data-filled={filled !== null}
              disabled={filled !== null}
              aria-label={filled ? `Gap ${i + 1}: filled with the ${SIZE_WORD[size]} cloud` : `Gap ${i + 1}: fits a ${SIZE_WORD[size]} cloud`}
              onClick={() => dispatch({ type: "place", gap: i })}
            >
              <span className={styles.platform} data-size={size} aria-hidden="true">
                <Puff stretch />
              </span>
            </button>
          );
        })}
        <span className={styles.cliff} data-side="far" aria-hidden="true">
          <span className={styles.friend} data-happy={complete}>
            <Puff face />
          </span>
        </span>
      </div>
      <div className={styles.tray}>
        {BRIDGE_CLOUDS.map((c) => {
          const used = state.placed.includes(c.size);
          return (
            <button
              key={c.size}
              type="button"
              className={styles.trayCloud}
              data-size={c.size}
              aria-pressed={state.selected === c.size}
              disabled={used || complete}
              data-used={used}
              aria-label={used ? `${c.label} (in the bridge)` : c.label}
              onClick={() => dispatch({ type: "select", size: c.size })}
            >
              <span className={styles.platform} data-size={c.size} aria-hidden="true">
                <Puff />
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.row}>
        <p className={styles.inline} role="status">
          {caption}
        </p>
        {(complete || state.placed.some(Boolean)) && (
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
            Build again
          </button>
        )}
      </div>
    </div>
  );
}
