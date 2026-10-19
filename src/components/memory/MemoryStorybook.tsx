"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { PublicMemory } from "@/types/api";
import { formatMemoryDate } from "@/lib/memories/book";
import styles from "./MemoryStorybook.module.css";

const subscribe = (listener: () => void) => {
  const query = matchMedia("(min-width: 700px)"); query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const wide = () => matchMedia("(min-width: 700px)").matches;
interface Page { title: string; text: string; caption?: string }

export function MemoryStorybook({ memories, loading, unavailable = false }: { memories: PublicMemory[]; loading: boolean; unavailable?: boolean }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState<"forward" | "backward" | null>(null);
  const [leaving, setLeaving] = useState<Page[]>([]);
  const spread = useSyncExternalStore(subscribe, wide, () => false) ? 2 : 1;
  const lock = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const cover = useRef<HTMLButtonElement>(null), reader = useRef<HTMLDivElement>(null);
  const id = useId();
  const pages: Page[] = [{ title: "Eight dreams, one heart", text: "A little journal for the moments we share. These pages hold the approved memories already glowing on Maria’s lake." },
    ...(memories.length ? memories.map(memory => ({ title: `A memory from ${memory.visitorName}`, text: memory.message, caption: formatMemoryDate(memory.createdAt) }))
      : [{ title: loading ? "Lighting the pages…" : unavailable ? "The book is resting" : "A page waiting for a memory", text: loading ? "Maria is opening the approved memory collection." : unavailable ? "The memory collection cannot be reached right now. Try the refresh control above when you are ready." : "There are no approved memories in this selection yet. Leave a wish below; it will join the book after moderation." }]),
    { title: "Another little moment", text: "There is room for your story, too. You can leave a memory below, or turn back to revisit these pages." }];
  const start = Math.min(index, Math.max(0, pages.length - 1));
  const visible = pages.slice(start, start + spread);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (open) reader.current?.focus(); }, [open]);
  function turn(direction: -1 | 1) {
    if (lock.current) return;
    const next = Math.max(0, Math.min(pages.length - 1, start + direction * spread));
    if (next === start || (direction > 0 && start + spread >= pages.length)) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIndex(next);
    if (reduced) return;
    lock.current = true; setLeaving(visible); setTurning(direction > 0 ? "forward" : "backward");
    timer.current = setTimeout(() => { lock.current = false; setTurning(null); setLeaving([]); }, 400);
  }
  function close() { setOpen(false); cover.current?.focus(); }
  const page = (item: Page, key: string) => <article className={styles.page} key={key}><span className={styles.flower} aria-hidden="true">✿</span><h3>{item.title}</h3><p>{item.text}</p>{item.caption && <small>{item.caption}</small>}</article>;
  return <section className={styles.section} aria-label="Memory storybook">
    <button ref={cover} type="button" className={styles.cover} aria-expanded={open} aria-controls={id} onClick={() => open ? close() : setOpen(true)}>
      <span aria-hidden="true">☾</span><strong>The Memory Book</strong><span>{open ? "Close the book" : "Open the book and turn its pages"}</span>
    </button>
    {open && <div id={id} ref={reader} className={styles.reader} tabIndex={0} data-storybook data-turning={turning ?? "rest"}
      role="group" aria-label="Memory Book reader. Arrow keys turn pages; Escape closes the book."
      onKeyDown={event => { if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); turn(event.key === "ArrowRight" ? 1 : -1); }
        if (event.key === "Escape") { event.stopPropagation(); close(); }
      }}
      onTouchStart={event => { const t = event.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; }}
      onTouchEnd={event => { const t = event.changedTouches[0], from = touch.current; touch.current = null;
        if (from && Math.abs(t.clientX - from.x) > 55 && Math.abs(t.clientX - from.x) > Math.abs(t.clientY - from.y) * 1.5) turn(t.clientX < from.x ? 1 : -1);
      }}>
      <div className={styles.spread}>{visible.map((item, offset) => page(item, `page-${start + offset}`))}
        {turning && <div className={styles.leaf} data-direction={turning} aria-hidden="true">{leaving.map((item, i) => page(item, `leaving-${i}`))}</div>}
      </div>
      <div className={styles.controls}>
        <button type="button" className="btn btn-secondary" disabled={start === 0 || !!turning} onClick={() => turn(-1)}>← Previous page</button>
        <p role="status">Page {start + 1}{visible.length === 2 ? `–${start + 2}` : ""} of {pages.length}</p>
        <button type="button" className="btn btn-primary" disabled={start + spread >= pages.length || !!turning} onClick={() => turn(1)}>Next page →</button>
      </div>
    </div>}
  </section>;
}
