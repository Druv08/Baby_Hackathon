import Image from "next/image";
import { CharacterExpression } from "@/components/characters/CharacterExpression";
import { ReactivePortrait } from "@/components/characters/ReactivePortrait";

import { CHARACTER_THEMES } from "@/data/future-themes";
import type { FutureView } from "@/lib/future-view";
import type { CharacterProfile } from "@/types/future";
import { ProjectPlayground, ProjectThumbnail } from "./ProjectPlayground";
import styles from "./Portfolio.module.css";

/** Character sheet and playable creations, shown after a story's reveal. */
export function Portfolio({ view, profile }: { view: FutureView; profile: CharacterProfile }) {
  const { character } = view;
  const theme = CHARACTER_THEMES[view.slug];

  return (
    <>
      <section id="portfolio" className={`section ${styles.portfolio}`} data-world={view.slug} aria-labelledby="portfolio-title">
        <div className="container">
          <header className={styles.head}>
            <p className="eyebrow">
              <span aria-hidden="true">📖</span> {theme.label} Portfolio
            </p>
            <h2 id="portfolio-title">
              {character.name}’s {theme.journalTitle ?? "Journal"}
            </h2>
          </header>

          <div className={styles.journal}>
            <div className={styles.idCard}>
              <div className={styles.portrait}>
                <ReactivePortrait name={character.name}>
                <CharacterExpression
                  characterId={character.id}
                  alt={theme.portraitAlt}
                  width={1086}
                  height={1448}
                  sizes="(max-width: 900px) 70vw, 300px"
                />
                </ReactivePortrait>
              </div>
              <dl className={styles.facts}>
                <div>
                  <dt>Name</dt>
                  <dd>{character.name}</dd>
                </div>
                <div>
                  <dt>Species</dt>
                  <dd>{profile.species}</dd>
                </div>
                <div>
                  <dt>Profession</dt>
                  <dd>{profile.profession ?? character.profession}</dd>
                </div>
                <div>
                  <dt>Personality</dt>
                  <dd>{profile.personality.join(", ")}</dd>
                </div>
                <div>
                  <dt>Special talent</dt>
                  <dd>{profile.specialTalent}</dd>
                </div>
                <div>
                  <dt>Home</dt>
                  <dd>{profile.home}</dd>
                </div>
                <div>
                  <dt>Theme</dt>
                  <dd>{profile.theme}</dd>
                </div>
              </dl>
              {character.tagline && <p className={styles.tagline}>“{character.tagline}”</p>}
            </div>

            <div className={styles.pages}>
              <article className={styles.page}>
                <h3>About Me</h3>
                {profile.about.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </article>
              <article className={styles.page}>
                <h3>What I Do</h3>
                <p>{profile.whatIDo}</p>
              </article>
              <article className={styles.page}>
                <h3>My Strengths</h3>
                <ul className={styles.chips}>
                  {profile.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </article>
              <article className={styles.page}>
                <h3>My Journey</h3>
                <p>{profile.journey}</p>
              </article>
              <blockquote className={styles.motto}>
                <p>“{profile.motto}”</p>
                <footer>— My personal motto</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section id="creations" className={`section ${styles.creations}`} data-world={view.slug} aria-labelledby="creations-title">
        <div className="container">
          <header className={styles.head}>
            <p className="eyebrow">
              <span aria-hidden="true">{theme.creationsIcon ?? "🌷"}</span> My Creations
            </p>
            <h2 id="creations-title">Things I’ve made</h2>
            <p>Three little creations from {character.name}’s {theme.workshop ?? "workshop"}. Try them all!</p>
          </header>

          <ul className={styles.cards}>
            {view.portfolio.projects.map((p) => (
              <li key={p.id} className={styles.card}>
                <div className={styles.cardArt}>
                  {p.verifiedImage ? (
                    // `fill` + cover handles both 16:9 and 4:3 artwork without distortion.
                    <Image src={p.verifiedImage} alt="" fill sizes="(max-width: 900px) 94vw, 380px" />
                  ) : p.interactionId && p.playable ? (
                    <span className={styles.cardDrawn} aria-hidden="true">
                      <ProjectThumbnail interactionId={p.interactionId} />
                    </span>
                  ) : (
                    <span className={styles.cardFallback} aria-hidden="true">
                      📖
                    </span>
                  )}
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                {p.playable ? (
                  <a className="btn btn-primary" href={`#project-${p.id}`}>
                    Play {p.title} <span aria-hidden="true">↓</span>
                  </a>
                ) : (
                  <button type="button" className="btn" disabled>
                    <span aria-hidden="true">🛠️</span> In the works
                  </button>
                )}
              </li>
            ))}
          </ul>

          {view.portfolio.projects
            .filter((p) => p.playable && p.interactionId)
            .map((p) => (
              <article key={p.id} id={`project-${p.id}`} className={styles.playground} aria-labelledby={`project-${p.id}-title`}>
                <h3 id={`project-${p.id}-title`} className={styles.playTitle}>
                  {p.title}
                </h3>
                <p className={styles.playIntro}>{p.description}</p>
                <ProjectPlayground interactionId={p.interactionId!} />
              </article>
            ))}
        </div>
      </section>
    </>
  );
}
