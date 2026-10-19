"use client";

import { useReducer } from "react";

import {
  DEBRIS,
  FRAGMENTS,
  SUPPORTS,
  coralGardenReducer,
  gardenStage,
  initialCoralGarden,
  isClean,
  type CoralGardenState,
  type FragmentId,
} from "@/lib/projects/aqua-projects";
import styles from "./AquaProjects.module.css";

const fragment = (id: FragmentId) => FRAGMENTS.find((f) => f.id === id)!;

function message(s: CoralGardenState): string {
  const picked = s.selected ? fragment(s.selected).label.toLowerCase() : "";
  switch (s.feedback) {
    case "start":
      return "Stage 1: tap the three pieces of litter to clean the garden.";
    case "cleaned":
      return isClean(s)
        ? "The garden is clean! Stage 2: choose a coral fragment, then the spot it would like best."
        : `Nice! ${DEBRIS.length - s.removed.length} more ${DEBRIS.length - s.removed.length === 1 ? "piece" : "pieces"} to go.`;
    case "clean-first":
      return "Let’s clean up the litter first, so the coral has a safe place to grow.";
    case "picked":
      return `You picked the ${picked}. Which spot would it like?`;
    case "pick-first":
      return "Choose a coral fragment first, then tap a spot.";
    case "not-suitable":
      return `Hmm, the ${picked} doesn’t feel at home there. Try a different spot!`;
    case "planted":
      return "Planted! It settled in happily. Choose the next fragment.";
    case "restored":
      return "The reef glows and little fish are swimming home! 🐠 (A make-believe garden: real coral takes years to grow.)";
  }
}

/**
 * Coral Care Garden: clean three pieces of litter, then plant three coral
 * fragments on the supports that suit them, and watch the reef glow.
 * A whimsical, simplified game, not a model of real restoration.
 */
export function CoralCareGarden() {
  const [state, dispatch] = useReducer(coralGardenReducer, initialCoralGarden);
  const stage = gardenStage(state);

  return (
    <div className={styles.game}>
      <ol className={styles.stages} aria-label="Stages">
        {(["clean", "restore", "celebrate"] as const).map((st, i) => (
          <li key={st} data-active={stage === st} data-done={["clean", "restore", "celebrate"].indexOf(stage) > i}>
            {i + 1}. {st === "clean" ? "Clean" : st === "restore" ? "Restore" : "Celebrate"}
          </li>
        ))}
      </ol>

      <div className={styles.garden} data-stage={stage}>
        <svg viewBox="0 0 100 62" preserveAspectRatio="none" aria-hidden="true" className={styles.gardenArt}>
          <defs>
            <linearGradient id="garden-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8fe3f0" />
              <stop offset="1" stopColor="#2f86b4" />
            </linearGradient>
            <linearGradient id="garden-ray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fffbe6" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100" height="62" fill="url(#garden-water)" />
          {/* Sunlight from the surface. */}
          <path d="M14 0 h7 l10 44 h-9 z M44 0 h5 l6 36 h-6 z M70 0 h8 l12 40 h-10 z" fill="url(#garden-ray)" />
          {/* Kelp swaying at the edges. */}
          <path className={styles.kelp} d="M3 62 q-3 -10 1 -20 q3 -9 -1 -18" fill="none" stroke="#5f9e6e" strokeWidth="1.6" strokeLinecap="round" />
          <path className={styles.kelp} d="M96 62 q3 -12 -1 -22 q-3 -8 1 -16" fill="none" stroke="#5f9e6e" strokeWidth="1.6" strokeLinecap="round" />
          {/* Sandy floor with pebbles and shells. */}
          <path d="M0 50 Q25 45 50 49 T100 48 V62 H0 Z" fill="#f2e2bf" />
          <ellipse cx="34" cy="55" rx="1.6" ry="0.9" fill="#e3c9a0" />
          <ellipse cx="90" cy="57" rx="1.2" ry="0.7" fill="#e3c9a0" />
          <path d="M42 57 q1.5 -2.4 3 0 z" fill="#ffd6e2" />
          {/* Rocky supports: a sunny ledge, a gentle arch and a low sandy rock. */}
          <rect x="7" y="32" width="26" height="6" rx="3" fill="#8f7a70" />
          <rect x="9" y="37" width="22" height="13" rx="2" fill="#7c6a62" />
          <path d="M38 50 V32 Q50 16 62 32 V50 H56 V36 Q50 27 44 36 V50 Z" fill="#8f7a70" />
          <rect x="70" y="41" width="22" height="5" rx="2.5" fill="#8f7a70" />
        </svg>
        {state.removed.length < DEBRIS.length &&
          DEBRIS.map((d) =>
            state.removed.includes(d.id) ? null : (
              <button
                key={d.id}
                type="button"
                className={styles.debris}
                data-kind={d.id}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                aria-label={`Remove the ${d.label.toLowerCase()}`}
                onClick={() => dispatch({ type: "remove", id: d.id })}
              >
                <span aria-hidden="true" />
              </button>
            ),
          )}
        {SUPPORTS.map((sp) => {
          const planted = state.planted[sp.id];
          return (
            <button
              key={sp.id}
              type="button"
              className={styles.support}
              style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
              data-planted={planted !== undefined}
              disabled={planted !== undefined}
              aria-label={planted ? `${sp.label}: ${fragment(planted).label} planted` : `Plant on the ${sp.label.toLowerCase()} (${sp.hint})`}
              onClick={() => dispatch({ type: "plant", support: sp.id })}
            >
              {planted ? (
                <span className={styles.coral} style={{ "--coral": fragment(planted).color } as React.CSSProperties} data-kind={planted} aria-hidden="true" />
              ) : (
                <span className={styles.supportLabel}>{sp.label}</span>
              )}
            </button>
          );
        })}
        {stage === "celebrate" && (
          <span className={styles.reefGlow} aria-hidden="true">
            {[30, 45, 60].map((t, i) => (
              <svg key={t} viewBox="0 0 40 20" className={styles.gardenFish} style={{ top: `${t}%`, animationDelay: `${i * 0.6}s` }}>
                <path d="M2 10 Q14 0 28 10 Q14 20 2 10 Z M28 10 L38 3 L38 17 Z" fill={["#ff9a5c", "#ffd34d", "#9ad7ff"][i]} />
                <circle cx="9" cy="9" r="1.6" fill="#1d2b44" />
              </svg>
            ))}
          </span>
        )}
      </div>

      <fieldset className={styles.options} disabled={!isClean(state)}>
        <legend>Coral fragments</legend>
        {FRAGMENTS.map((f) => {
          const used = Object.values(state.planted).includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={styles.chip}
              aria-pressed={state.selected === f.id}
              disabled={used}
              onClick={() => dispatch({ type: "pick", id: f.id })}
            >
              <span className={styles.swatch} style={{ background: f.color }} aria-hidden="true" /> {f.label}
              {used ? " ✓" : ""}
            </button>
          );
        })}
      </fieldset>

      <p className={styles.status} role="status" data-tone={stage === "celebrate" ? "success" : state.feedback === "not-suitable" ? "warn" : undefined}>
        {message(state)}
      </p>
      <div className={styles.controls}>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })} disabled={state.removed.length === 0}>
          Reset the garden
        </button>
      </div>
    </div>
  );
}
