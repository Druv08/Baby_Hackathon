import Link from "next/link";

import { NAV_LINKS } from "./nav-links";
import { VisitOdometer } from "./VisitOdometer";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.brand}>
          Maria<span aria-hidden="true"> 🐾</span>
        </p>
        <p className={styles.tagline}>Eight dreams, one heart.</p>
        <VisitOdometer />
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.small}>An original character made for haX.baby — Baby&apos;s First Website.</p>
      </div>
    </footer>
  );
}
