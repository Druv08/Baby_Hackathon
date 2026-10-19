"use client";

import { useReducer, useState } from "react";

import {
  BUBBLE_MESSAGES,
  CLEANUP_STEPS,
  SCENE_CREATURES,
  TANGLES,
  allTanglesFound,
  bubbleLevel,
  canDoStep,
  cleanupReducer,
  creaturesReducer,
  initialCleanup,
  initialCreatures,
  initialTangles,
  isReefClean,
  tanglesReducer,
} from "@/lib/projects/aqua-story";
import styles from "./AquaSceneInteractions.module.css";

/** Scene 1: the magical bubble glows, bubbles rise and the turtle is noticed. */
export function MagicBubble() {
  const [taps, setTaps] = useState(0);
  const level = bubbleLevel(taps);
  return (
    <>
      {/* Anchored to the 4:3 illustration itself. */}
      <div className={styles.imageLayer} data-level={level}>
        <span className={styles.brighten} aria-hidden="true" />
        <button
          type="button"
          className={styles.bubble}
          style={{ left: "28%", top: "40%" }}
          data-level={level}
          aria-label="Tap Maria’s magical bubble"
          onClick={() => setTaps((t) => t + 1)}
        >
          <span key={taps} className={styles.rising} data-active={taps > 0} aria-hidden="true">
            {taps > 0 && [14, 30, 48, 66, 82].map((x, i) => <i key={x} style={{ left: `${x}%`, animationDelay: `${i * 0.12}s` }} />)}
          </span>
        </button>
        <span className={styles.turtleRing} style={{ left: "60%", top: "72%" }} data-on={level >= 3} aria-hidden="true" />
      </div>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">🫧 </span>
        {BUBBLE_MESSAGES[level]}
      </p>
    </>
  );
}

/** Scene 2: meet three sea creatures hiding in the kingdom. */
export function SeaCreatures() {
  const [state, dispatch] = useReducer(creaturesReducer, initialCreatures);
  const selected = SCENE_CREATURES.find((c) => c.id === state.selected);
  return (
    <>
      <div className={styles.imageLayer}>
        {SCENE_CREATURES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.hotspot}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            aria-pressed={state.selected === c.id}
            data-met={state.met.includes(c.id)}
            aria-label={`Meet the ${c.name.toLowerCase()}`}
            onClick={() => dispatch({ type: "select", id: c.id })}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className={styles.panel}>
        <div className={styles.row}>
          {SCENE_CREATURES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.chip}
              aria-pressed={state.selected === c.id}
              onClick={() => dispatch({ type: "select", id: c.id })}
            >
              {state.met.includes(c.id) ? "✓ " : ""}
              {c.name}
            </button>
          ))}
        </div>
        <p className={styles.inline} role="status">
          {selected ? (
            <>
              <strong>{selected.name}:</strong> {selected.about}
            </>
          ) : (
            "Tap a glowing circle on the picture (or a name) to meet a sea creature."
          )}
          {state.met.length === SCENE_CREATURES.length && " You’ve met all three little friends!"}
        </p>
      </div>
    </>
  );
}

/** Scene 3: inspect the three tangled points. The net stays until Scene 4. */
export function TangledNet() {
  const [state, dispatch] = useReducer(tanglesReducer, initialTangles);
  const last = TANGLES.find((t) => t.id === state.last);
  const done = allTanglesFound(state);
  return (
    <>
      <div className={styles.imageLayer}>
        {TANGLES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={styles.knot}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            data-inspected={state.inspected.includes(t.id)}
            aria-pressed={state.last === t.id}
            aria-label={`Inspect tangle ${i + 1}: ${t.label}`}
            onClick={() => dispatch({ type: "inspect", id: t.id })}
          >
            <span aria-hidden="true">{state.inspected.includes(t.id) ? "✓" : i + 1}</span>
          </button>
        ))}
      </div>
      <div className={styles.panel}>
        <p className={styles.counter} aria-live="polite">
          Tangles inspected: {state.inspected.length}/{TANGLES.length}
        </p>
        <p className={styles.inline} role="status" data-done={done}>
          {done ? (
            "Maria has found a way to free the reef!"
          ) : last ? (
            <>
              <strong>{last.label}:</strong> {last.note}
            </>
          ) : (
            "Tap the three numbered spots where the net is caught."
          )}
        </p>
      </div>
    </>
  );
}

const FISH = [
  { top: "38%", delay: "0s", hue: "#ff9a5c" },
  { top: "52%", delay: "0.7s", hue: "#ffd34d" },
  { top: "66%", delay: "1.3s", hue: "#6fa8ff" },
];

/** Scene 4: lift the net, remove debris, clear the last corner; the reef recovers. */
export function ReefCleanup() {
  const [state, dispatch] = useReducer(cleanupReducer, initialCleanup);
  const clean = isReefClean(state);
  const last = CLEANUP_STEPS.find((s) => s.id === state.done.at(-1));
  return (
    <>
      <div className={styles.imageLayer} data-progress={state.done.length} data-clean={clean}>
        {/* Washes out the reef's colour until it's cleaned, then lifts away. */}
        <span className={styles.dull} aria-hidden="true" />
        <span className={styles.marker} style={{ left: "13%", top: "24%" }} data-gone={state.done.includes("loose-net")} aria-hidden="true" />
        <span className={styles.marker} style={{ left: "5%", top: "31%" }} data-gone={state.done.includes("debris")} aria-hidden="true" />
        <span className={styles.marker} style={{ left: "88%", top: "28%" }} data-gone={state.done.includes("last-area")} aria-hidden="true" />
        {clean && (
          <span className={styles.celebrate} aria-hidden="true">
            {FISH.map((f) => (
              <svg key={f.top} viewBox="0 0 40 20" className={styles.fish} style={{ top: f.top, animationDelay: f.delay }}>
                <path d="M2 10 Q14 0 28 10 Q14 20 2 10 Z M28 10 L38 3 L38 17 Z" fill={f.hue} />
                <circle cx="9" cy="9" r="1.6" fill="#1d2b44" />
              </svg>
            ))}
            {[20, 40, 62, 80].map((x, i) => (
              <i key={x} style={{ left: `${x}%`, animationDelay: `${i * 0.3}s` }} />
            ))}
            <span className={styles.turtleRing} style={{ left: "76%", top: "62%" }} data-on="true" />
          </span>
        )}
      </div>
      <div className={styles.panel}>
        <div className={styles.steps}>
          {CLEANUP_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={styles.step}
              data-done={state.done.includes(s.id)}
              disabled={!canDoStep(state, s.id)}
              onClick={() => dispatch({ type: "do", step: s.id })}
            >
              <span aria-hidden="true">{state.done.includes(s.id) ? "✓" : i + 1}</span> {s.label}
            </button>
          ))}
        </div>
        <div className={styles.row}>
          <p className={styles.inline} role="status" data-done={clean}>
            {clean
              ? "“We did it! You’re safe now!” The coral glows warmly, fish swim home and the turtle twirls with joy."
              : last
                ? last.done
                : "Help Maria clean the reef, one careful step at a time."}
          </p>
          {state.done.length > 0 && (
            <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
              Start again
            </button>
          )}
        </div>
      </div>
    </>
  );
}
