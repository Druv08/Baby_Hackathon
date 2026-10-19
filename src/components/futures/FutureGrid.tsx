import Image from "next/image";
import Link from "next/link";

import { CHARACTER_THEMES, formNumber, themeStyle } from "@/data/future-themes";
import { getAllFutures, getCharacterById } from "@/lib/content";
import styles from "./FutureGrid.module.css";

/** The eight selectable futures, each linking to its own page. */
export function FutureGrid({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className={styles.grid}>
      {getAllFutures().map((future) => {
        const character = getCharacterById(future.characterId);
        if (!character) return null;
        const theme = CHARACTER_THEMES[future.slug];
        return (
          <li key={future.slug} style={themeStyle(future.slug)}>
            <Link href={`/futures/${future.slug}`} className={styles.card} data-future-card={future.slug}>
              <div className={styles.portrait}>
                <Image
                  src={character.characterImage}
                  alt={theme.portraitAlt}
                  width={1086}
                  height={1448}
                  sizes="(max-width: 600px) 45vw, (max-width: 1100px) 30vw, 260px"
                />
                <span className={styles.number} aria-hidden="true">
                  {formNumber(future.id)}
                </span>
              </div>
              <div className={styles.body}>
                <Heading className={styles.name}>
                  <span aria-hidden="true">{theme.icon} </span>
                  {theme.label}
                </Heading>
                <p className={styles.profession}>{character.profession}</p>
                <span className={styles.cta} aria-hidden="true">
                  Visit →
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
