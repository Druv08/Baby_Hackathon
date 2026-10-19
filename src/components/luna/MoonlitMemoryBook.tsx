"use client";

import { useId, useState } from "react";

import { useMemoryFeed, useMemorySubmit } from "@/components/memory/useMemoryBook";
import { MemoryRefresh } from "@/components/memory/MemoryRefresh";
import { CHARACTER_THEMES } from "@/data/future-themes";
import { FUTURE_SLUGS, MEMORY_LIMITS } from "@/lib/memories/validation";
import type { FutureSlug } from "@/types/character";
import styles from "./LunaProjects.module.css";

const PAGE_SIZE = 6;

/**
 * Moonlit Memory Book: a themed view of the site's one shared Memory Book
 * (the same hooks and API as the /memory-book page). It reads approved
 * memories (cursor pagination) and sends new ones through the existing
 * moderated API, where they wait as `pending` until approved.
 * Visitor text is rendered only as plain text.
 */
export function MoonlitMemoryBook() {
  const [open, setOpen] = useState(false);
  const { memories, cursor, load, loadPage, refresh, refreshing, refreshError } = useMemoryFeed(PAGE_SIZE);
  const { name, setName, message, setMessage, future, setFuture, website, setWebsite, errors, send, submit: onSubmit } = useMemorySubmit();
  const ids = { name: useId(), message: useId(), future: useId(), website: useId() };

  function openBook() {
    setOpen(true);
    if (load === "idle") void loadPage();
  }

  if (!open) {
    return (
      <div className={styles.game}>
        <button type="button" className={styles.closedBook} onClick={openBook}>
          <span aria-hidden="true">📖</span>
          <strong>Moonlit Memory Book</strong>
          <span>Tap to open and read the village’s memories</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <section className={styles.bookPages} aria-label="Shared memories">
        <h4 className={styles.bookHeading}>Memories from Maria’s friends</h4>
        <MemoryRefresh refresh={refresh} refreshing={refreshing} refreshError={refreshError} />
        {load === "loading" && memories.length === 0 && <p className={styles.muted}>Opening the pages…</p>}
        {load === "error" && (
          <p className={styles.notice} role="status">
            The Memory Book is resting right now, so the pages can’t be read.{" "}
            <button type="button" className={styles.linkButton} onClick={() => void loadPage()}>
              Try again
            </button>
          </p>
        )}
        {load === "ready" && memories.length === 0 && <p className={styles.muted}>No memories have been shared yet. Yours could be the first!</p>}
        <ul className={styles.memories}>
          {memories.map((m) => (
            <li key={m.id} className={styles.memory}>
              <p className={styles.memoryText}>{m.message}</p>
              <p className={styles.memoryBy}>
                — {m.visitorName}
                {m.formSlug && <span> · loves {CHARACTER_THEMES[m.formSlug].label}</span>}
              </p>
            </li>
          ))}
        </ul>
        {cursor && (
          <button type="button" className={styles.secondary} onClick={() => void loadPage(cursor)} disabled={load === "loading"}>
            {load === "loading" ? "Turning pages…" : "Read older memories"}
          </button>
        )}
      </section>

      <form className={styles.memoryForm} onSubmit={onSubmit} noValidate>
        <h4 className={styles.bookHeading}>Share a memory</h4>
        <label htmlFor={ids.name}>
          Your name
          <input
            id={ids.name}
            className={styles.input}
            value={name}
            maxLength={MEMORY_LIMITS.visitorNameMax}
            autoComplete="nickname"
            aria-invalid={!!errors.visitorName}
            aria-describedby={errors.visitorName ? `${ids.name}-err` : undefined}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {errors.visitorName && <p id={`${ids.name}-err`} className={styles.fieldError}>{errors.visitorName}</p>}

        <label htmlFor={ids.future}>
          Favorite Maria future (optional)
          <select id={ids.future} className={styles.input} value={future} onChange={(e) => setFuture(e.target.value as FutureSlug | "")}>
            <option value="">No favorite yet</option>
            {FUTURE_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {CHARACTER_THEMES[slug].label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={ids.message}>
          Your memory or message
          <textarea
            data-resize-none
            style={{ resize: "none" }}
            id={ids.message}
            className={styles.input}
            rows={3}
            value={message}
            maxLength={MEMORY_LIMITS.messageMax}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${ids.message}-err` : undefined}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <p className={styles.counter}>
          {[...message].length} / {MEMORY_LIMITS.messageMax}
        </p>
        {errors.message && <p id={`${ids.message}-err`} className={styles.fieldError}>{errors.message}</p>}

        {/* Honeypot: hidden from people, filled in by bots. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor={ids.website}>
            Website
            <input id={ids.website} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        <button type="submit" className={styles.primary} disabled={send.kind === "sending"}>
          {send.kind === "sending" ? "Sending…" : "🏮 Send my memory"}
        </button>
        <p className={styles.status} role="status" data-tone={send.kind === "sent" ? "success" : send.kind === "error" ? "warn" : undefined}>
          {send.kind === "sent"
            ? "Thank you! Your memory is waiting to be checked by a grown-up before it appears in the book."
            : send.kind === "error"
              ? send.message
              : "Memories are checked before they appear, so the book stays kind and safe."}
        </p>
      </form>
    </div>
  );
}
