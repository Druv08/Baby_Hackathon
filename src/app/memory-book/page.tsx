import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CHARACTER_THEMES } from "@/data/future-themes";
import { getCharacterById } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Memory Book",
  description: "Leave a little memory for Maria and read the lanterns her friends have lit.",
};

/** Decorative stars and petals; positions are fixed so server and client match. */
const STARS = Array.from({ length: 14 }, (_, i) => ({ left: (i * 41 + 7) % 97, top: (i * 17 + 5) % 48, delay: -(i * 0.7) }));
const PETALS = Array.from({ length: 8 }, (_, i) => ({ left: (i * 23 + 11) % 95, delay: -(i * 2.1), duration: 11 + (i % 4) * 2 }));

export default function MemoryBookPage() {
  const maria = getCharacterById(1)!;

  return (
    <div className={styles.page}>
      {/* ── A. Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="page-title">
        <Image src="/stories/luna/background.png" alt="" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroVeil} aria-hidden="true" />
        <div className={styles.sky} aria-hidden="true">
          {STARS.map((s, i) => (
            <span key={i} className={styles.star} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
          ))}
          {PETALS.map((p, i) => (
            <span key={i} className={styles.petal} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
          ))}
        </div>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">🏮</span> Little dreams &amp; memories
          </p>
          <h1 id="page-title" className={styles.title}>
            Memory Book
          </h1>
          <p className={styles.subtitle}>Every journey leaves a little memory behind.</p>
          <p className={styles.lead}>
            Every little dream, every friendship, and every wonderful moment deserves to be remembered. Leave a little
            message for Maria and become part of her story.
          </p>
          <div className={styles.actions}>
            <a href="#leave-memory" className="btn btn-primary btn-large">
              <span aria-hidden="true">🖋️</span> Leave a Memory
            </a>
            <a href="#read-memories" className={`btn btn-large ${styles.ghostLight}`}>
              <span aria-hidden="true">🏮</span> Read Memories
            </a>
          </div>
        </div>
      </section>

      {/* ── E. Maria's thank you ────────────────────────────────────── */}
      <section className={`section ${styles.thanks}`} aria-labelledby="thanks-title">
        <div className={`container ${styles.thanksInner}`}>
          <div className={styles.thanksArt}>
            <Image
              src={maria.characterImage}
              alt={CHARACTER_THEMES.normal.portraitAlt}
              width={1086}
              height={1448}
              sizes="(max-width: 700px) 60vw, 280px"
            />
          </div>
          <div className={styles.thanksCopy}>
            <h2 id="thanks-title">Thank you for being part of my story.</h2>
            <p>No matter which path I choose, I&apos;ll always remember the friends I made along the way.</p>
            <p className={styles.thanksGlow}>Every little memory makes my world a little brighter!</p>
            <Link href="/#futures" className="btn btn-primary">
              Return to My Futures <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
