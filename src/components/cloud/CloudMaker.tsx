"use client";

import { useReducer, useRef } from "react";

import {
  CLOUD_COLORS,
  CLOUD_SCALES,
  CLOUD_SHAPES,
  MAX_CLOUDS,
  cloudMakerReducer,
  initialCloudMaker,
  type CloudColor,
  type CloudScale,
  type CloudShape,
} from "@/lib/projects/cloud-projects";
import { CENTRED_HEART, CENTRED_PLATFORM, CENTRED_PUFF, CENTRED_STAR, FACE } from "./cloud-art";
import styles from "./CloudProjects.module.css";

const SHAPE_PATH: Record<CloudShape, string> = {
  fluffy: CENTRED_PUFF,
  star: CENTRED_STAR,
  heart: CENTRED_HEART,
  platform: CENTRED_PLATFORM,
};

const STEP = 5;
/** Sky canvas is 160 × 90 units (16:9); shapes are ~100 units wide. */
const BASE_SCALE = 0.2;

/** One cloud: a soft edge layer under a rounded fill, with a happy face. */
export function CloudGlyph({ shape, color, scale = 1 }: { shape: CloudShape; color: CloudColor; scale?: number }) {
  const c = CLOUD_COLORS.find((x) => x.id === color)!;
  const d = SHAPE_PATH[shape];
  return (
    <g transform={`scale(${scale})`}>
      <path d={d} fill={c.edge} stroke={c.edge} strokeWidth={12} strokeLinejoin="round" />
      <path d={d} fill={c.fill} stroke={c.fill} strokeWidth={6} strokeLinejoin="round" />
      <g transform={shape === "platform" ? "translate(0 -2)" : undefined}>
        {FACE.eyes.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={FACE.eyeRadius} fill="#4a3a52" />
        ))}
        <path d={FACE.smile} fill="none" stroke="#4a3a52" strokeWidth={2.4} strokeLinecap="round" />
        {FACE.cheeks.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={3.2} fill="#ffb3c7" opacity={0.8} />
        ))}
      </g>
    </g>
  );
}

/**
 * Cloud Maker: choose a shape, colour and size, then tap the sky to place
 * clouds. Keyboard: focus the sky, move the marker with the arrow keys and
 * press Enter or Space to place a cloud there.
 */
export function CloudMaker() {
  const [state, dispatch] = useReducer(cloudMakerReducer, initialCloudMaker);
  const skyRef = useRef<HTMLDivElement>(null);
  const factor = (s: CloudScale) => CLOUD_SCALES.find((x) => x.id === s)!.factor;
  const shapeLabel = CLOUD_SHAPES.find((s) => s.id === state.shape)!.label;
  const colorLabel = CLOUD_COLORS.find((c) => c.id === state.color)!.label;
  const scaleLabel = CLOUD_SCALES.find((s) => s.id === state.scale)!.label;

  return (
    <div className={styles.game}>
      <fieldset className={styles.options}>
        <legend>Shape</legend>
        {CLOUD_SHAPES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.option}
            aria-pressed={state.shape === s.id}
            onClick={() => dispatch({ type: "shape", shape: s.id })}
          >
            <svg viewBox="-60 -40 120 80" className={styles.optionIcon} aria-hidden="true">
              <CloudGlyph shape={s.id} color={state.color} />
            </svg>
            {s.label}
          </button>
        ))}
      </fieldset>

      <fieldset className={styles.options}>
        <legend>Colour</legend>
        {CLOUD_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.swatch}
            style={{ "--swatch": c.fill, "--swatch-edge": c.edge } as React.CSSProperties}
            aria-pressed={state.color === c.id}
            aria-label={c.label}
            title={c.label}
            onClick={() => dispatch({ type: "color", color: c.id })}
          />
        ))}
      </fieldset>

      <fieldset className={styles.options}>
        <legend>Size</legend>
        {CLOUD_SCALES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.option}
            aria-pressed={state.scale === s.id}
            onClick={() => dispatch({ type: "scale", scale: s.id })}
          >
            {s.label}
          </button>
        ))}
      </fieldset>

      <div
        ref={skyRef}
        className={styles.makerSky}
        role="application"
        tabIndex={0}
        aria-label={`Sky canvas with ${state.clouds.length} clouds. Tap to place a ${scaleLabel.toLowerCase()} ${colorLabel.toLowerCase()} ${shapeLabel.toLowerCase()}, or use the arrow keys and Enter.`}
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
            dispatch({ type: "moveCursor", dx: m[0], dy: m[1] });
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            dispatch({ type: "placeAtCursor" });
          }
        }}
        onPointerDown={(e) => {
          const r = skyRef.current!.getBoundingClientRect();
          dispatch({ type: "place", x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      >
        {/* The sky keeps a 16:9 box, so shapes are never stretched. */}
        <svg viewBox="0 0 160 90" aria-hidden="true">
          {state.clouds.map((c) => (
            <g key={c.id} transform={`translate(${c.x * 1.6} ${c.y * 0.9})`} data-cloud={c.shape} data-scale={c.scale}>
              <g className={styles.placed}>
                <CloudGlyph shape={c.shape} color={c.color} scale={BASE_SCALE * factor(c.scale)} />
              </g>
            </g>
          ))}
        </svg>
        {/* Keyboard marker: a ghost of the cloud that Enter will place. */}
        <span className={styles.cursor} style={{ left: `${state.cursor.x}%`, top: `${state.cursor.y}%` }} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.primary} onClick={() => dispatch({ type: "placeAtCursor" })}>
          ☁️ Place at the marker
        </button>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "undo" })} disabled={state.clouds.length === 0}>
          Undo
        </button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "clear" })} disabled={state.clouds.length === 0}>
          Clear the sky
        </button>
      </div>

      <p className={styles.status} role="status">
        {state.clouds.length === 0
          ? `Pick a shape, colour and size, then tap the sky. Next: a ${scaleLabel.toLowerCase()} ${colorLabel.toLowerCase()} ${shapeLabel.toLowerCase()}.`
          : `${state.clouds.length} ${state.clouds.length === 1 ? "cloud" : "clouds"} floating in your sky${state.clouds.length === MAX_CLOUDS ? " (the oldest drifts away when you add more)" : ""}. Next: a ${scaleLabel.toLowerCase()} ${colorLabel.toLowerCase()} ${shapeLabel.toLowerCase()}.`}
      </p>
    </div>
  );
}
