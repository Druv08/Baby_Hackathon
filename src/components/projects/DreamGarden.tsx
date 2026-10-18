"use client";

import { useEffect, useReducer } from "react";

import {
  GARDEN_SEEDS,
  GARDEN_STEP_LABELS,
  gardenReducer,
  gardenStep,
  initialGardenState,
  type GardenStage,
} from "@/lib/projects/dream-garden";
import { FlowerHead } from "./ProjectArt";
import styles from "./projects.module.css";

const STATUS: Record<GardenStage, string> = {
  choose: "Pick a seed to plant in Maria’s Dream Garden.",
  chosen: "Good choice! Now plant it in the soil.",
  planted: "The seed is tucked in. It looks thirsty…",
  watered: "Splash! The seed is drinking the water…",
  sprout: "A tiny sprout! It needs some sunshine to bloom.",
  bloom: "It bloomed! Time to celebrate.",
  celebrate: "Hooray! Your flower is part of the Dream Garden now.",
};

export function DreamGarden() {
  const [state, dispatch] = useReducer(gardenReducer, initialGardenState);
  const seed = GARDEN_SEEDS.find((s) => s.id === state.seedId);
  const step = gardenStep(state.stage);

  // After watering, the seed grows into a sprout on its own.
  useEffect(() => {
    if (state.stage !== "watered") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => dispatch({ type: "grow" }), reduced ? 300 : 1400);
    return () => window.clearTimeout(timer);
  }, [state.stage]);

  const stemHeight = { choose: 0, chosen: 0, planted: 0, watered: 0, sprout: 46, bloom: 92, celebrate: 92 }[state.stage];

  return (
    <div className={styles.game}>
      <ol className={styles.steps} aria-label="Gardening steps">
        {GARDEN_STEP_LABELS.map((label, i) => (
          <li key={label} data-state={i + 1 < step ? "done" : i + 1 === step ? "current" : "todo"}>
            <span aria-hidden="true">{i + 1}</span> {label}
          </li>
        ))}
      </ol>

      <div className={styles.gardenBed} data-stage={state.stage} aria-hidden="true">
        {state.stage === "celebrate" && <div className={styles.confetti} />}
        {stemHeight > 0 && (
          <div className={styles.plant} style={{ height: stemHeight }}>
            <span className={styles.leafLeft} />
            <span className={styles.leafRight} />
            {(state.stage === "bloom" || state.stage === "celebrate") && seed && (
              <span className={styles.flowerHead}>
                <FlowerHead petal={seed.petal} center={seed.center} size={78} />
              </span>
            )}
          </div>
        )}
        {(state.stage === "chosen" || state.stage === "planted" || state.stage === "watered") && seed && (
          <span className={styles.seed} data-buried={state.stage !== "chosen"} style={{ background: seed.center }} />
        )}
        {state.stage === "watered" && (
          <div className={styles.rain}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        <div className={styles.soil} data-wet={state.stage === "watered" || state.stage === "sprout"} />
      </div>

      <p className={styles.status} role="status">
        {STATUS[state.stage]}
      </p>

      <div className={styles.controls}>
        {(state.stage === "choose" || state.stage === "chosen") && (
          <fieldset className={styles.choices}>
            <legend>Choose a seed</legend>
            {GARDEN_SEEDS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.choice}
                aria-pressed={state.seedId === s.id}
                onClick={() => dispatch({ type: "choose", seedId: s.id })}
              >
                <FlowerHead petal={s.petal} center={s.center} size={28} /> {s.name}
              </button>
            ))}
          </fieldset>
        )}
        {state.stage === "chosen" && (
          <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "plant" })}>
            <span aria-hidden="true">🕳️</span> Plant the seed
          </button>
        )}
        {state.stage === "planted" && (
          <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "water" })}>
            <span aria-hidden="true">💧</span> Water it
          </button>
        )}
        {state.stage === "watered" && (
          <button type="button" className="btn" disabled>
            <span aria-hidden="true">🌱</span> Growing…
          </button>
        )}
        {state.stage === "sprout" && (
          <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "sunshine" })}>
            <span aria-hidden="true">☀️</span> Give it sunshine
          </button>
        )}
        {state.stage === "bloom" && (
          <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "celebrate" })}>
            <span aria-hidden="true">🎉</span> Celebrate!
          </button>
        )}
        {state.stage !== "choose" && (
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: "restart" })}>
            <span aria-hidden="true">↺</span> {state.stage === "celebrate" ? "Plant another" : "Start over"}
          </button>
        )}
      </div>

      {state.grown.length > 0 && (
        <p className={styles.collection}>
          <span>Grown today:</span>
          {state.grown.map((id, i) => {
            const s = GARDEN_SEEDS.find((g) => g.id === id)!;
            return (
              <span key={i} className={styles.collectionItem} title={s.name}>
                <FlowerHead petal={s.petal} center={s.center} size={26} />
                <span className="visually-hidden">{s.name}</span>
              </span>
            );
          })}
        </p>
      )}
    </div>
  );
}
