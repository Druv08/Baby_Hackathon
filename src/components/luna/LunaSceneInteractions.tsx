"use client";

import { useReducer, useState } from "react";

import {
  LANTERN_MESSAGES,
  LIBRARY_KEEPSAKES,
  STORY_PAIRS,
  approachReducer,
  cluesReducer,
  initialApproach,
  initialClues,
  initialMatch,
  keepsake,
  lanternLevel,
  memory,
  storyMatchReducer,
} from "@/lib/projects/luna-story";
import styles from "./LunaSceneInteractions.module.css";

/** Scene 1: the fading lantern flickers, shows a faint memory, then fades again. */
export function FadingLantern() {
  const [taps, setTaps] = useState(0);
  const level = lanternLevel(taps);
  return (
    <>
      <div className={styles.imageLayer}>
        <button
          type="button"
          className={styles.lantern}
          style={{ left: "45.5%", top: "77%" }}
          aria-label="Tap the fading lantern"
          onClick={() => setTaps((t) => t + 1)}
        >
          {taps > 0 && (
            <span key={taps} className={styles.flicker} aria-hidden="true">
              {/* A faint silhouette of a memory: two little figures side by side. */}
              <svg viewBox="0 0 40 30" className={styles.silhouette}>
                <circle cx="13" cy="9" r="5" />
                <path d="M6 28 C 6 18, 20 18, 20 28 Z" />
                <circle cx="28" cy="12" r="4" />
                <path d="M22 28 C 22 20, 34 20, 34 28 Z" />
              </svg>
              {[18, 38, 58, 78].map((x, i) => (
                <i key={x} style={{ left: `${x}%`, animationDelay: `${i * 0.18}s` }} />
              ))}
            </span>
          )}
        </button>
      </div>
      <p className={styles.caption} role="status">
        <span aria-hidden="true">🏮 </span>
        {LANTERN_MESSAGES[level]}
      </p>
    </>
  );
}

/** Scene 2: examine three keepsakes in the library; each has its own clue. */
export function KeepsakeClues() {
  const [state, dispatch] = useReducer(cluesReducer, initialClues);
  const last = state.last ? keepsake(state.last) : null;
  const all = state.found.length === LIBRARY_KEEPSAKES.length;
  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        {LIBRARY_KEEPSAKES.map((id) => {
          const k = keepsake(id);
          return (
            <button
              key={id}
              type="button"
              className={styles.keepsake}
              aria-pressed={state.last === id}
              data-found={state.found.includes(id)}
              onClick={() => dispatch({ type: "examine", id })}
            >
              <span aria-hidden="true">{k.icon}</span> {k.name}
            </button>
          );
        })}
        <span className={styles.counter} aria-live="polite">
          Keepsakes examined: {state.found.length}/{LIBRARY_KEEPSAKES.length}
        </span>
      </div>
      <p className={styles.inline} role="status">
        {last ? (
          <>
            <strong>{last.name}:</strong> {last.clue}
          </>
        ) : (
          "Choose a keepsake from the library shelves to examine it."
        )}
        {all && " Each one belongs to someone… but whose memories are they?"}
      </p>
    </div>
  );
}

/** Scene 3: an object alone keeps the lantern dim; the story behind it lights it. */
export function StoryBehind() {
  const [state, dispatch] = useReducer(approachReducer, initialApproach);
  const lastTried = state.tried.at(-1);
  return (
    <div className={styles.panel}>
      <div className={styles.approachRow}>
        <span className={styles.lanternIcon} data-glowing={state.glowing} aria-hidden="true">
          <svg viewBox="0 0 40 56">
            <path d="M20 2 V8" stroke="#c9a24a" strokeWidth="2" />
            <rect x="8" y="8" width="24" height="6" rx="2" fill="#8a6a3a" />
            <rect x="10" y="14" width="20" height="30" rx="4" className={styles.lanternGlass} />
            <rect x="8" y="44" width="24" height="6" rx="2" fill="#8a6a3a" />
          </svg>
        </span>
        <div className={styles.approaches} role="group" aria-label="How can Maria bring the memory back?">
          <button type="button" className={styles.approach} aria-pressed={lastTried === "object"} data-tried={state.tried.includes("object")} onClick={() => dispatch({ type: "try", approach: "object" })}>
            <strong>A.</strong> Place the keepsake inside the lantern
          </button>
          <button type="button" className={styles.approach} aria-pressed={lastTried === "story"} data-tried={state.tried.includes("story")} onClick={() => dispatch({ type: "try", approach: "story" })}>
            <strong>B.</strong> Listen to the story behind the keepsake
          </button>
        </div>
      </div>
      <div className={styles.row}>
        <p className={styles.inline} role="status" data-tone={state.glowing ? "good" : lastTried === "object" ? "gentle" : undefined}>
          {lastTried === "story"
            ? "The lantern glows! “This picture is from the day I taught my little owlet how to fly.” Memories connect objects, people and feelings."
            : lastTried === "object"
              ? "The lantern stays dim. An object alone can’t show the whole memory."
              : "The keepsakes are here, but the lanterns are still dark. What should Maria try?"}
        </p>
        {state.tried.length > 0 && (
          <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/** Scene 4: match three keepsakes to their stories; each match lights a lantern. */
export function MemoryMatch() {
  const [state, dispatch] = useReducer(storyMatchReducer, initialMatch);
  const done = state.matched.length === STORY_PAIRS.length;
  const lastStory = state.last === "matched" && state.tried ? memory(state.tried) : null;
  const pairKeepsakes = STORY_PAIRS.map((p) => p.keepsake);
  return (
    <>
      <div className={styles.imageLayer} data-done={done}>
        <span className={styles.lakeGlow} aria-hidden="true" />
        {done && (
          <span className={styles.floaters} aria-hidden="true">
            {[16, 34, 52, 70, 86].map((x, i) => (
              <i key={x} style={{ left: `${x}%`, animationDelay: `${i * 0.35}s` }} />
            ))}
          </span>
        )}
      </div>
      <div className={styles.panel}>
        <div className={styles.lanterns} aria-hidden="true">
          {STORY_PAIRS.map((p) => (
            <span key={p.keepsake} className={styles.miniLantern} data-lit={state.matched.includes(p.keepsake)} />
          ))}
        </div>
        <div className={styles.matchGrid}>
          <div className={styles.column} role="group" aria-label="Keepsakes">
            {pairKeepsakes.map((id) => {
              const k = keepsake(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.keepsake}
                  aria-pressed={state.selected === id}
                  data-found={state.matched.includes(id)}
                  disabled={state.matched.includes(id)}
                  onClick={() => dispatch({ type: "pick", id })}
                >
                  <span aria-hidden="true">{k.icon}</span> {k.name}
                </button>
              );
            })}
          </div>
          <div className={styles.column} role="group" aria-label="Memories">
            {STORY_PAIRS.map((p) => {
              const m = memory(p.memory);
              const matched = state.matched.includes(p.keepsake);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={styles.memoryCard}
                  data-matched={matched}
                  disabled={matched}
                  onClick={() => dispatch({ type: "match", memory: m.id })}
                >
                  {m.owner}’s memory
                </button>
              );
            })}
          </div>
        </div>
        <p className={styles.counter} aria-live="polite">
          Memories restored: {state.matched.length}/{STORY_PAIRS.length}
        </p>
        <div className={styles.row}>
          <p className={styles.inline} role="status" data-tone={done ? "good" : state.last === "wrong" ? "gentle" : undefined}>
            {done
              ? "Every lantern glows! Golden lights float across the lake. “Every little moment has its own story.”"
              : lastStory
                ? `A lantern brightens: ${lastStory.story}`
                : state.last === "wrong"
                  ? `That keepsake doesn’t belong to ${memory(state.tried!).owner}’s memory. Read the clues and try another.`
                  : state.last === "pick-first"
                    ? "Choose a keepsake first, then the memory it belongs to."
                    : state.selected
                      ? `Whose memory is the ${keepsake(state.selected).name.toLowerCase()} part of?`
                      : "Choose a keepsake, then the memory it belongs to."}
          </p>
          {state.matched.length > 0 && (
            <button type="button" className={styles.ghost} onClick={() => dispatch({ type: "reset" })}>
              Start again
            </button>
          )}
        </div>
      </div>
    </>
  );
}
