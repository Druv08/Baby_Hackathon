"use client";

import { useReducer } from "react";

import { FIELD_GUIDE, fieldGuideReducer, initialFieldGuide } from "@/lib/projects/forest-projects";
import styles from "./ForestProjects.module.css";

/**
 * Forest Friends Field Guide: open the journal, turn its pages, reveal each
 * creature's habitat and favourite route, and collect all four discoveries.
 * Arrow keys turn the pages when the journal has focus.
 */
export function ForestFieldGuide() {
  const [state, dispatch] = useReducer(fieldGuideReducer, initialFieldGuide);
  const { open, page } = state.book;
  const entry = FIELD_GUIDE[page];
  const revealed = state.revealed.includes(entry.id);
  const collected = state.collected.includes(entry.id);

  if (!open) {
    return (
      <div className={styles.game}>
        <button type="button" className={styles.closedBook} onClick={() => dispatch({ type: "open" })}>
          <span aria-hidden="true">📗</span>
          <strong>Forest Friends Field Guide</strong>
          <span>Tap to open the journal</span>
        </button>
        <p className={styles.status} role="status">
          Discoveries: {state.collected.length} / {FIELD_GUIDE.length}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <div
        className={styles.journal}
        tabIndex={0}
        role="group"
        aria-roledescription="journal"
        aria-label={`Field guide, page ${page + 1} of ${FIELD_GUIDE.length}: ${entry.name}. Use the arrow keys to turn pages.`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            dispatch({ type: "next" });
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            dispatch({ type: "prev" });
          }
        }}
      >
        <div className={styles.journalPage} key={entry.id}>
          <span className={styles.journalIcon} aria-hidden="true">
            {entry.icon}
          </span>
          <h4>{entry.name}</h4>
          <p>{entry.story}</p>
        </div>
        <div className={styles.journalPage} data-side="right">
          {revealed ? (
            <dl className={styles.facts}>
              <div>
                <dt>Habitat</dt>
                <dd>{entry.habitat}</dd>
              </div>
              <div>
                <dt>Favourite route</dt>
                <dd>{entry.route}</dd>
              </div>
            </dl>
          ) : (
            <p className={styles.hidden}>Where does the {entry.name.toLowerCase()} live? Reveal its habitat to find out.</p>
          )}
          <div className={styles.controls}>
            {!revealed && (
              <button type="button" className={styles.primary} onClick={() => dispatch({ type: "reveal" })}>
                🔍 Reveal habitat
              </button>
            )}
            {revealed && (
              <button type="button" className={styles.primary} onClick={() => dispatch({ type: "collect" })} disabled={collected}>
                {collected ? "✓ In my discoveries" : "🍃 Add to my discoveries"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "prev" })} disabled={page === 0} aria-label="Previous page">
          ← Previous
        </button>
        <div className={styles.dots} role="group" aria-label="Pages">
          {FIELD_GUIDE.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className={styles.dot}
              aria-label={`${f.name}${state.collected.includes(f.id) ? " (discovered)" : ""}`}
              aria-current={i === page ? "page" : undefined}
              data-collected={state.collected.includes(f.id)}
              onClick={() => dispatch({ type: "goto", page: i })}
            />
          ))}
        </div>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "next" })} disabled={page === FIELD_GUIDE.length - 1} aria-label="Next page">
          Next →
        </button>
      </div>

      <p className={styles.status} role="status" data-tone={state.collected.length === FIELD_GUIDE.length ? "success" : undefined}>
        Discoveries: {state.collected.length} / {FIELD_GUIDE.length}
        {state.collected.length === FIELD_GUIDE.length && " — you’ve met every forest friend! 🌿"}
      </p>
      <div className={styles.controls}>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
          Reset collection
        </button>
      </div>
    </div>
  );
}
