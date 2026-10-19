"use client";

import { useReducer } from "react";

import {
  SIGN_DECORATIONS,
  SIGN_DESTINATIONS,
  SIGN_DIRECTIONS,
  SIGN_SHAPES,
  describeSign,
  initialSign,
  signReducer,
  type SignState,
} from "@/lib/projects/forest-projects";
import styles from "./ForestProjects.module.css";

const BOARD: Record<SignState["shape"], string> = {
  arrow: "M14 26 H122 L142 46 L122 66 H14 Z",
  rounded: "M30 26 H126 A20 20 0 0 1 126 66 H30 A20 20 0 0 1 30 26 Z",
  leaf: "M16 46 C 40 14, 110 14, 144 46 C 110 78, 40 78, 16 46 Z",
};

/** A small flower, leaf, star or mushroom at (x, y). */
function Decoration({ kind, x, y }: { kind: SignState["decoration"]; x: number; y: number }) {
  if (kind === "flowers")
    return (
      <g transform={`translate(${x} ${y})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4} cy={Math.sin((a * Math.PI) / 180) * 4} r="3.2" fill="#ff9fc3" />
        ))}
        <circle r="2.4" fill="#ffd27a" />
      </g>
    );
  if (kind === "leaves") return <path transform={`translate(${x} ${y}) rotate(-30)`} d="M0 0 C 4 -8, 12 -8, 14 0 C 12 8, 4 8, 0 0 Z" fill="#7fb05a" stroke="#4f7a32" strokeWidth="0.8" />;
  if (kind === "stars")
    return <path transform={`translate(${x} ${y}) scale(0.55)`} d="M0 -12 L3.5 -4 L12 -3.7 L5.6 2 L7.5 10.4 L0 6 L-7.5 10.4 L-5.6 2 L-12 -3.7 L-3.5 -4 Z" fill="#ffd36a" stroke="#c9922f" strokeWidth="1.2" />;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-1.6" y="0" width="3.2" height="5" rx="1" fill="#fff4e6" />
      <path d="M-6 1 A6 5 0 0 1 6 1 Z" fill="#e2574c" />
      <circle cx="-2" cy="-1.2" r="0.9" fill="#fff" />
      <circle cx="2.2" cy="-2" r="0.8" fill="#fff" />
    </g>
  );
}

/** The finished sign, standing on a little forest trail. */
export function SignpostScene({ sign, compact = false }: { sign: SignState; compact?: boolean }) {
  const label = SIGN_DESTINATIONS.find((d) => d.id === sign.destination)!.label;
  // Left mirrors the board; straight ahead tilts it up the trail.
  const boardTransform = sign.direction === "left" ? "translate(160 0) scale(-1 1)" : sign.direction === "straight" ? "rotate(-12 80 46)" : undefined;
  return (
    <svg
      viewBox="0 0 160 120"
      // On a card, fill the frame edge to edge (cropping a little sky/grass).
      preserveAspectRatio={compact ? "xMidYMid slice" : undefined}
      className={compact ? styles.signThumb : styles.signSvg}
      role="img"
      aria-label={describeSign(sign)}
    >
      <rect width="160" height="120" fill="#cfe6b8" />
      <path d="M0 86 C 40 78, 80 96, 160 84 V120 H0 Z" fill="#a9c98a" />
      <path d="M58 120 C 70 100, 84 96, 104 86 L 116 86 C 98 98, 86 106, 82 120 Z" fill="#e7cf9f" />
      <circle cx="18" cy="70" r="16" fill="#6f9f4a" />
      <circle cx="142" cy="66" r="18" fill="#7fb05a" />
      <rect x="76" y="40" width="8" height="66" rx="2" fill="#8a5a2c" />
      <g transform={boardTransform} className={styles.board} key={`${sign.shape}-${sign.direction}`}>
        <path d={BOARD[sign.shape]} fill="#c8945c" stroke="#7a4f2a" strokeWidth="3" strokeLinejoin="round" />
        <Decoration kind={sign.decoration} x={26} y={34} />
        <Decoration kind={sign.decoration} x={112} y={60} />
        {sign.direction === "left" ? (
          <text x="80" y="51" textAnchor="middle" transform="translate(160 0) scale(-1 1)" className={styles.signText}>
            {label}
          </text>
        ) : (
          <text x="80" y="51" textAnchor="middle" className={styles.signText}>
            {label}
          </text>
        )}
      </g>
    </svg>
  );
}

/**
 * Whispering Signpost Workshop: choose a sign shape, destination,
 * decoration and direction, and the sign on the trail updates live.
 */
export function SignpostWorkshop() {
  const [state, dispatch] = useReducer(signReducer, initialSign);
  const groups = [
    { legend: "Sign shape", type: "shape", list: SIGN_SHAPES, value: state.shape },
    { legend: "Destination", type: "destination", list: SIGN_DESTINATIONS, value: state.destination },
    { legend: "Decoration", type: "decoration", list: SIGN_DECORATIONS, value: state.decoration },
    { legend: "Direction", type: "direction", list: SIGN_DIRECTIONS, value: state.direction },
  ] as const;

  return (
    <div className={styles.game}>
      <div className={styles.signLayout}>
        <figure className={styles.signStage}>
          <SignpostScene sign={state} />
          <figcaption>{describeSign(state)}</figcaption>
        </figure>
        <div className={styles.signControls}>
          {groups.map((g) => (
            <fieldset key={g.type} className={styles.options}>
              <legend>{g.legend}</legend>
              {g.list.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={styles.option}
                  aria-pressed={g.value === o.id}
                  // Each group dispatches its own action type with the chosen value.
                  onClick={() => dispatch({ type: g.type, value: o.id } as Parameters<typeof dispatch>[0])}
                >
                  {o.label}
                </button>
              ))}
            </fieldset>
          ))}
          <div className={styles.controls}>
            <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
              Reset sign
            </button>
          </div>
        </div>
      </div>
      <p className={styles.status} role="status">
        {describeSign(state)}
      </p>
    </div>
  );
}

/** Card artwork until the Whispering Signpost Workshop illustration is supplied: a real rendering of a sign. */
export function SignpostThumbnail() {
  return <SignpostScene sign={{ shape: "arrow", destination: "treetop-village", decoration: "flowers", direction: "right" }} compact />;
}
