"use client";

import { useReducer } from "react";

import {
  DELIVERY_PATHS,
  KIND_LABEL,
  PLACES,
  TRAVELERS,
  bestRoute,
  canUse,
  deliveryReducer,
  initialDelivery,
  isDelivered,
  pathsFrom,
  reachableDestinations,
  type DeliveryState,
  type PlaceId,
} from "@/lib/projects/forest-projects";
import styles from "./ForestProjects.module.css";

const place = (id: PlaceId) => PLACES.find((p) => p.id === id)!;
const TRAVELER_ICON = { rabbit: "🐇", squirrel: "🐿️", songbird: "🐦" } as const;

function message(s: DeliveryState): string {
  const t = TRAVELERS.find((x) => x.id === s.traveler);
  switch (s.feedback) {
    case "pick-traveler":
      return "Who is delivering a message today? Choose a woodland creature.";
    case "pick-destination":
      return `The ${t!.name.toLowerCase()} likes ${t!.likes}. Where should the message go?`;
    case "plan":
      return `Plan the ${t!.name.toLowerCase()}’s route from the Forest Entrance to ${place(s.destination!).name}. Tap the next landmark.`;
    case "moved":
      return `Now at ${place(s.route.at(-1)!).name}. Where next?`;
    case "unsuitable":
      return `The ${KIND_LABEL[s.tried!.kind!]} to ${place(s.tried!.to).name} isn’t right for a ${t!.name.toLowerCase()}. It prefers ${t!.likes}.`;
    case "not-connected":
      return `There’s no path from ${place(s.route.at(-1)!).name} to ${place(s.tried!.to).name}. Try a connected landmark.`;
    case "visited":
      return `The ${t!.name.toLowerCase()} has already been to ${place(s.tried!.to).name}.`;
    case "delivered": {
      const best = bestRoute(s.traveler!, s.destination!)!;
      const hops = s.route.length - 1;
      return `Delivered! The ${t!.name.toLowerCase()} reached ${place(s.destination!).name} in ${hops} ${hops === 1 ? "step" : "steps"}${hops <= best.length - 1 ? ", along the best route for it" : ""}. 💌`;
    }
  }
}

/**
 * Dream Delivery Map: choose a creature and a destination, then build a
 * route landmark by landmark. Each creature can only use the kinds of path
 * that suit it, so the shortest line isn't always the right one.
 */
export function DreamDeliveryMap() {
  const [state, dispatch] = useReducer(deliveryReducer, initialDelivery);
  const delivered = isDelivered(state);
  const here = state.route.at(-1);
  const onRoute = (a: PlaceId, b: PlaceId) =>
    state.route.some((p, i) => i > 0 && ((state.route[i - 1] === a && p === b) || (state.route[i - 1] === b && p === a)));
  const reachable = state.traveler ? reachableDestinations(state.traveler) : [];

  return (
    <div className={styles.game}>
      <fieldset className={styles.options}>
        <legend>1. Messenger</legend>
        {TRAVELERS.map((t) => (
          <button key={t.id} type="button" className={styles.option} aria-pressed={state.traveler === t.id} onClick={() => dispatch({ type: "traveler", traveler: t.id })}>
            <span aria-hidden="true">{TRAVELER_ICON[t.id]}</span> {t.name}
          </button>
        ))}
      </fieldset>

      {state.traveler && (
        <fieldset className={styles.options}>
          <legend>2. Destination</legend>
          {PLACES.filter((p) => p.id !== "entrance").map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.option}
              aria-pressed={state.destination === p.id}
              disabled={!reachable.includes(p.id)}
              title={reachable.includes(p.id) ? undefined : "This creature can’t get there safely"}
              onClick={() => dispatch({ type: "destination", place: p.id })}
            >
              {p.name}
            </button>
          ))}
        </fieldset>
      )}

      <div className={styles.forestMap} data-delivered={delivered}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M44 0 C 50 30, 44 60, 52 100" fill="none" stroke="#8fc6d8" strokeWidth="7" />
          {DELIVERY_PATHS.map((p) => {
            const a = place(p.a);
            const b = place(p.b);
            const usable = state.traveler ? canUse(state.traveler, p.kind) : true;
            return (
              <line
                key={`${p.a}-${p.b}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={styles.trail}
                data-kind={p.kind}
                data-usable={usable}
                data-used={onRoute(p.a, p.b)}
              />
            );
          })}
        </svg>
        {PLACES.map((p) => {
          const role = p.id === "entrance" ? "start" : p.id === state.destination ? "goal" : undefined;
          return (
            <button
              key={p.id}
              type="button"
              className={styles.place}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              data-role={role}
              data-visited={state.route.includes(p.id)}
              disabled={!state.destination || delivered}
              aria-label={`${p.name}${role === "start" ? " (start)" : role === "goal" ? " (destination)" : ""}${p.id === here ? " (messenger is here)" : ""}`}
              onClick={() => dispatch({ type: "go", to: p.id })}
            >
              <span className={styles.placeDot} aria-hidden="true">
                {p.id === here && state.traveler ? TRAVELER_ICON[state.traveler] : role === "goal" ? "💌" : ""}
              </span>
              <span className={styles.placeName}>{p.name}</span>
            </button>
          );
        })}
      </div>

      <ul className={styles.legend} aria-label="Map key">
        <li data-kind="ground">Ground path</li>
        <li data-kind="log">Fallen log</li>
        <li data-kind="branch">Tree branches</li>
        <li data-kind="air">Treetop flight</li>
      </ul>

      {state.destination && here && !delivered && (
        <div className={styles.controls} role="group" aria-label={`Paths from ${place(here).name}`}>
          {pathsFrom(here).map((p) => (
            <button key={p.to} type="button" className={styles.secondary} data-usable={canUse(state.traveler!, p.kind)} onClick={() => dispatch({ type: "go", to: p.to })}>
              → {place(p.to).name} <span className={styles.kind}>({KIND_LABEL[p.kind]})</span>
            </button>
          ))}
        </div>
      )}

      <p className={styles.status} role="status" data-tone={delivered ? "success" : state.feedback === "unsuitable" ? "warn" : undefined}>
        {message(state)}
      </p>
      {state.route.length > 1 && <p className={styles.trailText}>Route: {state.route.map((id) => place(id).name).join(" → ")}</p>}

      <div className={styles.controls}>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "back" })} disabled={state.route.length < 2 || delivered}>
          Step back
        </button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })} disabled={state.traveler === null}>
          {delivered ? "Plan another delivery" : "Reset"}
        </button>
      </div>
    </div>
  );
}
