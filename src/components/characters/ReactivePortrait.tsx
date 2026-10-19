"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ReactivePortrait.module.css";

/** Rigidly tilts the original picture; never replaces or deforms character pixels. */
export function ReactivePortrait({ name, children }: { name: string; children: ReactNode }) {
  const picture = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [greeting, setGreeting] = useState("");
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reset = () => picture.current?.style.setProperty("--portrait-tilt", "0deg");
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <div className={styles.container}>
    <button ref={picture} type="button" className={styles.portrait} data-reactive-portrait={name}
      aria-label={`Greet ${name}`} title="Move your pointer, tap, or press Enter to say hello"
      onPointerMove={event => {
        if (event.pointerType !== "mouse" || reduced()) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const tilt = Math.max(-2.5, Math.min(2.5, ((event.clientX - bounds.left) / bounds.width - .5) * 5));
        event.currentTarget.style.setProperty("--portrait-tilt", `${tilt.toFixed(2)}deg`);
      }}
      onPointerLeave={reset}
      onClick={() => {
        setGreeting(`${name} says hello!`);
        if (!reduced()) picture.current?.style.setProperty("--portrait-tilt", "2deg");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(reset, 650);
      }}>
      {children}
    </button>
    <span className="visually-hidden" role="status">{greeting}</span>
  </div>;
}
