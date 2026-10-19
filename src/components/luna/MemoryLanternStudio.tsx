"use client";

import { useEffect, useId, useReducer, useState } from "react";

import {
  LANTERN_LIGHTS,
  LANTERN_SHAPES,
  LANTERN_SYMBOLS,
  LANTERN_TEXT_MAX,
  clearLanternDraft,
  defaultLantern,
  lanternReducer,
  loadLanternDraft,
  saveLanternDraft,
  type DraftStorage,
  type LanternDesign,
} from "@/lib/projects/luna-projects";
import styles from "./LunaProjects.module.css";

const BODY: Record<LanternDesign["shape"], string> = {
  classic: "M30 22 H70 V78 H30 Z",
  star: "M50 18 L60 40 L84 42 L66 58 L72 82 L50 70 L28 82 L34 58 L16 42 L40 40 Z",
  crescent: "M60 18 A32 32 0 1 0 60 82 A20 32 0 1 1 60 18 Z",
};

const SYMBOL: Record<LanternDesign["symbol"], string> = {
  heart: "M50 62 C 38 54, 38 42, 46 42 C 49 42, 50 45, 50 46 C 50 45, 51 42, 54 42 C 62 42, 62 54, 50 62 Z",
  flower: "M50 44 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M50 52 m-9 0 a5 5 0 1 0 0.1 0 M59 52 a5 5 0 1 0 0.1 0 M50 60 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0",
  star: "M50 40 L53 48 L61 48 L55 53 L57 61 L50 56 L43 61 L45 53 L39 48 L47 48 Z",
  moon: "M54 40 A10 10 0 1 0 54 60 A6 10 0 1 1 54 40 Z",
};

function storage(): DraftStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The lantern itself, drawn from its design. */
export function LanternArt({ design }: { design: LanternDesign }) {
  const light = LANTERN_LIGHTS.find((l) => l.id === design.light)!;
  return (
    <svg viewBox="0 0 100 100" className={styles.lanternArt} style={{ "--glow": light.glow } as React.CSSProperties} aria-hidden="true">
      <path d="M50 4 V16" stroke="#8a6a3a" strokeWidth="2" />
      <path d={BODY[design.shape]} fill={light.glow} stroke={light.deep} strokeWidth="3" strokeLinejoin="round" />
      <path d={SYMBOL[design.symbol]} fill={light.deep} opacity="0.85" />
    </svg>
  );
}

/**
 * Memory Lantern Studio: design a lantern (shape, light, symbol, a short
 * memory), watch it float over the lake, and save the draft in this browser.
 * Drafts never leave the device; the moderated Memory Book is separate.
 */
export function MemoryLanternStudio() {
  const [design, dispatch] = useReducer(lanternReducer, defaultLantern);
  const [note, setNote] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const textId = useId();

  // Offer a previously saved lantern (read after mount: storage is browser-only).
  useEffect(() => {
    setHasDraft(loadLanternDraft(storage()) !== null);
  }, []);

  const shapeLabel = LANTERN_SHAPES.find((s) => s.id === design.shape)!.label;
  const lightLabel = LANTERN_LIGHTS.find((l) => l.id === design.light)!.label;
  const symbolLabel = LANTERN_SYMBOLS.find((s) => s.id === design.symbol)!.label;
  const summary = `${lightLabel} ${shapeLabel.toLowerCase()} with a ${symbolLabel.toLowerCase()}${design.text ? `, holding “${design.text}”` : ""}`;

  return (
    <div className={styles.game}>
      <div className={styles.studioLayout}>
        <figure className={styles.lake} role="img" aria-label={`Preview: a ${summary}, floating over the lake.`}>
          <span className={styles.floatingLantern} key={`${design.shape}-${design.light}-${design.symbol}`}>
            <LanternArt design={design} />
          </span>
          {design.text && <figcaption className={styles.lanternNote}>{design.text}</figcaption>}
        </figure>

        <div className={styles.controlsColumn}>
          <fieldset className={styles.options}>
            <legend>Lantern shape</legend>
            {LANTERN_SHAPES.map((s) => (
              <button key={s.id} type="button" className={styles.option} aria-pressed={design.shape === s.id} onClick={() => dispatch({ type: "shape", value: s.id })}>
                {s.label}
              </button>
            ))}
          </fieldset>
          <fieldset className={styles.options}>
            <legend>Light colour</legend>
            {LANTERN_LIGHTS.map((l) => (
              <button key={l.id} type="button" className={styles.option} aria-pressed={design.light === l.id} onClick={() => dispatch({ type: "light", value: l.id })}>
                <span className={styles.swatch} style={{ background: l.glow, borderColor: l.deep }} aria-hidden="true" />
                {l.label}
              </button>
            ))}
          </fieldset>
          <fieldset className={styles.options}>
            <legend>Memory symbol</legend>
            {LANTERN_SYMBOLS.map((s) => (
              <button key={s.id} type="button" className={styles.option} aria-pressed={design.symbol === s.id} onClick={() => dispatch({ type: "symbol", value: s.id })}>
                {s.label}
              </button>
            ))}
          </fieldset>
          <label className={styles.textLabel} htmlFor={textId}>
            A little memory (optional)
            <input
              id={textId}
              className={styles.input}
              value={design.text}
              maxLength={LANTERN_TEXT_MAX}
              placeholder="The day I learned to swim"
              onChange={(e) => dispatch({ type: "text", value: e.target.value })}
            />
          </label>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                const ok = saveLanternDraft(storage(), design);
                setHasDraft(ok || hasDraft);
                setNote(ok ? "Saved in this browser. Only you can see it." : "This browser can’t save right now.");
              }}
            >
              💾 Save my lantern
            </button>
            {hasDraft && (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  const saved = loadLanternDraft(storage());
                  if (saved) dispatch({ type: "load", design: saved });
                  setNote(saved ? "Your saved lantern is back!" : "No saved lantern found.");
                }}
              >
                Open my saved lantern
              </button>
            )}
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                dispatch({ type: "reset" });
                clearLanternDraft(storage());
                setHasDraft(false);
                setNote("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <p className={styles.status} role="status">
        {note || `Your ${summary}.`} <span className={styles.muted}>Lanterns stay private: they are not posted to the Memory Book.</span>
      </p>
    </div>
  );
}
