import type { Metadata } from "next";
import { PawIcon } from "@/components/site/PawIcon";
import Image from "next/image";
import { ReactivePortrait } from "@/components/characters/ReactivePortrait";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FloralDivider, Sparkles } from "@/components/decor/Sparkles";
import { RecordFutureVisit } from "@/components/progress/RecordFutureVisit";
import { CHARACTER_THEMES, formNumber, themeStyle } from "@/data/future-themes";
import { getAllFutures, getFutureBySlug, storyHref } from "@/lib/content";
import { loadFutureView } from "@/lib/future-view";
import styles from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllFutures().map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const view = loadFutureView((await params).slug);
  if (!view) return {};
  return {
    title: `${view.character.name} — ${view.character.profession}`,
    description: view.character.tagline ?? `Explore Maria's future as the ${view.character.profession}.`,
  };
}

export default async function FuturePage({ params }: Params) {
  const view = loadFutureView((await params).slug);
  if (!view) notFound();

  const { character, story, portfolio } = view;
  const theme = CHARACTER_THEMES[view.slug];
  const enterHref = storyHref(view.slug);
  const pathTitle = getFutureBySlug(view.slug)?.storyIntro?.title;

  return (
    <div style={themeStyle(view.slug)}>
      <RecordFutureVisit futureId={view.id} />

      <section className={styles.hero} aria-labelledby="future-title">
        {view.heroImage && (
          // The hero artwork contains baked-in text, so it is only used as a
          // heavily blurred, decorative backdrop here.
          <Image src={view.heroImage} alt="" fill priority sizes="100vw" className={styles.backdrop} />
        )}
        <div className={styles.veil} />
        <Sparkles />

        <div className={`container ${styles.heroInner}`}>
          <div className={styles.panel}>
            <p className="eyebrow">
              <PawIcon slug={view.slug} /> {formNumber(view.id)} — {theme.label} Form
            </p>
            <h1 id="future-title" className={styles.title}>
              {character.profession}
            </h1>
            <p className={styles.name}>{character.name}</p>
            {character.tagline && (
              <blockquote className={styles.tagline}>
                <p>“{character.tagline}”</p>
              </blockquote>
            )}

            <div className={styles.actions}>
              {story.canEnter && enterHref ? (
                <Link href={enterHref} className="btn btn-primary btn-large">
                  Enter {pathTitle ?? "Story"} <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <div className={styles.comingSoon}>
                  <button type="button" className="btn btn-large" disabled aria-describedby="story-status">
                    <span aria-hidden="true">🔒</span> Story Coming Soon
                  </button>
                  <p id="story-status" className={styles.statusNote}>
                    Maria is still writing this chapter.
                  </p>
                </div>
              )}
              <a href="#creations" className="btn btn-secondary">
                Explore Creations <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div className={styles.portrait}>
            <ReactivePortrait name={character.name}>
            <Image
              src={character.characterImage}
              alt={theme.portraitAlt}
              width={1086}
              height={1448}
              priority
              sizes="(max-width: 860px) 70vw, 400px"
            />
            </ReactivePortrait>
          </div>
        </div>
      </section>

      <section id="creations" className="section" aria-labelledby="creations-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <p className="eyebrow">
              <span aria-hidden="true">📦</span> {theme.label} Creations
            </p>
            <h2 id="creations-title">What {character.name} is making</h2>
            {!view.readiness.portfolioReady && (
              <p>These projects are still in Maria&apos;s workshop. Check back soon to try them!</p>
            )}
          </header>

          {portfolio.projects.length > 0 ? (
            <ul className={styles.projects}>
              {portfolio.projects.map((project) => (
                <li key={project.id} className={styles.project}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  {project.description && <p>{project.description}</p>}
                  {project.playable && enterHref ? (
                    <Link href={`${enterHref}#project-${project.id}`} className="btn btn-primary">
                      Play {project.title} <span aria-hidden="true">→</span>
                    </Link>
                  ) : project.playable ? (
                    <span className="badge">Ready to play</span>
                  ) : (
                    <span className="badge">
                      <span aria-hidden="true">🛠️</span> In the works
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              <span aria-hidden="true">{theme.icon} </span>
              {character.name}&apos;s creations are still being imagined.
            </p>
          )}
        </div>
      </section>

      {view.heroImage && (
        <section className="section" aria-labelledby="world-title">
          <div className="container">
            <header className={styles.sectionHead}>
              <h2 id="world-title">A peek into the {theme.label} world</h2>
              <p>An early design sketch of {character.name}&apos;s page.</p>
            </header>
            <figure className={styles.postcard}>
              <Image
                src={view.heroImage}
                alt={`Design preview of the ${theme.label} page: ${theme.portraitAlt}`}
                width={1672}
                height={941}
                sizes="(max-width: 1100px) 94vw, 1000px"
              />
              <figcaption>Concept artwork · {character.profession}</figcaption>
            </figure>
          </div>
        </section>
      )}

      <FloralDivider />

      <nav className={`container ${styles.return}`} aria-label="Futures">
        <Link href="/#futures" className="btn btn-secondary btn-large">
          <span aria-hidden="true">←</span> Return to Eight Futures
        </Link>
      </nav>
    </div>
  );
}
