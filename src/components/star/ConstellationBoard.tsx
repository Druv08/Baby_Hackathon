"use client";

import { useEffect, useReducer } from "react";

import {
  connectedStars,
  constellationReducer,
  initialConstellation,
  isPatternComplete,
  type ConstellationAction,
  type ConstellationState,
  type Edge,
  type SkyStar,
} from "@/lib/projects/constellation";
import styles from "./ConstellationBoard.module.css";

export interface ConstellationBoardProps {
  stars: readonly SkyStar[];
  /** Lines that make up the hidden pattern; omit for free drawing. */
  target?: readonly Edge[];
  /** Accessible name for the whole board. */
  label: string;
  /** Faint, hard-to-notice stars (used for the hidden secret). */
  faint?: boolean;
  /** Short status line shown under the board. */
  status?: (state: ConstellationState, complete: boolean) => string;
  onComplete?: () => void;
  /** Extra controls rendered with Undo / Clear. */
  children?: (state: ConstellationState, dispatch: (a: ConstellationAction) => void) => React.ReactNode;
  showControls?: boolean;
  className?: string;
}

/**
 * Stars are real buttons (mouse, touch, Tab + Enter/Space); the lines are a
 * decorative SVG layer underneath them.
 */
export function ConstellationBoard({
  stars,
  target,
  label,
  faint = false,
  status,
  onComplete,
  children,
  showControls = true,
  className = "",
}: ConstellationBoardProps) {
  const [state, dispatch] = useReducer(
    (s: ConstellationState, a: ConstellationAction) => constellationReducer(s, a, { stars, target }),
    initialConstellation,
  );
  const complete = target ? isPatternComplete(state.edges, target) : false;
  const lit = connectedStars(state.edges);
  const pos = (id: string) => stars.find((s) => s.id === id)!;

  useEffect(() => {
    if (complete) onComplete?.();
  }, [complete, onComplete]);

  return (
    <div className={`${styles.board} ${className}`} data-complete={complete} data-faint={faint}>
      <div className={styles.sky} role="group" aria-label={label}>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {state.edges.map(([a, b], i) => (
            <line key={i} x1={pos(a).x} y1={pos(a).y} x2={pos(b).x} y2={pos(b).y} className={styles.line} />
          ))}
          {state.rejected && (
            <line
              key={state.rejected.join("-") + state.edges.length}
              x1={pos(state.rejected[0]).x}
              y1={pos(state.rejected[0]).y}
              x2={pos(state.rejected[1]).x}
              y2={pos(state.rejected[1]).y}
              className={styles.rejected}
            />
          )}
        </svg>
        {stars.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.star}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-label={s.label}
            aria-pressed={state.active === s.id}
            data-lit={lit.has(s.id)}
            onClick={() => dispatch({ type: "select", starId: s.id })}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>

      {status && (
        <p className={styles.status} role="status">
          {status(state, complete)}
        </p>
      )}

      {showControls && (
        <div className={styles.controls}>
          <button type="button" className={styles.control} onClick={() => dispatch({ type: "undo" })} disabled={state.edges.length === 0}>
            Undo line
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={() => dispatch({ type: "clear" })}
            disabled={state.edges.length === 0 && state.active === null}
          >
            Clear
          </button>
          {children?.(state, dispatch)}
        </div>
      )}
    </div>
  );
}
