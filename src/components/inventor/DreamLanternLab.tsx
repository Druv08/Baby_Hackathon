"use client";

import { useId, useReducer } from "react";

import {
  GLOW_MAX,
  GLOW_MIN,
  LANTERN_COLORS,
  LANTERN_SHAPES,
  glowStrength,
  initialLantern,
  lanternReducer,
  type LanternShape,
} from "@/lib/projects/inventor-projects";
import styles from "./InventorProjects.module.css";

const SHAPE_PATH: Record<LanternShape, string> = {
  star: "M50 14 L60.6 38 L86 39 L66 55 L73 80 L50 66 L27 80 L34 55 L14 39 L39.4 38 Z",
  moon: "M62 16 A34 34 0 1 0 62 84 A27 27 0 1 1 62 16 Z",
  crystal: "M50 12 L74 34 L66 78 L34 78 L26 34 Z M26 34 L74 34 M50 12 L42 34 L50 78 L58 34 Z",
};

/**
 * Dream Lantern Lab: pick a shape and colour, set the glow, switch the
 * lantern on or off, and see it update live. All controls are native
 * buttons and a range input, so mouse, touch and keyboard all work.
 */
export function DreamLanternLab() {
  const [state, dispatch] = useReducer(lanternReducer, initialLantern);
  const glowId = useId();
  const color = LANTERN_COLORS.find((c) => c.id === state.color)!;
  const shape = LANTERN_SHAPES.find((s) => s.id === state.shape)!;
  const k = glowStrength(state);

  return (
    <div className={styles.game}>
      <div className={styles.lanternLayout}>
        <figure
          className={styles.lanternStage}
          data-on={state.on}
          style={{ "--light": color.light, "--deep": color.deep, "--k": k } as React.CSSProperties}
          aria-label={`${color.label} ${shape.label}, ${state.on ? `glowing at ${state.glow}%` : "switched off"}`}
          role="img"
        >
          <span className={styles.halo} />
          <svg viewBox="0 0 100 120" className={styles.lanternSvg}>
            <path d="M50 0 V10" stroke="#8a5a1c" strokeWidth="2.5" />
            <circle cx="50" cy="10" r="3" fill="none" stroke="#8a5a1c" strokeWidth="2" />
            <g transform="translate(0 12)">
              <path
                d={SHAPE_PATH[state.shape]}
                fill={state.on ? color.light : "#5a4a3c"}
                fillOpacity={state.on ? 0.35 + 0.65 * k : 0.9}
                stroke={state.on ? color.deep : "#3b2a1c"}
                strokeWidth="3"
                strokeLinejoin="round"
                className={styles.lanternBody}
                data-shape={state.shape}
              />
              {state.on && <circle cx="50" cy="52" r={4 + 6 * k} fill="#fffaf0" opacity={0.5 + 0.5 * k} className={styles.flame} />}
            </g>
            <rect x="40" y="96" width="20" height="6" rx="2" fill="#c9922f" />
          </svg>
          <figcaption className={styles.lanternCaption}>
            {state.on ? `${color.label} ${shape.label} · glow ${state.glow}%` : `${shape.label} (off)`}
          </figcaption>
        </figure>

        <div className={styles.lanternControls}>
          <fieldset className={styles.options}>
            <legend>Shape</legend>
            {LANTERN_SHAPES.map((s) => (
              <button key={s.id} type="button" className={styles.option} aria-pressed={state.shape === s.id} onClick={() => dispatch({ type: "shape", shape: s.id })}>
                {s.label}
              </button>
            ))}
          </fieldset>
          <fieldset className={styles.options}>
            <legend>Light colour</legend>
            {LANTERN_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.option}
                aria-pressed={state.color === c.id}
                onClick={() => dispatch({ type: "color", color: c.id })}
              >
                <span className={styles.swatch} style={{ background: c.light, borderColor: c.deep }} aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </fieldset>
          <label className={styles.rangeLabel} htmlFor={glowId}>
            Glow intensity: <strong>{state.glow}%</strong>
            <input
              id={glowId}
              type="range"
              min={GLOW_MIN}
              max={GLOW_MAX}
              step={5}
              value={state.glow}
              disabled={!state.on}
              onChange={(e) => dispatch({ type: "glow", glow: Number(e.target.value) })}
              className={styles.range}
            />
          </label>
          <div className={styles.controls}>
            <button type="button" className={styles.primary} aria-pressed={state.on} onClick={() => dispatch({ type: "toggle" })}>
              {state.on ? "💡 Switch off" : "✨ Switch on"}
            </button>
            <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
              Reset lantern
            </button>
          </div>
        </div>
      </div>
      <p className={styles.status} role="status">
        {state.on
          ? `Your ${color.label.toLowerCase()} ${shape.label.toLowerCase()} is glowing at ${state.glow}%.`
          : "The lantern is resting. Switch it on to light up the workshop!"}
      </p>
    </div>
  );
}
