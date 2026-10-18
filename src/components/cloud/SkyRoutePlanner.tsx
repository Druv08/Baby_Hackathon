"use client";

import { useReducer } from "react";

import {
  ISLANDS,
  SKY_ROUTES,
  initialRoutePlanner,
  isArrived,
  routePlannerReducer,
  routesFrom,
  shortestSafeRoute,
  type IslandId,
  type RouteKind,
  type RoutePlannerState,
} from "@/lib/projects/cloud-projects";
import styles from "./CloudProjects.module.css";

const island = (id: IslandId) => ISLANDS.find((i) => i.id === id)!;

const KIND_TEXT: Record<RouteKind, string> = {
  safe: "safe cloud bridge",
  broken: "broken bridge",
  windy: "strong headwind",
};

function message(state: RoutePlannerState): string {
  const tried = state.tried ? island(state.tried).name : "";
  const here = state.path.length ? island(state.path.at(-1)!).name : "";
  const goal = state.destination ? island(state.destination).name : "";
  switch (state.feedback) {
    case "pick-start":
      return "Choose a starting island on the map.";
    case "pick-destination":
      return `Starting at ${here}. Now choose where you want to go.`;
    case "same-island":
      return "You’re already there! Pick a different island to visit.";
    case "plan":
      return `Plan a route from ${here} to ${goal}. Pick the next island along a cloud bridge.`;
    case "hopped":
      return `Floated across to ${here}! Where next on the way to ${goal}?`;
    case "broken":
      return `Oh no, the bridge to ${tried} is broken. Find another way around!`;
    case "windy":
      return `Whoosh! A strong headwind blows you back from ${tried}. Try a calmer route.`;
    case "no-route":
      return `There’s no cloud bridge from ${here} to ${tried}. Look for a connected island.`;
    case "already-visited":
      return `You’ve already been to ${tried}. Keep exploring toward ${goal}!`;
    case "arrived": {
      const best = shortestSafeRoute(state.start!, state.destination!);
      const hops = state.path.length - 1;
      const bestHops = best ? best.length - 1 : hops;
      return hops <= bestHops
        ? `You reached ${goal} in ${hops} ${hops === 1 ? "hop" : "hops"}: the shortest safe route! 🎉`
        : `You reached ${goal} in ${hops} hops! There’s also a shorter safe route with ${bestHops}.`;
    }
  }
}

/**
 * Sky Route Planner: pick a start and a destination, then hop island to
 * island along safe cloud bridges, avoiding broken bridges and headwinds.
 * Islands are buttons; in the planning phase the bridges from the current
 * island are also listed as buttons for keyboard and touch users.
 */
export function SkyRoutePlanner() {
  const [state, dispatch] = useReducer(routePlannerReducer, initialRoutePlanner);
  const here = state.path.at(-1) ?? null;
  const arrived = isArrived(state);
  const onPath = (a: IslandId, b: IslandId) =>
    state.path.some((p, i) => i > 0 && ((state.path[i - 1] === a && p === b) || (state.path[i - 1] === b && p === a)));

  return (
    <div className={styles.game}>
      <div className={styles.routeMap} data-arrived={arrived}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {SKY_ROUTES.map((r) => {
            const a = island(r.from);
            const b = island(r.to);
            const used = onPath(r.from, r.to);
            return (
              <line
                key={`${r.from}-${r.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={styles.route}
                data-kind={r.kind}
                data-used={used}
              />
            );
          })}
        </svg>
        {/* Markers on the problem bridges, so they're readable without colour. */}
        {SKY_ROUTES.filter((r) => r.kind !== "safe").map((r) => {
          const a = island(r.from);
          const b = island(r.to);
          return (
            <span
              key={`m-${r.from}-${r.to}`}
              className={styles.routeMarker}
              data-kind={r.kind}
              style={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%` }}
              aria-hidden="true"
            >
              {r.kind === "broken" ? "✕" : "≈"}
            </span>
          );
        })}
        {ISLANDS.map((i) => {
          const role = i.id === state.start ? "start" : i.id === state.destination ? "goal" : undefined;
          return (
            <button
              key={i.id}
              type="button"
              className={styles.island}
              style={{ left: `${i.x}%`, top: `${i.y}%` }}
              data-role={role}
              data-here={i.id === here}
              data-visited={state.path.includes(i.id)}
              aria-label={`${i.name}${role === "start" ? " (start)" : role === "goal" ? " (destination)" : ""}${i.id === here && state.destination ? " (you are here)" : ""}`}
              onClick={() => dispatch({ type: "island", id: i.id })}
            >
              <span className={styles.islandArt} aria-hidden="true">
                {role === "start" ? "🚩" : role === "goal" ? "🏁" : ""}
                {i.id === here && state.destination ? <span className={styles.paw}>🐾</span> : null}
              </span>
              <span className={styles.islandName}>{i.name}</span>
            </button>
          );
        })}
      </div>

      <ul className={styles.legend} aria-label="Map key">
        <li data-kind="safe">Safe cloud bridge</li>
        <li data-kind="broken">✕ Broken bridge</li>
        <li data-kind="windy">≈ Strong headwind</li>
      </ul>

      {state.destination && here && !arrived && (
        <div className={styles.bridges}>
          <p className={styles.muted}>Bridges from {island(here).name}:</p>
          <div className={styles.controls}>
            {routesFrom(here).map((r) => (
              <button
                key={r.to}
                type="button"
                className={styles.secondary}
                data-kind={r.kind}
                onClick={() => dispatch({ type: "island", id: r.to })}
              >
                → {island(r.to).name} <span className={styles.kind}>({KIND_TEXT[r.kind]})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={styles.status} role="status" data-tone={arrived ? "success" : ["broken", "windy", "no-route"].includes(state.feedback) ? "warn" : undefined}>
        {message(state)}
      </p>

      {state.path.length > 1 && (
        <p className={styles.trail}>
          Your route: {state.path.map((id) => island(id).name).join(" → ")}
        </p>
      )}

      <div className={styles.controls}>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "undo" })} disabled={state.start === null || arrived}>
          Undo
        </button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })} disabled={state.start === null}>
          {arrived ? "Plan another trip" : "Start over"}
        </button>
      </div>
    </div>
  );
}
