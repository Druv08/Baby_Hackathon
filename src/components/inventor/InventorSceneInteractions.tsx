"use client";

import { useReducer, useState } from "react";

import {
  ACTIVATION_PARTS,
  GEAR_SLOTS,
  GEAR_TRAY,
  LANTERN_MESSAGES,
  MACHINE_PARTS,
  activationReducer,
  gearChallengeReducer,
  gearHint,
  initialActivation,
  initialGearChallenge,
  initialParts,
  lanternLevel,
  partsReducer,
  type GearSize,
} from "@/lib/projects/inventor-story";
import { Gear } from "./GearSvg";
import styles from "./InventorSceneInteractions.module.css";

/** Scene 1: the lantern brightens, flickers and fades again — it can't stay lit yet. */
export function FlickerLantern() {
  const [taps, setTaps] = useState(0);
  const level = lanternLevel(taps);
  return (
    <>
      <div className={styles.imageLayer}>
        {/* The village's light is fading: a gentle dusk over the scene. */}
        <span className={styles.dusk} aria-hidden="true" />
        <button
          type="button"
          className={styles.lantern}
          style={{ left: "41%", top: "74%" }}
          aria-label="Tap the flickering star lantern"
          onClick={() => setTaps((t) => t + 1)}
        >
          <span key={taps} className={styles.flare} data-active={taps > 0} aria-hidden="true" />
        </button>
      </div>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">🏮 </span>
        {LANTERN_MESSAGES[level]}
      </p>
    </>
  );
}

/** Scene 2: learn what the gear, spring and Star Chamber do. */
export function MachineDiagram() {
  const [state, dispatch] = useReducer(partsReducer, initialParts);
  const last = MACHINE_PARTS.find((p) => p.id === state.last);
  const all = state.learned.length === MACHINE_PARTS.length;
  return (
    <>
      <div className={styles.imageLayer}>
        {MACHINE_PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.part}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            data-learned={state.learned.includes(p.id)}
            aria-pressed={state.last === p.id}
            aria-label={`What does the ${p.name.toLowerCase()} do?`}
            onClick={() => dispatch({ type: "learn", id: p.id })}
          >
            <span aria-hidden="true">{state.learned.includes(p.id) ? "✓" : "?"}</span>
          </button>
        ))}
      </div>
      <div className={styles.panel}>
        <div className={styles.row}>
          {MACHINE_PARTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.chip}
              aria-pressed={state.last === p.id}
              onClick={() => dispatch({ type: "learn", id: p.id })}
            >
              {state.learned.includes(p.id) ? "✓ " : ""}
              {p.name}
            </button>
          ))}
          <span className={styles.counter} aria-live="polite">
            Parts learned: {state.learned.length}/{MACHINE_PARTS.length}
          </span>
        </div>
        <p className={styles.inline} role="status">
          {last ? (
            <>
              <strong>{last.name}:</strong> {last.purpose}
            </>
          ) : (
            "Tap a “?” on the machine (or a part name) to learn how it works."
          )}
          {all && " Now Maria understands the machine… but it still needs fixing."}
        </p>
      </div>
    </>
  );
}

const SIZE_R: Record<GearSize, number> = { small: 9, medium: 13, large: 17 };
const SLOT_X = [26, 56, 80];

/** Scene 3: put the right gear in each slot. Wrong tries give gentle hints. */
export function GearChallenge() {
  const [state, dispatch] = useReducer(gearChallengeReducer, initialGearChallenge);
  const right = state.checked === "right";
  const full = state.slots.every((g) => g !== null);
  const caption = right
    ? "“Wait… I think I know what’s wrong!” The gears line up, ready for the next try."
    : state.checked === "wrong"
      ? `Clunk! ${gearHint(state)} Every try teaches something new.`
      : state.selected
        ? `Now tap a slot for the ${state.selected} gear.`
        : full
          ? "All three slots are filled. Test the gears!"
          : "Pick a gear from the tray, then tap the slot where it belongs.";
  return (
    <div className={styles.panel}>
      <div className={styles.gearBoard} data-state={state.checked}>
        <svg viewBox="0 0 100 40" aria-hidden="true">
          <rect x="4" y="34" width="92" height="3" rx="1.5" fill="#7a5532" />
          {state.slots.map((g, i) =>
            g ? (
              <Gear key={i} cx={SLOT_X[i]} cy={20} r={SIZE_R[g]} teeth={GEAR_TRAY.find((t) => t.size === g)!.teeth} spinning={right} reverse={i % 2 === 1} className={styles.gear} />
            ) : (
              <circle key={i} cx={SLOT_X[i]} cy={20} r={SIZE_R[GEAR_SLOTS[i].need]} fill="none" stroke="#e8c98a" strokeWidth="0.8" strokeDasharray="2 2" />
            ),
          )}
        </svg>
        <div className={styles.slots}>
          {GEAR_SLOTS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              className={styles.slot}
              style={{ left: `${SLOT_X[i]}%` }}
              data-filled={state.slots[i] !== null}
              disabled={right}
              aria-label={`${s.label}${state.slots[i] ? ` (holds the ${state.slots[i]} gear)` : " (empty)"}`}
              onClick={() => dispatch({ type: "place", slot: i })}
            />
          ))}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.tray} role="group" aria-label="Gear tray">
          {GEAR_TRAY.map((g) => (
            <button
              key={g.size}
              type="button"
              className={styles.chip}
              aria-pressed={state.selected === g.size}
              disabled={right}
              onClick={() => dispatch({ type: "pick", size: g.size })}
            >
              <svg viewBox="-20 -20 40 40" className={styles.trayGear} aria-hidden="true">
                <Gear cx={0} cy={0} r={SIZE_R[g.size]} teeth={g.teeth} />
              </svg>
              {g.label}
            </button>
          ))}
        </div>
        <div className={styles.tray}>
          <button type="button" className={styles.action} onClick={() => dispatch({ type: "test" })} disabled={!full || right}>
            ⚙️ Test the gears
          </button>
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "clear" })}>
            Try again
          </button>
        </div>
      </div>
      <p className={styles.inline} role="status" data-tone={right ? "good" : state.checked === "wrong" ? "gentle" : undefined}>
        {caption}
      </p>
    </div>
  );
}

/** Scene 4: fit the main gear, spring and wheel, then wake the machine up. */
export function MachineActivation() {
  const [state, dispatch] = useReducer(activationReducer, initialActivation);
  const ready = state.fitted.length === ACTIVATION_PARTS.length;
  const last = ACTIVATION_PARTS.find((p) => p.id === state.fitted.at(-1));
  return (
    <>
      <div className={styles.imageLayer} data-running={state.running}>
        <span className={styles.glow} aria-hidden="true" />
        {state.running && (
          <span className={styles.particles} aria-hidden="true">
            {[12, 26, 40, 55, 68, 82, 92].map((x, i) => (
              <i key={x} style={{ left: `${x}%`, animationDelay: `${i * 0.25}s` }} />
            ))}
            <span className={styles.spark} />
          </span>
        )}
      </div>
      <div className={styles.panel}>
        <div className={styles.machine} data-running={state.running}>
          <svg viewBox="0 0 100 30" aria-hidden="true">
            <Gear cx={20} cy={15} r={11} teeth={14} spinning={state.running} className={styles.gear} />
            {state.fitted.includes("main-gear") ? (
              <Gear cx={40} cy={15} r={9} teeth={12} spinning={state.running} reverse className={styles.gear} />
            ) : (
              <circle cx={40} cy={15} r={9} fill="none" stroke="#e8c98a" strokeWidth="0.7" strokeDasharray="2 2" />
            )}
            {state.fitted.includes("spring") ? (
              <path d="M52 15 l3 -5 l3 10 l3 -10 l3 10 l3 -10 l3 5" fill="none" stroke="#e9bd5c" strokeWidth="1.6" strokeLinejoin="round" className={styles.spring} />
            ) : (
              <path d="M52 15 h18" stroke="#e8c98a" strokeWidth="0.7" strokeDasharray="2 2" />
            )}
            {state.fitted.includes("wheel") ? (
              <Gear cx={80} cy={15} r={6} teeth={9} spinning={state.running} reverse className={styles.gear} />
            ) : (
              <circle cx={80} cy={15} r={6} fill="none" stroke="#e8c98a" strokeWidth="0.7" strokeDasharray="2 2" />
            )}
            <circle cx={93} cy={15} r={4} className={styles.chamberLight} />
          </svg>
        </div>
        <div className={styles.row}>
          <div className={styles.tray}>
            {ACTIVATION_PARTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={styles.step}
                data-done={state.fitted.includes(p.id)}
                disabled={state.fitted.includes(p.id) || state.running}
                onClick={() => dispatch({ type: "fit", part: p.id })}
              >
                <span aria-hidden="true">{state.fitted.includes(p.id) ? "✓" : i + 1}</span> {p.label}
              </button>
            ))}
          </div>
          <div className={styles.tray}>
            <button type="button" className={styles.action} onClick={() => dispatch({ type: "start" })} disabled={!ready || state.running}>
              ✨ Give it a gentle turn
            </button>
            {state.fitted.length > 0 && (
              <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
                Start again
              </button>
            )}
          </div>
        </div>
        <p className={styles.inline} role="status" data-tone={state.running ? "good" : undefined}>
          {state.running
            ? "Click… click… whirrrrr! The gears turn together, the Dream Spark floats free and the lanterns glow again! “I did it!”"
            : ready
              ? "Everything is in place. Give the machine one gentle turn!"
              : last
                ? last.done
                : "Fit the three parts Maria prepared, one at a time."}
        </p>
      </div>
    </>
  );
}
