"use client";

import { useReducer } from "react";

import { CABINET_PAIRS, cabinetMatchReducer, cabinetReducer, initialCabinet } from "@/lib/projects/luna-projects";
import { initialMatch, keepsake, memory } from "@/lib/projects/luna-story";
import styles from "./LunaProjects.module.css";

/**
 * The Keepsake Cabinet: open four compartments, examine each keepsake and
 * its clue, then match it to the memory it belongs to. Reuses the same
 * matching rules as the story's scene 4, extended to all four keepsakes.
 */
export function KeepsakeCabinet() {
  const [cabinet, openDispatch] = useReducer(cabinetReducer, initialCabinet);
  const [match, matchDispatch] = useReducer(cabinetMatchReducer, initialMatch);
  const done = match.matched.length === CABINET_PAIRS.length;
  const selected = match.selected ? keepsake(match.selected) : null;
  const unlocked = match.last === "matched" && match.tried ? memory(match.tried) : null;

  return (
    <div className={styles.game}>
      <div className={styles.cabinet} data-done={done}>
        {CABINET_PAIRS.map(({ keepsake: id }) => {
          const k = keepsake(id);
          const isOpen = cabinet.opened.includes(id);
          const matched = match.matched.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={styles.compartment}
              data-open={isOpen}
              data-matched={matched}
              aria-pressed={match.selected === id}
              disabled={matched}
              aria-label={isOpen ? `${k.name}${matched ? " (memory unlocked)" : ""}` : `Open a cabinet compartment`}
              onClick={() => {
                if (!isOpen) openDispatch({ type: "open", id });
                else matchDispatch({ type: "pick", id });
              }}
            >
              <span className={styles.compartmentInner} aria-hidden="true">
                {isOpen ? k.icon : "🔒"}
              </span>
              <span className={styles.compartmentLabel}>{isOpen ? k.name : "Closed"}</span>
            </button>
          );
        })}
      </div>

      {selected && <p className={styles.clue}><strong>{selected.name}:</strong> {selected.clue}</p>}

      <div className={styles.memoryChoices} role="group" aria-label="Whose memory is it?">
        {CABINET_PAIRS.map(({ memory: id, keepsake: k }) => {
          const m = memory(id);
          const matched = match.matched.includes(k);
          return (
            <button key={id} type="button" className={styles.memoryChoice} data-matched={matched} disabled={matched} onClick={() => matchDispatch({ type: "match", memory: id })}>
              {matched ? `✓ ${m.owner}` : `${m.owner}’s memory`}
            </button>
          );
        })}
      </div>

      <p className={styles.progress} aria-live="polite">
        Memories unlocked: {match.matched.length} / {CABINET_PAIRS.length}
      </p>
      <p className={styles.status} role="status" data-tone={done ? "success" : match.last === "wrong" ? "warn" : undefined}>
        {done
          ? "Every keepsake has found its memory, and the whole cabinet glows! Little moments become the stories we carry forever. ✨"
          : unlocked
            ? `Unlocked: ${unlocked.story}`
            : match.last === "wrong"
              ? `Hmm, that keepsake isn’t part of ${memory(match.tried!).owner}’s memory. Read its clue again.`
              : match.last === "pick-first"
                ? "Open a compartment and choose a keepsake first."
                : selected
                  ? `Whose memory does the ${selected.name.toLowerCase()} belong to?`
                  : cabinet.opened.length < CABINET_PAIRS.length
                    ? "Open the cabinet’s compartments to find the keepsakes inside."
                    : "Choose a keepsake, then the memory it belongs to."}
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            openDispatch({ type: "reset" });
            matchDispatch({ type: "reset" });
          }}
          disabled={cabinet.opened.length === 0}
        >
          Close the cabinet and start again
        </button>
      </div>
    </div>
  );
}
