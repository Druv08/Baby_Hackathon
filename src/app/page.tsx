import Image from "next/image";
import { ReactivePortrait } from "@/components/characters/ReactivePortrait";

import { Sparkles } from "@/components/decor/Sparkles";
import { PawIcon } from "@/components/site/PawIcon";
import { FutureGrid } from "@/components/futures/FutureGrid";
import { WelcomeBack } from "@/components/progress/WelcomeBack";
import { CHARACTER_THEMES } from "@/data/future-themes";
import { getCharacterById } from "@/lib/content";
import styles from "./page.module.css";

export default function Home() {
  const maria = getCharacterById(1)!;

  return (
    <div className={styles.world}>
      <div className={styles.worldBackground} aria-hidden="true">
        <Image
          src="/heroes/maria-background.png"
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={65}
          sizes="100vw"
          className={styles.heroBackground}
        />
        <div className={styles.heroVeil} data-home-veil aria-hidden="true" />
      </div>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Sparkles />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.copy}>
            <p className="eyebrow">
              <PawIcon /> 01 — The Beginning
            </p>
            <h1 id="hero-title" className={styles.title}>
              Hi, I&apos;m Maria!
            </h1>
            <p className={styles.lead}>I&apos;m a little red panda with eight possible futures.</p>
            <p className={styles.sub}>
              I love flowers, stars, clouds, the ocean, building things, forest paths, music and
              moonlit memories… but I haven&apos;t decided what I want to become yet.
            </p>
            <p className={styles.question}>Which one will you explore?</p>
            <a href="#futures" className="btn btn-primary btn-large">
              Explore My Futures <span aria-hidden="true">→</span>
            </a>
            <WelcomeBack className={styles.welcome} />
          </div>

          <div className={styles.portraitWrap}>
            <div className={styles.portrait}>
              <ReactivePortrait name={maria.name}>
              <Image
                src={maria.characterImage}
                alt={CHARACTER_THEMES.normal.portraitAlt}
                width={1086}
                height={1448}
                priority
                fetchPriority="high"
                quality={60}
                sizes="(max-width: 480px) 68vw, (max-width: 800px) 320px, 420px"
              />
              </ReactivePortrait>
            </div>
            <p className={styles.sign} aria-hidden="true">
              A new journey begins…
            </p>
          </div>
        </div>
      </section>

      <section id="futures" className="section" aria-labelledby="futures-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <p className="eyebrow">
              <span aria-hidden="true">✨</span> Eight dreams, one heart
            </p>
            <h2 id="futures-title">Choose a future</h2>
            <p>
              Every future starts with the same little Maria. Visit them in any order — each one is a
              whole new adventure.
            </p>
          </header>
          <FutureGrid />
        </div>
      </section>
    </div>
  );
}
