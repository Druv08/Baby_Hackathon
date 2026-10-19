import styles from "./MoonlitLayer.module.css";

// Fixed values keep server and client markup identical.
const LANTERNS = [
  { left: 8, delay: 0, duration: 24 },
  { left: 26, delay: 9, duration: 28 },
  { left: 61, delay: 4, duration: 26 },
  { left: 83, delay: 13, duration: 30 },
];
const SPARKS = [
  [12, 70, 0],
  [30, 42, 2.1],
  [47, 82, 3.4],
  [69, 54, 1.2],
  [88, 76, 4.2],
] as const;
const STARS = [
  [14, 8, 0.4],
  [38, 14, 2.2],
  [57, 6, 1.1],
  [79, 18, 3.3],
  [93, 9, 0.8],
] as const;
const PETALS = [
  { left: 18, delay: 3 },
  { left: 72, delay: 11 },
];

/**
 * Moonlit memory village atmosphere: paper lanterns drifting up, slow golden
 * sparks, twinkling stars, a soft moonlight shimmer and a couple of falling
 * petals. Transform/opacity only; hidden for reduced motion.
 */
export function MoonlitLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <span className={styles.moonlight} />
      {STARS.map(([x, y, d]) => (
        <span key={`s${x}`} className={styles.star} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
      {LANTERNS.map((l) => (
        <span key={`l${l.left}`} className={styles.lantern} style={{ left: `${l.left}%`, animationDelay: `${l.delay}s`, animationDuration: `${l.duration}s` }} />
      ))}
      {SPARKS.map(([x, y, d]) => (
        <span key={`g${x}`} className={styles.spark} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
      {PETALS.map((p) => (
        <span key={`p${p.left}`} className={styles.petal} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}
