"use client";

import { useReducer, useRef } from "react";

import { initialPagerState } from "@/lib/projects/pager";
import { ATLAS_ENTRIES, atlasReducer, type AtlasEntry } from "@/lib/projects/star-projects";
import styles from "./StarProjects.module.css";

function EntryPattern({ entry }: { entry: AtlasEntry }) {
  return (
    <svg viewBox="0 0 100 100" className={styles.pattern} aria-hidden="true">
      {entry.lines.map(([a, b], i) => (
        <line key={i} x1={entry.stars[a].x} y1={entry.stars[a].y} x2={entry.stars[b].x} y2={entry.stars[b].y} />
      ))}
      {entry.stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={3.2} />
      ))}
    </svg>
  );
}

export function DreamAtlas() {
  const [state, dispatch] = useReducer(atlasReducer, initialPagerState);
  const swipeStart = useRef<number | null>(null);
  const entry = ATLAS_ENTRIES[state.page];
  const last = ATLAS_ENTRIES.length - 1;

  if (!state.open) {
    return (
      <div className={styles.game}>
        <button type="button" className={styles.atlasCover} onClick={() => dispatch({ type: "open" })}>
          <span aria-hidden="true" className={styles.coverStar}>
            ✦
          </span>
          <span className={styles.coverTitle}>The Dream Atlas</span>
          <span>Tap to open the enchanted atlas</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <div
        className={styles.atlas}
        role="group"
        aria-roledescription="star atlas"
        aria-label={`Page ${state.page + 1} of ${ATLAS_ENTRIES.length}: ${entry.name}`}
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
        <div className={styles.atlasArt}>
          <EntryPattern entry={entry} />
        </div>
        <div className={styles.atlasText} aria-live="polite">
          <p className={styles.muted}>
            Entry {state.page + 1} of {ATLAS_ENTRIES.length}
          </p>
          <h4 className={styles.entryName}>{entry.name}</h4>
          <p className={styles.badge}>Theme: {entry.theme}</p>
          <p className={styles.wish}>
            <span className={styles.wishLabel}>The wish:</span> “{entry.wish}”
          </p>
          <p>{entry.story}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "prev" })} disabled={state.page === 0}>
          <span aria-hidden="true">←</span> Previous
        </button>
        <span className={styles.dots}>
          {ATLAS_ENTRIES.map((e, i) => (
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
        <button type="button" className={styles.primary} onClick={() => dispatch({ type: "next" })} disabled={state.page === last}>
          Next <span aria-hidden="true">→</span>
        </button>
        <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "close" })}>
          Close atlas
        </button>
      </div>
      <p className={styles.muted}>Tip: use ← and → keys, or swipe the page.</p>
    </div>
  );
}
