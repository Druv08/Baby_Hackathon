"use client";

import { useReducer } from "react";

import {
  HELPER_BODIES,
  HELPER_MOVES,
  HELPER_TOOLS,
  availableTask,
  helperReducer,
  initialHelper,
  isModified,
  type HelperBody,
  type HelperMove,
  type HelperTool,
} from "@/lib/projects/inventor-projects";
import styles from "./InventorProjects.module.css";

/** The helper drawn from its three choices (all SVG, centred at 50,50). */
function HelperSvg({ body, move, tool }: { body: HelperBody; move: HelperMove; tool: HelperTool }) {
  return (
    <g>
      {/* Movement */}
      {move === "wheels" && (
        <g className={styles.wheels}>
          <circle cx="36" cy="80" r="8" fill="#5a3a1e" stroke="#d9a441" strokeWidth="2" />
          <circle cx="64" cy="80" r="8" fill="#5a3a1e" stroke="#d9a441" strokeWidth="2" />
        </g>
      )}
      {move === "legs" && (
        <g stroke="#8a5a1c" strokeWidth="4" strokeLinecap="round" className={styles.legs}>
          <path d="M42 68 V84 h-5" />
          <path d="M58 68 V84 h5" />
        </g>
      )}
      {move === "propeller" && (
        <g className={styles.propeller}>
          <path d="M50 22 V12" stroke="#8a5a1c" strokeWidth="3" />
          <ellipse cx="50" cy="11" rx="18" ry="3" fill="#d9a441" />
        </g>
      )}
      {/* Body */}
      {body === "round" && <circle cx="50" cy="48" r="22" fill="#e9bd5c" stroke="#8a5a1c" strokeWidth="3" />}
      {body === "square" && <rect x="29" y="27" width="42" height="42" rx="6" fill="#c9a26a" stroke="#6b4a2a" strokeWidth="3" />}
      {body === "star" && (
        <path d="M50 22 L57 39 L75 40 L61 51 L66 69 L50 59 L34 69 L39 51 L25 40 L43 39 Z" fill="#ffe08a" stroke="#c9922f" strokeWidth="3" strokeLinejoin="round" />
      )}
      {/* Friendly face */}
      <circle cx="43" cy="46" r="3" fill="#3b2a1c" />
      <circle cx="57" cy="46" r="3" fill="#3b2a1c" />
      <path d="M45 54 Q50 58 55 54" fill="none" stroke="#3b2a1c" strokeWidth="2" strokeLinecap="round" />
      {/* Tool on the right arm */}
      <path d="M70 50 H80" stroke="#8a5a1c" strokeWidth="3" strokeLinecap="round" />
      {tool === "grabber" && <path d="M80 44 L88 48 M80 56 L88 52 M80 44 V56" stroke="#8a5a1c" strokeWidth="3" strokeLinecap="round" fill="none" />}
      {tool === "lantern" && (
        <g>
          <path d="M84 44 V50" stroke="#8a5a1c" strokeWidth="2" />
          <rect x="79" y="50" width="10" height="13" rx="2" fill="#ffe08a" stroke="#c9922f" strokeWidth="2" />
        </g>
      )}
      {tool === "watering" && (
        <g>
          <rect x="79" y="46" width="11" height="10" rx="2" fill="#7fb2e5" stroke="#3f6f9e" strokeWidth="2" />
          <path d="M90 49 L96 45" stroke="#3f6f9e" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/**
 * Little Helper Machines: choose a body, a way to move and a tool, assemble
 * the helper, then run the one task its tool allows (move a box, carry a
 * lantern or water a flower).
 */
export function LittleHelperMachines() {
  const [state, dispatch] = useReducer(helperReducer, initialHelper);
  const task = availableTask(state);
  const changed = isModified(state);
  const built = state.built;
  const moveVerb = built ? HELPER_MOVES.find((m) => m.id === built.move)!.verb : "";

  return (
    <div className={styles.game}>
      <div className={styles.helperLayout}>
        <div className={styles.helperStage} data-task={built?.tool ?? "none"} data-running={state.taskDone} data-move={built?.move ?? state.move}>
          <svg viewBox="0 0 200 110" className={styles.helperSvg} role="img" aria-label={built ? `Your assembled helper: ${HELPER_BODIES.find((b) => b.id === built.body)!.label}, ${HELPER_MOVES.find((m) => m.id === built.move)!.label.toLowerCase()}, ${HELPER_TOOLS.find((t) => t.id === built.tool)!.label.toLowerCase()}` : "Helper preview"}>
            <rect x="0" y="92" width="200" height="18" fill="#7a5532" />
            {/* Task props: only the one that matches the assembled tool is shown. */}
            {built?.tool === "grabber" && (
              <g>
                <rect x="160" y="62" width="34" height="5" fill="#5a3a1e" />
                <rect key={`box-${state.runs}`} x="150" y="78" width="14" height="14" fill="#c9a26a" stroke="#6b4a2a" strokeWidth="2" className={styles.box} data-done={state.taskDone} />
              </g>
            )}
            {built?.tool === "lantern" && <circle cx="182" cy="40" r="8" fill={state.taskDone ? "#ffe08a" : "#5a4a3c"} className={styles.hook} />}
            {built?.tool === "watering" && (
              <g>
                <path d="M182 92 V74" stroke="#4f8a3a" strokeWidth="3" />
                <circle key={`flower-${state.runs}`} cx="182" cy="70" r={state.taskDone ? 8 : 4} fill={state.taskDone ? "#ff9fc3" : "#c9a26a"} className={styles.flower} />
              </g>
            )}
            <g key={`helper-${state.runs}`} className={styles.helper} data-running={state.taskDone}>
              <g transform="translate(10 10) scale(0.8)">
                <HelperSvg body={state.body} move={state.move} tool={state.tool} />
              </g>
            </g>
          </svg>
          <p className={styles.helperTag}>{built ? (changed ? "Preview (changes not assembled yet)" : "Assembled helper") : "Preview"}</p>
        </div>

        <div className={styles.lanternControls}>
          <fieldset className={styles.options}>
            <legend>Body</legend>
            {HELPER_BODIES.map((b) => (
              <button key={b.id} type="button" className={styles.option} aria-pressed={state.body === b.id} onClick={() => dispatch({ type: "body", body: b.id })}>
                {b.label}
              </button>
            ))}
          </fieldset>
          <fieldset className={styles.options}>
            <legend>Movement</legend>
            {HELPER_MOVES.map((m) => (
              <button key={m.id} type="button" className={styles.option} aria-pressed={state.move === m.id} onClick={() => dispatch({ type: "move", move: m.id })}>
                {m.label}
              </button>
            ))}
          </fieldset>
          <fieldset className={styles.options}>
            <legend>Tool</legend>
            {HELPER_TOOLS.map((t) => (
              <button key={t.id} type="button" className={styles.option} aria-pressed={state.tool === t.id} onClick={() => dispatch({ type: "tool", tool: t.id })}>
                {t.label}
              </button>
            ))}
          </fieldset>
          <div className={styles.controls}>
            <button type="button" className={styles.primary} onClick={() => dispatch({ type: "assemble" })} disabled={built !== null && !changed}>
              🔧 {built ? "Re-assemble" : "Assemble helper"}
            </button>
            {task && (
              <button type="button" className={styles.primary} onClick={() => dispatch({ type: "task" })} disabled={changed}>
                ▶ {task.task}
              </button>
            )}
            <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
              Reset
            </button>
          </div>
        </div>
      </div>
      <p className={styles.status} role="status" data-tone={state.taskDone ? "success" : undefined}>
        {!built
          ? "Choose a body, a way to move and a tool, then assemble your helper."
          : changed
            ? "You changed some parts. Re-assemble to update your helper."
            : state.taskDone
              ? `Your helper ${moveVerb} over and ${task!.done}`
              : `Your helper is ready! Its ${HELPER_TOOLS.find((t) => t.id === built.tool)!.label.toLowerCase()} can “${task!.task.toLowerCase()}”.`}
      </p>
    </div>
  );
}
