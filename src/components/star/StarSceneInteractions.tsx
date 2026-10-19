"use client";

import { useState } from "react";

import type { Edge, SkyStar } from "@/lib/projects/constellation";
import { ConstellationBoard } from "./ConstellationBoard";
import styles from "./StarSceneInteractions.module.css";

/** Scene 1: tapping the lonely star makes it twinkle brighter — it never joins a constellation. */
export function LonelyStar() {
  const [twinkles, setTwinkles] = useState(0);
  const messages = [
    "Tap the lonely little star.",
    "It twinkles back at you!",
    "It shines a little brighter… but it’s still all alone.",
    "It flickers toward the old tower on the hill. Maybe it wants Maria to follow?",
  ];
  const level = Math.min(twinkles, messages.length - 1);
  return (
    <>
      {/* Anchored to the illustration itself, not the whole frame. */}
      <div className={styles.imageLayer}>
        <button
          type="button"
          className={styles.lonelyStar}
          style={{ left: "76.5%", top: "17.5%" }}
          data-level={level}
          aria-label="Tap the lonely star"
          onClick={() => setTwinkles((t) => t + 1)}
        >
          <span key={twinkles} className={styles.twinkle} aria-hidden="true" />
        </button>
      </div>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">✨ </span>
        {messages[level]}
      </p>
    </>
  );
}

/** A small fragment of an old star map, revealed a section at a time. */
const MAP_STARS = [
  { x: 14, y: 30, s: 3 },
  { x: 26, y: 58, s: 2 },
  { x: 38, y: 24, s: 4 },
  { x: 52, y: 66, s: 2.5 },
  { x: 63, y: 36, s: 3 },
  { x: 77, y: 58, s: 2 },
  { x: 88, y: 26, s: 3.5 },
];

/** Scene 2: each look through the telescope reveals more of the old star map. */
export function TelescopePeek() {
  const [revealed, setRevealed] = useState(0); // 0–3 thirds of the map
  const labels = [
    "Look through the telescope to read the old star map.",
    "A corner of the map appears… the stars don’t match the sky!",
    "More of the map… these lines were once someone’s wishes.",
    "The whole map! So these stars really are little dreams.",
  ];
  return (
    <div className={styles.telescope}>
      <div className={styles.lens} aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect width="100" height="100" fill="#1a1440" />
          {MAP_STARS.map((st, i) => (
            <circle key={i} cx={st.x} cy={st.y} r={st.s * 0.5} fill="#ffe39a" opacity={st.x < (revealed * 100) / 3 ? 1 : 0.55} className={styles.mapStar} />
          ))}
          <polyline
            points="14,30 38,24 63,36 88,26"
            fill="none"
            stroke="#ffe39a"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity={revealed >= 3 ? 0.9 : 0}
            className={styles.mapStar}
          />
          <rect x={(revealed * 100) / 3} width={100 - (revealed * 100) / 3} height="100" fill="#0d0a24" fillOpacity={0.82} className={styles.mapCover} />
        </svg>
      </div>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.control}
          onClick={() => setRevealed((r) => Math.min(r + 1, 3))}
          disabled={revealed === 3}
        >
          <span aria-hidden="true">🔭</span> {revealed === 0 ? "Look through the telescope" : "Look a little further"}
        </button>
        {revealed > 0 && (
          <button type="button" className={styles.ghost} onClick={() => setRevealed(0)}>
            Start over
          </button>
        )}
      </div>
      <p className={styles.inline} role="status">
        {labels[revealed]}
      </p>
    </div>
  );
}

/** Scene 3: the "find my way home" constellation — wrong lines softly fade. */
const HOME_STARS: SkyStar[] = [
  { id: "a", x: 18, y: 64, label: "Star near the window" },
  { id: "b", x: 40, y: 30, label: "Bright star above the hills" },
  { id: "c", x: 62, y: 58, label: "Star over the bridge" },
  { id: "d", x: 82, y: 26, label: "Faraway star by the moon" },
];
const HOME_TARGET: Edge[] = [
  ["a", "b"],
  ["b", "c"],
];

export function UnfinishedConstellation() {
  return (
    <ConstellationBoard
      stars={HOME_STARS}
      target={HOME_TARGET}
      label="An unfinished constellation. Choose two stars to try connecting them."
      status={(s, done) =>
        done
          ? "“I wish I could find my way home.” Three stars glow together — Maria understands!"
          : s.rejected
            ? "That line fades away… these stars don’t belong to the same wish."
            : s.active
              ? "Now choose a star to connect it to."
              : "Try connecting the stars. Some won’t stay connected — just like Maria’s."
      }
    />
  );
}

/** Scene 4: connect the forgotten dreams into Maria's first Dream Map. */
const DREAM_STARS: SkyStar[] = [
  { id: "a", x: 14, y: 70, label: "Friendship star" },
  { id: "b", x: 32, y: 34, label: "Adventure star" },
  { id: "c", x: 52, y: 52, label: "Remember-me star" },
  { id: "d", x: 70, y: 22, label: "Hope star" },
  { id: "e", x: 88, y: 46, label: "Homeward star" },
];
const DREAM_TARGET: Edge[] = [
  ["a", "b"],
  ["b", "c"],
  ["c", "d"],
  ["d", "e"],
];

export function ConnectDreams() {
  return (
    <ConstellationBoard
      stars={DREAM_STARS}
      target={DREAM_TARGET}
      label="Connect the forgotten dreams. Join the stars from left to right."
      status={(s, done) =>
        done
          ? "✨ Every little dream has its own place in the sky — your Dream Map is complete!"
          : `Join the dream stars from left to right. Lines drawn: ${s.edges.length} / ${DREAM_TARGET.length}`
      }
    />
  );
}
