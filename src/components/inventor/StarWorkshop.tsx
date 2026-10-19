"use client";

import { useReducer } from "react";

import {
  PARTS,
  WORKSHOP_LEVELS,
  allLevelsSolved,
  correctCount,
  initialWorkshop,
  workshopReducer,
  type PartId,
  type WorkshopState,
} from "@/lib/projects/inventor-projects";
import { Gear } from "./GearSvg";
import styles from "./InventorProjects.module.css";

/** A small picture of each part, used on the bench and in the slots. */
function PartIcon({ part, spinning = false, reverse = false }: { part: PartId; spinning?: boolean; reverse?: boolean }) {
  const p = PARTS[part];
  return (
    <svg viewBox="-20 -20 40 40" className={styles.partIcon} aria-hidden="true">
      {p.kind === "gear" ? (
        <Gear cx={0} cy={0} r={p.size!} teeth={Math.round(p.size! * 0.9)} spinning={spinning} reverse={reverse} className={styles.spinGear} />
      ) : part === "spring" ? (
        <path d="M-14 0 l4 -8 l5 16 l5 -16 l5 16 l5 -16 l4 8" fill="none" stroke="#c9922f" strokeWidth="3" strokeLinejoin="round" className={spinning ? styles.springBounce : undefined} />
      ) : part === "star-core" ? (
        <path d="M0 -15 L4.4 -5 L15 -4.6 L7 2.4 L9.4 13 L0 7.4 L-9.4 13 L-7 2.4 L-15 -4.6 L-4.4 -5 Z" fill="#ffe08a" stroke="#e3a43a" strokeWidth="2" className={spinning ? styles.coreGlow : undefined} />
      ) : part === "belt" ? (
        <rect x="-15" y="-7" width="30" height="14" rx="7" fill="none" stroke="#7a5532" strokeWidth="4" strokeDasharray={spinning ? "4 3" : undefined} className={spinning ? styles.beltRun : undefined} />
      ) : (
        <g stroke="#7a5532" strokeWidth="4" strokeLinecap="round" fill="none" className={spinning ? styles.crankTurn : undefined}>
          <circle r="5" fill="#d9a441" stroke="#8a5a1c" strokeWidth="2" />
          <path d="M0 0 L12 -6 L12 4" />
        </g>
      )}
    </svg>
  );
}

function feedback(state: WorkshopState): string {
  const lvl = WORKSHOP_LEVELS[state.level];
  if (state.result === "solved") {
    return state.level === WORKSHOP_LEVELS.length - 1
      ? "The Star Engine roars to life, and every star lamp in the workshop shines! You finished all three machines. ⭐"
      : `It works! The ${lvl.title.toLowerCase()} is fixed. Ready for the next machine?`;
  }
  if (state.result === "wrong") {
    const right = correctCount(state);
    return `Not quite. ${right} of ${lvl.slots.length} ${right === 1 ? "part is" : "parts are"} in the right place. Swap the others and test again!`;
  }
  if (state.selected) return `Now tap the slot where the ${PARTS[state.selected].label.toLowerCase()} belongs.`;
  if (state.placed.every((p) => p !== null)) return "Every slot is filled. Test the machine!";
  return "Pick a part from the bench, then tap a slot. Tap a filled slot to take the part back out.";
}

/**
 * Star Workshop: three mechanical puzzles of growing difficulty. Choose
 * parts from the bench, place them in the machine, test it, and unlock the
 * next machine. Fully button-based, so it works by mouse, touch and keyboard.
 */
export function StarWorkshop() {
  const [state, dispatch] = useReducer(workshopReducer, initialWorkshop);
  const lvl = WORKSHOP_LEVELS[state.level];
  const solved = state.result === "solved";
  const finished = allLevelsSolved(state);

  return (
    <div className={styles.game}>
      <ol className={styles.levels} aria-label="Machines">
        {WORKSHOP_LEVELS.map((l, i) => (
          <li key={l.id} data-active={i === state.level} data-done={state.solved.includes(l.id)}>
            {state.solved.includes(l.id) ? "✓ " : `${l.id}. `}
            {l.title}
          </li>
        ))}
      </ol>
      <p className={styles.progress} aria-live="polite">
        Machines fixed: {state.solved.length} / {WORKSHOP_LEVELS.length}
      </p>

      <div className={styles.blueprint} data-result={state.result}>
        <h4>
          Level {lvl.id}: {lvl.title}
        </h4>
        <p className={styles.goal}>{lvl.goal}</p>
        <div className={styles.machineRow}>
          {lvl.id === 1 && (
            <span className={styles.fixedPart} aria-hidden="true">
              <PartIcon part="gear-m" spinning={solved} />
            </span>
          )}
          {lvl.slots.map((slot, i) => {
            const part = state.placed[i];
            return (
              <button
                key={slot.label}
                type="button"
                className={styles.slot}
                data-filled={part !== null}
                disabled={solved}
                aria-label={`${slot.label}: ${part ? PARTS[part].label : "empty"}`}
                onClick={() => dispatch(part && !state.selected ? { type: "remove", slot: i } : { type: "place", slot: i })}
              >
                {part ? <PartIcon part={part} spinning={solved} reverse={i % 2 === 1} /> : <span className={styles.slotEmpty} aria-hidden="true" />}
                <span className={styles.slotLabel}>{slot.label}</span>
              </button>
            );
          })}
          {lvl.id === 1 && (
            <span className={styles.fixedPart} aria-hidden="true">
              <PartIcon part="gear-m" spinning={solved} reverse />
            </span>
          )}
        </div>
      </div>

      <div className={styles.bench} role="group" aria-label="Parts on the bench">
        {lvl.bench.map((part) => (
          <button
            key={part}
            type="button"
            className={styles.benchPart}
            aria-pressed={state.selected === part}
            disabled={solved || state.placed.includes(part)}
            onClick={() => dispatch({ type: "pick", part })}
          >
            <PartIcon part={part} />
            {PARTS[part].label}
          </button>
        ))}
      </div>

      <p className={styles.status} role="status" data-tone={solved ? "success" : state.result === "wrong" ? "warn" : undefined}>
        {feedback(state)}
      </p>

      <div className={styles.controls}>
        <button type="button" className={styles.primary} onClick={() => dispatch({ type: "test" })} disabled={solved || state.placed.some((p) => p === null)}>
          ⚙️ Test the machine
        </button>
        {solved && !finished && (
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: "next" })}>
            Next machine →
          </button>
        )}
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "retry" })} disabled={solved || state.placed.every((p) => p === null)}>
          Retry
        </button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "restart" })} disabled={state.solved.length === 0 && state.level === 0 && state.placed.every((p) => p === null)}>
          Start over
        </button>
      </div>
    </div>
  );
}
