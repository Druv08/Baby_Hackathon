"use client";

import { useReducer, useRef } from "react";

import { BLOOM_ENTRIES, bookReducer, initialBookState } from "@/lib/projects/bloom-book";
import { FlowerHead } from "./ProjectArt";
import styles from "./projects.module.css";

export function BloomBook() {
  const [state, dispatch] = useReducer(bookReducer, initialBookState);
  const swipeStart = useRef<number | null>(null);
  const entry = BLOOM_ENTRIES[state.page];
  const last = BLOOM_ENTRIES.length - 1;

  if (!state.open) {
    return (
      <div className={styles.game}>
        <button type="button" className={styles.bookCover} onClick={() => dispatch({ type: "open" })}>
          <span className={styles.coverFlower} aria-hidden="true">
            <FlowerHead petal="#ff8fb8" center="#ffe7a3" size={72} />
          </span>
          <span className={styles.coverTitle}>Bloom Book</span>
          <span className={styles.coverHint}>Tap to open Maria’s flower journal</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <div
        className={styles.book}
        role="group"
        aria-roledescription="flower journal"
        aria-label={`Page ${state.page + 1} of ${BLOOM_ENTRIES.length}: ${entry.name}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") dispatch({ type: "next" });
          if (e.key === "ArrowLeft") dispatch({ type: "prev" });
        }}
        onPointerDown={(e) => (swipeStart.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (dx < -40) dispatch({ type: "next" });
          if (dx > 40) dispatch({ type: "prev" });
        }}
      >
        <div className={styles.pageArt} aria-hidden="true">
          <FlowerHead petal={entry.petal} center={entry.center} size={120} />
        </div>
        <div className={styles.pageText} aria-live="polite">
          <p className={styles.pageNumber}>
            Page {state.page + 1} of {BLOOM_ENTRIES.length}
          </p>
          <h4 className={styles.entryName}>{entry.name}</h4>
          <p className="badge">Means: {entry.meaning}</p>
          <p>{entry.description}</p>
          <p className={styles.lesson}>
            <span aria-hidden="true">🌱 </span>
            <strong>Little lesson:</strong> {entry.lesson}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => dispatch({ type: "prev" })}
          disabled={state.page === 0}
        >
          <span aria-hidden="true">←</span> Previous
        </button>
        <span className={styles.dots}>
          {BLOOM_ENTRIES.map((e, i) => (
            <button
              key={e.id}
              type="button"
              className={styles.dot}
              aria-label={`Go to ${e.name}`}
              aria-current={i === state.page ? "page" : undefined}
              onClick={() => dispatch({ type: "goto", page: i })}
            />
          ))}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch({ type: "next" })}
          disabled={state.page === last}
        >
          Next <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "close" })}>
          Close book
        </button>
      </div>
      <p className={styles.hint}>Tip: use ← and → keys, or swipe the page.</p>
    </div>
  );
}
