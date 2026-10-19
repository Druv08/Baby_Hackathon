"use client";

import { useEffect, useId, useRef, useState } from "react";

import { CHARACTER_THEMES } from "@/data/future-themes";
import { RECEIVED_MESSAGE, filterByFuture, formatMemoryDate, pickFeatured, type FutureFilter } from "@/lib/memories/book";
import { FUTURE_SLUGS, MEMORY_LIMITS } from "@/lib/memories/validation";
import type { FutureSlug } from "@/types/character";
import type { PublicMemory } from "@/types/api";
import styles from "./MemoryBook.module.css";
import { useMemoryFeed, useMemorySubmit } from "./useMemoryBook";
import { MemoryRefresh } from "./MemoryRefresh";

const PAGE_SIZE = 12;

function futureLabel(memory: PublicMemory): string | null {
  return memory.formSlug ? `${CHARACTER_THEMES[memory.formSlug].icon} ${CHARACTER_THEMES[memory.formSlug].label}` : null;
}

/**
 * The interactive parts of the Memory Book page: the Lake of Memories
 * (approved memories as lanterns), the "leave a memory" form and a featured
 * memory. Visitor text is only ever rendered as plain text.
 */
export function MemoryBook() {
  const feed = useMemoryFeed(PAGE_SIZE);
  const { loadPage } = feed;
  const [filter, setFilter] = useState<FutureFilter>("all");
  const [open, setOpen] = useState<PublicMemory | null>(null);
  const [featured, setFeatured] = useState<PublicMemory | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useMemorySubmit(() => void feed.refresh());
  const ids = { name: useId(), future: useId(), message: useId(), website: useId(), count: useId() };
  const length = [...form.message].length;

  // First page on arrival; the featured memory is chosen from it.
  useEffect(() => {
    void loadPage().then((page) => {
      if (page) setFeatured(pickFeatured(page));
    });
  }, [loadPage]);

  function openMemory(memory: PublicMemory) {
    setOpen(memory);
    dialog.current?.showModal();
  }

  const shown = filterByFuture(feed.memories, filter);
  const filterName = filter === "all" ? "" : CHARACTER_THEMES[filter].label;

  return (
    <>
      {/* ── B. Lake of Memories ─────────────────────────────────── */}
      <section id="read-memories" className={`section ${styles.lakeSection}`} aria-labelledby="lake-title">
        <div className="container">
          <header className={styles.head}>
            <h2 id="lake-title">Lake of Memories</h2>
            <p>Each lantern holds a memory left for Maria. Tap one to read it.</p>
          </header>

          <fieldset className={styles.filters}>
            <legend>Show memories for</legend>
            {(["all", ...FUTURE_SLUGS] as const).map((slug) => (
              <button key={slug} type="button" className={styles.chip} aria-pressed={filter === slug} onClick={() => setFilter(slug)}>
                {slug === "all" ? "✨ All futures" : `${CHARACTER_THEMES[slug].icon} ${CHARACTER_THEMES[slug].label}`}
              </button>
            ))}
          </fieldset>
          <MemoryRefresh refresh={feed.refresh} refreshing={feed.refreshing} refreshError={feed.refreshError} />

          <div className={styles.lake} aria-busy={feed.load === "loading"}>
            {feed.load === "loading" && feed.memories.length === 0 && (
              <div className={styles.state} role="status">
                <p>Lighting the lanterns…</p>
              </div>
            )}
            {feed.load === "error" && (
              <div className={styles.state} role="status">
                <p>The lanterns can’t be reached right now. The Memory Book might be resting.</p>
                <button type="button" className={`btn ${styles.lightButton}`} onClick={() => void feed.loadPage(feed.memories.length ? (feed.cursor ?? undefined) : undefined)}>
                  Try again
                </button>
              </div>
            )}
            {feed.load === "ready" && feed.memories.length === 0 && (
              <div className={styles.state}>
                <p>No lanterns are glowing yet.</p>
                <p>
                  <a href="#leave-memory">Leave the very first memory</a> and light the lake for Maria.
                </p>
              </div>
            )}
            {feed.memories.length > 0 && shown.length === 0 && (
              <div className={styles.state}>
                <p>No {filterName} lanterns {feed.cursor ? "among these yet — try loading more." : "yet. Yours could be the first!"}</p>
              </div>
            )}

            {shown.length > 0 && (
              <ul className={styles.lanterns} aria-label={filterName ? `${filterName} memories` : "All memories"}>
                {shown.map((memory, i) => (
                  <li key={memory.id} className={styles.lanternItem} style={{ animationDelay: `${-((i * 1.3) % 6)}s` }}>
                    <button type="button" className={styles.lantern} onClick={() => openMemory(memory)} aria-haspopup="dialog">
                      <span className={styles.lanternIcon} aria-hidden="true">
                        {memory.formSlug ? CHARACTER_THEMES[memory.formSlug].icon : "🏮"}
                      </span>
                      <span className={styles.lanternName}>{memory.visitorName}</span>
                      {memory.formSlug && <span className={styles.lanternFuture}>{CHARACTER_THEMES[memory.formSlug].label}</span>}
                      <span className="visually-hidden">— read memory</span>
                    </button>
                    <span className={styles.reflection} aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}

            {feed.cursor && (
              <div className={styles.more}>
                <button type="button" className={`btn ${styles.lightButton}`} onClick={() => void feed.loadMore()} disabled={feed.load === "loading"}>
                  {feed.load === "loading" ? "Lighting more lanterns…" : "Load more memories"}
                </button>
              </div>
            )}
          </div>
        </div>

        <dialog
          ref={dialog}
          className={styles.dialog}
          aria-labelledby="memory-card-title"
          onClose={() => setOpen(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close(); // backdrop
          }}
        >
          {open && (
            <article className={styles.card}>
              <h3 id="memory-card-title">A memory from {open.visitorName}</h3>
              <p className={styles.cardMessage}>{open.message}</p>
              <p className={styles.cardMeta}>
                {[futureLabel(open) && `Favorite future: ${futureLabel(open)}`, formatMemoryDate(open.createdAt)].filter(Boolean).join(" · ")}
              </p>
              <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close memory">
                ×
              </button>
            </article>
          )}
        </dialog>
      </section>

      {/* ── C. Leave your memory ───────────────────────────────── */}
      <section id="leave-memory" className={`section ${styles.formSection}`} aria-labelledby="leave-title">
        <div className="container">
          <form className={styles.parchment} onSubmit={form.submit} noValidate>
            <h2 id="leave-title">
              <span aria-hidden="true">🖋️</span> Leave Your Memory
            </h2>

            <label className={styles.field} htmlFor={ids.name}>
              Your name
              <input
                id={ids.name}
                className={styles.input}
                value={form.name}
                maxLength={MEMORY_LIMITS.visitorNameMax}
                autoComplete="nickname"
                required
                aria-invalid={!!form.errors.visitorName}
                aria-describedby={form.errors.visitorName ? `${ids.name}-err` : undefined}
                onChange={(e) => form.setName(e.target.value)}
              />
            </label>
            {form.errors.visitorName && <p id={`${ids.name}-err`} className={styles.fieldError}>{form.errors.visitorName}</p>}

            <label className={styles.field} htmlFor={ids.future}>
              Favorite Maria future
              <select id={ids.future} className={styles.input} value={form.future} onChange={(e) => form.setFuture(e.target.value as FutureSlug | "")}>
                <option value="">I can’t choose just one!</option>
                {FUTURE_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {CHARACTER_THEMES[slug].icon} {CHARACTER_THEMES[slug].label}
                  </option>
                ))}
              </select>
            </label>
            {form.errors.formSlug && <p className={styles.fieldError}>{form.errors.formSlug}</p>}

            <label className={styles.field} htmlFor={ids.message}>
              Your memory or wish
              <textarea
                style={{ resize: "none" }}
                id={ids.message}
                className={styles.input}
                rows={4}
                value={form.message}
                maxLength={MEMORY_LIMITS.messageMax}
                required
                aria-invalid={!!form.errors.message}
                aria-describedby={[ids.count, form.errors.message ? `${ids.message}-err` : ""].filter(Boolean).join(" ")}
                onChange={(e) => form.setMessage(e.target.value)}
              />
            </label>
            <p id={ids.count} className={styles.counter} data-near={length > MEMORY_LIMITS.messageMax - 20}>
              {length} / {MEMORY_LIMITS.messageMax} characters
            </p>
            {form.errors.message && <p id={`${ids.message}-err`} className={styles.fieldError}>{form.errors.message}</p>}

            {/* Honeypot: hidden from people, filled in by bots. */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor={ids.website}>
                Website
                <input id={ids.website} tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => form.setWebsite(e.target.value)} />
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={form.send.kind === "sending"}>
              {form.send.kind === "sending" ? "Sending your lantern…" : <><span aria-hidden="true">🏮</span> Send My Memory</>}
            </button>
            {form.send.kind === "sent" && <span className={styles.risingLantern} aria-hidden="true" />}
            <p className={styles.status} role="status" data-tone={form.send.kind === "sent" ? "success" : form.send.kind === "error" ? "warn" : undefined}>
              {form.send.kind === "sent"
                ? RECEIVED_MESSAGE
                : form.send.kind === "error"
                  ? form.send.message
                  : "Kind words only, please. Links aren’t allowed, so the book stays friendly and safe."}
            </p>
          </form>
        </div>
      </section>

      {/* ── D. Featured memory ──────────────────────────────────── */}
      <section className={`section ${styles.featuredSection}`} aria-labelledby="featured-title">
        <div className="container">
          <figure className={styles.featured}>
            <h2 id="featured-title">
              <span aria-hidden="true">🏮</span> A Glowing Memory
            </h2>
            {featured ? (
              <>
                <blockquote className={styles.featuredMessage}>
                  <p>{featured.message}</p>
                </blockquote>
                <figcaption className={styles.featuredBy}>
                  — {featured.visitorName}
                  {futureLabel(featured) && <span> · loves {futureLabel(featured)}</span>}
                  {formatMemoryDate(featured.createdAt) && <span> · {formatMemoryDate(featured.createdAt)}</span>}
                </figcaption>
              </>
            ) : (
              <p className={styles.featuredMessage}>
                {feed.load === "error"
                  ? "This lantern will glow again soon."
                  : feed.load === "ready"
                    ? "This lantern is waiting for its first memory. Will it be yours?"
                    : "Warming up the lantern…"}
              </p>
            )}
          </figure>
        </div>
      </section>
    </>
  );
}
