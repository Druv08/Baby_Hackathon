"use client";

import { useReducer, useState } from "react";

import {
  RABBIT_ROUTES,
  SAFE_LANDMARKS,
  SAFE_ROUTE,
  SIGNPOST_MESSAGES,
  initialRouteChoice,
  initialSafeRoute,
  initialShiftingMap,
  isRouteSolved,
  routeChoiceReducer,
  safeRouteReducer,
  shiftingMapReducer,
  signpostFlash,
  signpostLevel,
  visiblePaths,
} from "@/lib/projects/forest-story";
import styles from "./ForestSceneInteractions.module.css";

/** Scene 1: the arrow spins to another direction, then swings back. */
export function TurningSignpost() {
  const [taps, setTaps] = useState(0);
  const level = signpostLevel(taps);
  return (
    <>
      <div className={styles.imageLayer}>
        <button
          type="button"
          className={styles.signpost}
          style={{ left: "15%", top: "21%" }}
          aria-label="Tap the wooden signpost"
          onClick={() => setTaps((t) => t + 1)}
        >
          <span key={taps} className={styles.arrow} data-active={taps > 0} aria-hidden="true">
            {taps > 0 && <span className={styles.flash}>{signpostFlash(taps)}</span>}
          </span>
        </button>
      </div>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">🪧 </span>
        {SIGNPOST_MESSAGES[level]}
      </p>
    </>
  );
}

const MAP_PATHS = [
  "M8 80 C 24 60, 30 50, 46 46",
  "M46 46 C 60 40, 70 30, 92 22",
  "M46 46 C 56 60, 70 70, 90 74",
  "M8 80 C 30 86, 60 84, 90 74",
];

/** Scene 2: place the leaf piece; the map glows, then its routes keep moving. */
export function ShiftingMap() {
  const [state, dispatch] = useReducer(shiftingMapReducer, initialShiftingMap);
  const visible = visiblePaths(state);
  return (
    <div className={styles.panel}>
      <div className={styles.mapCard} data-stage={state.stage}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect width="100" height="100" fill="#efe1bd" />
          <path d="M0 58 C 25 52, 40 66, 60 58 S 90 50, 100 56" fill="none" stroke="#8fc6d8" strokeWidth="5" />
          {[[18, 28], [30, 18], [74, 46], [62, 88], [84, 88]].map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x} ${y} l4 8 h-8 z`} fill="#5f8f4e" />
          ))}
          {MAP_PATHS.map((d, i) => (
            <path key={i} d={d} className={styles.mapPath} data-visible={visible.includes(i)} />
          ))}
          <circle cx="8" cy="80" r="3" fill="#8a5a2c" />
          <path d="M90 70 l4 -6 l4 6 v6 h-8 z" fill="#b5764a" />
        </svg>
        {state.stage === "dormant" && (
          <button type="button" className={styles.leafSlot} aria-label="Place the leaf-shaped piece in the wayfinder" onClick={() => dispatch({ type: "leaf" })}>
            <span aria-hidden="true">🍃</span>
          </button>
        )}
      </div>
      <div className={styles.row}>
        <p className={styles.inline} role="status">
          {state.stage === "dormant"
            ? "The old wayfinder is dark. Tap the leaf-shaped piece to put it back in its slot."
            : state.stage === "glowing"
              ? "Click! The map glows and three glowing paths appear. “We found it! Now we can go home!”"
              : state.shifts % 2 === 1
                ? "The paths moved! One trail vanished and a new one appeared. “Wait! That’s not where the path was!”"
                : "They changed again! A map alone isn’t enough. Maria needs to understand how the forest works."}
        </p>
        {state.stage !== "dormant" && (
          <button type="button" className={styles.action} onClick={() => dispatch({ type: "watch" })}>
            👀 Watch the map
          </button>
        )}
      </div>
    </div>
  );
}

/** Scene 3: pick the route that suits the rabbit, not just the shortest one. */
export function RouteChoice() {
  const [state, dispatch] = useReducer(routeChoiceReducer, initialRouteChoice);
  const chosen = RABBIT_ROUTES.find((r) => r.id === state.chosen);
  const solved = isRouteSolved(state);
  return (
    <div className={styles.panel}>
      <div className={styles.routes} role="group" aria-label="Which route should the rabbit take?">
        {RABBIT_ROUTES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={styles.route}
            aria-pressed={state.chosen === r.id}
            data-verdict={state.tried.includes(r.id) ? (r.suits ? "good" : "no") : undefined}
            disabled={solved && !r.suits}
            onClick={() => dispatch({ type: "choose", id: r.id })}
          >
            <strong>{r.name}</strong>
            <span>{r.note}</span>
          </button>
        ))}
      </div>
      <div className={styles.row}>
        <p className={styles.inline} role="status" data-tone={solved ? "good" : chosen ? "gentle" : undefined}>
          {chosen ? chosen.feedback : "Which path should Maria and the rabbit take? Think about the traveler, not just the distance."}
          {solved && " “What if the best path depends on who’s traveling?”"}
        </p>
        {state.tried.length > 0 && (
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
            Think again
          </button>
        )}
      </div>
    </div>
  );
}

/** Scene 4: connect Forest Entrance → Riverside Trail → Rabbit's Cottage. */
export function SafeRouteMap() {
  const [state, dispatch] = useReducer(safeRouteReducer, initialSafeRoute);
  const done = state.last === "done";
  const pos = (id: string) => SAFE_LANDMARKS.find((l) => l.id === id)!;
  const tried = state.tried ? pos(state.tried).name : "";
  const next = SAFE_ROUTE[state.route.length];
  const rabbitAt = pos(state.route.at(-1) ?? "entrance");
  return (
    <div className={styles.panel}>
      <div className={styles.routeMap} data-done={done}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect width="100" height="100" fill="#e9dcb4" />
          <path d="M30 0 C 36 30, 30 60, 40 100" fill="none" stroke="#8fc6d8" strokeWidth="6" />
          {state.route.slice(1).map((id, i) => {
            const a = pos(state.route[i]);
            const b = pos(id);
            return <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.goldLine} />;
          })}
        </svg>
        {SAFE_LANDMARKS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={styles.landmark}
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
            data-on-route={state.route.includes(l.id)}
            data-safe={l.safe}
            disabled={done}
            aria-label={`${l.name}${state.route.includes(l.id) ? " (on the route)" : ""}`}
            onClick={() => dispatch({ type: "tap", id: l.id })}
          >
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.landmarkName}>{l.name}</span>
          </button>
        ))}
        {state.route.length > 0 && (
          <span className={styles.rabbit} style={{ left: `${rabbitAt.x}%`, top: `${rabbitAt.y}%` }} aria-hidden="true">
            🐇
          </span>
        )}
      </div>
      <div className={styles.row}>
        <p className={styles.inline} role="status" data-tone={done ? "good" : state.last === "unsafe" || state.last === "order" ? "gentle" : undefined}>
          {done
            ? "“We’re home!” Golden paths glow across the map and the rabbit reaches its cottage."
            : state.last === "unsafe"
              ? `The ${tried} isn’t safe for a little rabbit. Try a quiet, ground-level path.`
              : state.last === "order"
                ? `Not yet! Start from the Forest Entrance and follow the path one step at a time.`
                : next
                  ? `Tap the ${pos(next).name} to ${state.route.length === 0 ? "start the route" : "continue the path"}.`
                  : ""}
        </p>
        {state.route.length > 0 && (
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
            Draw again
          </button>
        )}
      </div>
    </div>
  );
}
