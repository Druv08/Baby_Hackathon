"use client";

import Image from "next/image";
import { useReducer } from "react";

import { OCEAN_CREATURES, allDiscovered, discoveryReducer, initialDiscovery } from "@/lib/projects/aqua-projects";
import styles from "./AquaProjects.module.css";

/**
 * Ocean Discovery: explore the supplied underwater artwork, tap a creature
 * (or pick it from the list), read about it and add it to the collection.
 */
export function OceanDiscovery() {
  const [state, dispatch] = useReducer(discoveryReducer, initialDiscovery);
  const selected = OCEAN_CREATURES.find((c) => c.id === state.selected);
  const done = allDiscovered(state);

  return (
    <div className={styles.game}>
      <div className={styles.world}>
        <Image
          src="/projects/aqua/ocean-discovery.png"
          alt="Aqua Maria and the little turtle exploring an underwater kingdom with jellyfish, a seahorse and a manta ray."
          width={1448}
          height={1086}
          sizes="(max-width: 900px) 94vw, 900px"
        />
        {OCEAN_CREATURES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.creature}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            aria-pressed={state.selected === c.id}
            data-collected={state.collected.includes(c.id)}
            aria-label={`${c.name}${state.collected.includes(c.id) ? " (collected)" : ""}`}
            onClick={() => dispatch({ type: "select", id: c.id })}
          >
            <span aria-hidden="true">{state.collected.includes(c.id) ? "✓" : "?"}</span>
          </button>
        ))}
      </div>

      <div className={styles.controls} role="group" aria-label="Sea creatures">
        {OCEAN_CREATURES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.chip}
            aria-pressed={state.selected === c.id}
            onClick={() => dispatch({ type: "select", id: c.id })}
          >
            {state.collected.includes(c.id) ? "✓ " : ""}
            {c.name}
          </button>
        ))}
      </div>

      <div className={styles.card} aria-live="polite">
        {selected ? (
          <>
            <h4>{selected.name}</h4>
            <p>{selected.description}</p>
            <button
              type="button"
              className={styles.primary}
              onClick={() => dispatch({ type: "collect" })}
              disabled={state.collected.includes(selected.id)}
            >
              {state.collected.includes(selected.id) ? "✓ In your collection" : "🐚 Add to my discoveries"}
            </button>
          </>
        ) : (
          <p>Tap a glowing “?” in the ocean, or a name above, to discover a sea creature.</p>
        )}
      </div>

      <div className={styles.collection}>
        <p className={styles.status} role="status" data-tone={done ? "success" : undefined}>
          Discoveries: {state.collected.length} / {OCEAN_CREATURES.length}
          {done && " — you met every friend in the kingdom! 🌊"}
        </p>
        <ul className={styles.shelf} aria-label="My discoveries">
          {OCEAN_CREATURES.map((c) => (
            <li key={c.id} data-found={state.collected.includes(c.id)}>
              {state.collected.includes(c.id) ? c.name : "?"}
            </li>
          ))}
        </ul>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })} disabled={state.collected.length === 0 && !state.selected}>
          Start a new dive
        </button>
      </div>
    </div>
  );
}
