import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/site/PageIntro";
import { CHARACTER_THEMES, themeStyle } from "@/data/future-themes";
import { getAllFutures, getCharacterById, isProjectPlayable } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "My Creations" };

export default function CreationsPage() {
  return (
    <>
      <PageIntro icon="📦" eyebrow="Maria's workshop" title="My Creations">
        <p>
          Every future Maria makes something special. These creations are still being built — here&apos;s a
          sneak peek at what&apos;s coming.
        </p>
      </PageIntro>
      <section className="section" aria-label="Creations by future">
        <div className={`container ${styles.list}`}>
          {getAllFutures().map((future) => {
            const theme = CHARACTER_THEMES[future.slug];
            const character = getCharacterById(future.characterId);
            return (
              <article key={future.slug} className={styles.group} style={themeStyle(future.slug)}>
                <h2 className={styles.groupTitle}>
                  <span aria-hidden="true">{theme.icon} </span>
                  {character?.name}
                </h2>
                {future.projects.length > 0 ? (
                  <ul className={styles.projects}>
                    {future.projects.map((p) => (
                      <li key={p.id}>
                        <strong>{p.title}</strong>{" "}
                        <span className="badge">{isProjectPlayable(p) ? "Ready to play" : "In the works"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Still being imagined.</p>
                )}
                <Link href={`/futures/${future.slug}#creations`} className={styles.more}>
                  Visit {theme.label} <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
