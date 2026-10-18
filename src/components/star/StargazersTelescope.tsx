"use client";

import { useReducer, useRef } from "react";

import { initialTelescope, LENS_RADIUS, SKY_WONDERS, telescopeReducer } from "@/lib/projects/star-projects";
import styles from "./StarProjects.module.css";

const STEP = 6;

/**
 * Move the telescope lens across the sky to discover wonders. Mouse/touch:
 * tap the sky to aim there. Keyboard: arrow keys on the sky, or the
 * direction buttons, or jump straight to a wonder from the list.
 */
export function StargazersTelescope() {
  const [state, dispatch] = useReducer(telescopeReducer, initialTelescope);
  const skyRef = useRef<HTMLDivElement>(null);
  const inView = SKY_WONDERS.find((w) => w.id === state.inView);
  const all = state.discovered.length === SKY_WONDERS.length;

  return (
    <div className={styles.game}>
      <div
        ref={skyRef}
        className={styles.telescopeSky}
        role="application"
        aria-label="Night sky. Use the arrow keys to move the telescope lens."
        tabIndex={0}
        onKeyDown={(e) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-STEP, 0],
            ArrowRight: [STEP, 0],
            ArrowUp: [0, -STEP],
            ArrowDown: [0, STEP],
          };
          const m = moves[e.key];
          if (m) {
            e.preventDefault();
            dispatch({ type: "move", dx: m[0], dy: m[1] });
          }
        }}
        onPointerDown={(e) => {
          const r = skyRef.current!.getBoundingClientRect();
          dispatch({ type: "aim", x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      >
        {SKY_WONDERS.map((w) => (
          <span
            key={w.id}
            className={styles.wonder}
            data-id={w.id}
            data-found={state.discovered.includes(w.id)}
            style={{ left: `${w.x}%`, top: `${w.y}%` }}
            aria-hidden="true"
          />
        ))}
        <span
          className={styles.lens}
          data-locked={inView !== undefined}
          style={{ left: `${state.lens.x}%`, top: `${state.lens.y}%`, width: `${LENS_RADIUS * 2}%` }}
          aria-hidden="true"
        />
      </div>

      <div className={styles.controls} aria-label="Move the telescope">
        <button type="button" className={styles.secondary} aria-label="Move lens left" onClick={() => dispatch({ type: "move", dx: -STEP, dy: 0 })}>←</button>
        <button type="button" className={styles.secondary} aria-label="Move lens up" onClick={() => dispatch({ type: "move", dx: 0, dy: -STEP })}>↑</button>
        <button type="button" className={styles.secondary} aria-label="Move lens down" onClick={() => dispatch({ type: "move", dx: 0, dy: STEP })}>↓</button>
        <button type="button" className={styles.secondary} aria-label="Move lens right" onClick={() => dispatch({ type: "move", dx: STEP, dy: 0 })}>→</button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })} disabled={state.discovered.length === 0}>
          Reset sky
        </button>
      </div>

      <p className={styles.status} role="status">
        {inView ? (
          <>
            <strong>You discovered {inView.name}!</strong> {inView.description}
          </>
        ) : (
          "Move the lens around the sky. Something wonderful is hiding up there…"
        )}
      </p>

      <div>
        <p>
          <strong>
            Discoveries: {state.discovered.length} / {SKY_WONDERS.length}
          </strong>
          {all && " — you found every wonder! 🔭"}
        </p>
        <ul className={styles.savedList}>
          {SKY_WONDERS.map((w) => {
            const found = state.discovered.includes(w.id);
            return (
              <li key={w.id} data-found={found}>
                {found ? (
                  <button type="button" className={styles.chip} onClick={() => dispatch({ type: "aim", x: w.x, y: w.y })}>
                    🔭 {w.name}
                  </button>
                ) : (
                  <span className={styles.muted}>? Not yet discovered</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
