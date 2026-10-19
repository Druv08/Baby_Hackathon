"use client";

import { useState } from "react";

import {
  BUILDER_STARS,
  cleanConstellationName,
  SUGGESTED_NAMES,
  type SavedConstellation,
} from "@/lib/projects/star-projects";
import { ConstellationBoard } from "./ConstellationBoard";
import styles from "./StarProjects.module.css";

/** Free drawing: connect any stars, name the result, keep it in your sky. */
export function ConstellationBuilder() {
  const [saved, setSaved] = useState<SavedConstellation[]>([]);
  const [board, setBoard] = useState(0); // remount the board for a fresh sky

  return (
    <div className={styles.game}>
      <ConstellationBoard
        key={board}
        stars={BUILDER_STARS}
        label="Constellation board. Choose a star, then another, to draw a glowing line between them."
        status={(s) =>
          s.edges.length === 0
            ? s.active
              ? "Now choose another star to connect."
              : "Choose any star to begin your constellation."
            : `Your constellation has ${s.edges.length} ${s.edges.length === 1 ? "line" : "lines"}. Keep connecting, or give it a name!`
        }
      >
        {(s, dispatch) => (
          <form
            noValidate
            className={styles.nameForm}
            onSubmit={(e) => {
              e.preventDefault();
              const name = cleanConstellationName(s.name);
              if (!name || s.edges.length === 0) return;
              setSaved((list) => [...list, { name, edges: s.edges }]);
              setBoard((b) => b + 1);
            }}
          >
            <label className={styles.nameLabel}>
              Name your constellation
              <input
                className={styles.nameInput}
                value={s.name}
                maxLength={30}
                placeholder="e.g. The Little Paw"
                onChange={(e) => dispatch({ type: "rename", name: e.target.value })}
              />
            </label>
            <div className={styles.suggestions} aria-label="Suggested names">
              {SUGGESTED_NAMES.map((n) => (
                <button key={n} type="button" className={styles.chip} onClick={() => dispatch({ type: "rename", name: n })}>
                  {n}
                </button>
              ))}
            </div>
            <button type="submit" className={styles.primary} disabled={s.edges.length === 0 || !cleanConstellationName(s.name)}>
              <span aria-hidden="true">✨</span> Add to my sky
            </button>
          </form>
        )}
      </ConstellationBoard>

      <div className={styles.saved}>
        <p>
          <strong>My sky:</strong> {saved.length === 0 ? "no constellations yet." : `${saved.length} named ${saved.length === 1 ? "constellation" : "constellations"}`}
        </p>
        {saved.length > 0 && (
          <ul className={styles.savedList}>
            {saved.map((c, i) => (
              <li key={i}>
                <span aria-hidden="true">⭐ </span>
                {c.name} <span className={styles.muted}>({c.edges.length} {c.edges.length === 1 ? "line" : "lines"})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
