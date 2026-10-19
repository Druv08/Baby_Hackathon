"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./Nightlight.module.css";

const DETAILS = [
  { x: 22, y: 28, text: "A tiny constellation: every question begins with one bright star." },
  { x: 70, y: 30, text: "A moonlit lantern: small memories can guide us home." },
  { x: 48, y: 70, text: "A trail of stardust: there is always another dream to explore." },
];

/** Local illustration-only light. Navigation and narration never sit under its mask. */
export function Nightlight({ slug }: { slug: "star" | "luna" }) {
  const [enabled, setEnabled] = useState(false);
  const [detail, setDetail] = useState("Move, tap, or drag inside the picture to find three little dreams.");
  const area = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const point = useRef({ x: 50, y: 50 });
  const id = useId();
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function locate(x: number, y: number) {
    const rect = area.current?.getBoundingClientRect();
    if (!rect) return;
    point.current = { x: Math.max(0, Math.min(100, (x - rect.left) / rect.width * 100)), y: Math.max(0, Math.min(100, (y - rect.top) / rect.height * 100)) };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const { x, y } = point.current;
      area.current?.style.setProperty("--light-x", `${x}%`);
      area.current?.style.setProperty("--light-y", `${y}%`);
      const found = DETAILS.find(item => Math.hypot(item.x - x, item.y - y) < 18);
      if (found) setDetail(found.text);
    });
  }
  return <section className={`container ${styles.section}`} aria-labelledby={`${id}-title`}>
    <div className={styles.heading}><div><p className="eyebrow">A little light for your dreams</p><h2 id={`${id}-title`}>Moonbeam explorer</h2></div>
      <button type="button" className="btn btn-secondary" aria-pressed={enabled} aria-controls={id} onClick={() => setEnabled(value => !value)}>Nightlight: {enabled ? "On" : "Off"}</button>
    </div>
    <p>Find the hidden stars in this picture. Your story stays bright and readable.</p>
    <div id={id} ref={area} className={styles.area} data-nightlight={enabled} tabIndex={enabled ? 0 : -1}
      role="group" aria-label="Nightlight dream picture. Use arrow keys to move the light."
      onPointerDown={event => { if (enabled) { event.currentTarget.setPointerCapture(event.pointerId); locate(event.clientX, event.clientY); } }}
      onPointerMove={event => { if (enabled && (event.pointerType === "mouse" || event.buttons > 0)) locate(event.clientX, event.clientY); }}
      onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onKeyDown={event => {
        const delta: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
        if (!enabled || !delta[event.key]) return;
        event.preventDefault(); const bounds = event.currentTarget.getBoundingClientRect();
        locate(bounds.left + (point.current.x + delta[event.key][0]) / 100 * bounds.width, bounds.top + (point.current.y + delta[event.key][1]) / 100 * bounds.height);
      }}>
      <Image src={`/stories/${slug}/background.png`} alt="" fill sizes="(max-width: 800px) 94vw, 1100px" />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.dreams} aria-hidden="true">{DETAILS.map((item, index) => <span key={item.text} style={{ left: `${item.x}%`, top: `${item.y}%` }}>✦<small>{["A question", "A memory", "A new dream"][index]}</small></span>)}</div>
    </div>
    <p className={styles.status} role="status">{enabled ? detail : "Switch on your nightlight to explore. You can use a pointer, touch, or arrow keys."}</p>
  </section>;
}
