"use client";

import { useReducer } from "react";

import {
  BUTTERFLIES,
  butterflyById,
  initialSanctuaryState,
  SANCTUARY_FLOWERS,
  sanctuaryReducer,
} from "@/lib/projects/butterfly-corner";
import { Butterfly, FlowerHead } from "./ProjectArt";
import styles from "./projects.module.css";

export function ButterflyCorner() {
  const [state, dispatch] = useReducer(sanctuaryReducer, initialSanctuaryState);
  const visitor = butterflyById(state.visitorId);
  const flower = SANCTUARY_FLOWERS.find((f) => f.id === state.flowerId);
  const complete = state.collection.length === BUTTERFLIES.length;

  return (
    <div className={styles.game}>
      <p className={styles.hint}>
        These are fantasy butterflies from Maria’s world — each one loves a different flower.
      </p>

      <fieldset className={styles.choices}>
        <legend>Plant a flower</legend>
        {SANCTUARY_FLOWERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.choice}
            aria-pressed={state.flowerId === f.id}
            onClick={() => dispatch({ type: "plant", flowerId: f.id })}
          >
            <FlowerHead petal={f.petal} center="#fff3c4" size={28} /> {f.name}
          </button>
        ))}
      </fieldset>

      <div className={styles.sanctuary} aria-hidden="true">
        {flower && (
          <span className={styles.sanctuaryFlower} key={flower.id}>
            <FlowerHead petal={flower.petal} center="#fff3c4" size={70} />
          </span>
        )}
        {visitor && (
          <span className={styles.flyIn} key={`${visitor.id}-${state.flowerId}`}>
            <Butterfly wing={visitor.wing} accent={visitor.accent} size={84} />
          </span>
        )}
        {!flower && <span className={styles.emptyPatch}>An empty flower patch…</span>}
      </div>

      <p className={styles.status} role="status">
        {visitor ? (
          <>
            <strong>A {visitor.name} arrived!</strong> {visitor.fact}
          </>
        ) : (
          "Choose a flower and see who comes to visit."
        )}
      </p>

      <div className={styles.collectionBox}>
        <p>
          <strong>
            Butterflies discovered: {state.collection.length} / {BUTTERFLIES.length}
          </strong>
          {complete && " — you found them all! 🦋"}
        </p>
        <ul className={styles.collectionList}>
          {BUTTERFLIES.map((b) => {
            const found = state.collection.includes(b.id);
            return (
              <li key={b.id} data-found={found}>
                {found ? <Butterfly wing={b.wing} accent={b.accent} size={40} /> : <span aria-hidden="true">?</span>}
                <span>{found ? b.name : "Not yet discovered"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.controls}>
        {flower && (
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: "clear" })}>
            Clear the patch
          </button>
        )}
        {state.collection.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "reset" })}>
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
