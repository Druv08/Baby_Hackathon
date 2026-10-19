import { Sparkles } from "@/components/decor/Sparkles";
import styles from "./PageIntro.module.css";

/** Consistent page heading block for inner pages. */
export function PageIntro({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={styles.intro} aria-labelledby="page-title">
      <Sparkles />
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">
          <span aria-hidden="true">{icon}</span> {eyebrow}
        </p>
        <h1 id="page-title">{title}</h1>
        {children}
      </div>
    </section>
  );
}

/** An intentional "not built yet" card, with somewhere useful to go next. */
export function ComingSoon({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className={styles.soon}>
      <p className={styles.soonIcon} aria-hidden="true">
        {icon}
      </p>
      <h2 className={styles.soonTitle}>{title}</h2>
      {children}
    </div>
  );
}
