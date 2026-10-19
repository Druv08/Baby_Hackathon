"use client";

import { useReducer } from "react";

import {
  PASSAGE_GOAL,
  PASSAGE_ROUTES,
  PASSAGE_SPOTS,
  initialPassage,
  passageReducer,
  passagesFrom,
  turtleArrived,
  type PassageKind,
  type PassageState,
  type SpotId,
} from "@/lib/projects/aqua-projects";
import styles from "./AquaProjects.module.css";

const spot = (id: SpotId) => PASSAGE_SPOTS.find((s) => s.id === id)!;

const KIND_TEXT: Record<PassageKind, string> = {
  safe: "calm water",
  current: "strong current",
  net: "tangled net",
};

function message(s: PassageState): string {
  const here = spot(s.path.at(-1)!).name;
  const tried = s.tried ? spot(s.tried).name : "";
  switch (s.feedback) {
    case "start":
      return "Help the little turtle swim from its nest to the Ocean Sanctuary. Pick the next stop along calm water.";
    case "swam":
      return `The turtle paddled happily to ${here}. Where next?`;
    case "current":
      return `Whoa, the current toward ${tried} is too strong for a little turtle. Let’s find calmer water!`;
    case "net":
      return `There’s a tangled net on the way to ${tried}. Let’s go around it safely.`;
    case "not-connected":
      return `${tried} is too far from ${here}. Choose a stop that’s connected.`;
    case "visited":
      return `The turtle has already been to ${tried}. Keep heading for the sanctuary!`;
    case "arrived":
      return `Hooray! The little turtle reached the Ocean Sanctuary safely in ${s.path.length - 1} swims! 🐢💙`;
  }
}

/**
 * Turtle's Safe Passage: guide the turtle stop by stop along calm water.
 * Strong currents and tangled nets give gentle feedback and let you try
 * again. Stops are buttons; the routes from the turtle's spot are also
 * listed as buttons for keyboard and touch users.
 */
export function TurtlesSafePassage() {
  const [state, dispatch] = useReducer(passageReducer, initialPassage);
  const here = state.path.at(-1)!;
  const arrived = turtleArrived(state);
  const onPath = (a: SpotId, b: SpotId) =>
    state.path.some((p, i) => i > 0 && ((state.path[i - 1] === a && p === b) || (state.path[i - 1] === b && p === a)));

  return (
    <div className={styles.game}>
      <div className={styles.passageMap} data-arrived={arrived}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {PASSAGE_ROUTES.map((r) => {
            const a = spot(r.from);
            const b = spot(r.to);
            return (
              <line
                key={`${r.from}-${r.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={styles.passage}
                data-kind={r.kind}
                data-used={onPath(r.from, r.to)}
              />
            );
          })}
        </svg>
        {PASSAGE_ROUTES.filter((r) => r.kind !== "safe").map((r) => {
          const a = spot(r.from);
          const b = spot(r.to);
          return (
            <span
              key={`m-${r.from}-${r.to}`}
              className={styles.hazard}
              data-kind={r.kind}
              style={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%` }}
              aria-hidden="true"
            >
              {r.kind === "current" ? "≈" : "#"}
            </span>
          );
        })}
        {PASSAGE_SPOTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.stop}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            data-here={s.id === here}
            data-visited={state.path.includes(s.id)}
            data-goal={s.id === PASSAGE_GOAL}
            aria-label={`${s.name}${s.id === here ? " (the turtle is here)" : ""}${s.id === PASSAGE_GOAL ? " (destination)" : ""}`}
            onClick={() => dispatch({ type: "swim", to: s.id })}
          >
            <span className={styles.stopDot} aria-hidden="true">
              {s.id === here ? "🐢" : s.id === PASSAGE_GOAL ? "🏝️" : ""}
            </span>
            <span className={styles.stopName}>{s.name}</span>
          </button>
        ))}
      </div>

      <ul className={styles.legend} aria-label="Map key">
        <li data-kind="safe">Calm water</li>
        <li data-kind="current">≈ Strong current</li>
        <li data-kind="net"># Tangled net</li>
      </ul>

      {!arrived && (
        <div className={styles.routes}>
          <p className={styles.muted}>Swim from {spot(here).name} to:</p>
          <div className={styles.controls}>
            {passagesFrom(here).map((r) => (
              <button key={r.to} type="button" className={styles.secondary} data-kind={r.kind} onClick={() => dispatch({ type: "swim", to: r.to })}>
                → {spot(r.to).name} <span className={styles.kind}>({KIND_TEXT[r.kind]})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={styles.status} role="status" data-tone={arrived ? "success" : ["current", "net"].includes(state.feedback) ? "warn" : undefined}>
        {message(state)}
      </p>
      {state.path.length > 1 && <p className={styles.trail}>Route: {state.path.map((id) => spot(id).name).join(" → ")}</p>}

      <div className={styles.controls}>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "back" })} disabled={state.path.length < 2 || arrived}>
          Swim back
        </button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })} disabled={state.path.length < 2 && state.feedback === "start"}>
          {arrived ? "Guide another turtle" : "Start over"}
        </button>
      </div>
    </div>
  );
}
