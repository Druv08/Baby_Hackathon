import styles from "./SkyLayer.module.css";

// Fixed values keep server and client markup identical.
const CLOUDS = [
  { top: 8, width: 220, duration: 70, delay: -10 },
  { top: 26, width: 160, duration: 90, delay: -50 },
  { top: 52, width: 260, duration: 110, delay: -30 },
  { top: 74, width: 190, duration: 85, delay: -70 },
];
const STREAKS = [
  { top: 18, delay: 0 },
  { top: 44, delay: 4.5 },
  { top: 66, delay: 9 },
];
const PETALS = [
  { left: 12, delay: 0 },
  { left: 48, delay: 7 },
  { left: 82, delay: 13 },
];
const LANTERNS = [
  { left: 6, top: 38, delay: 0 },
  { left: 94, top: 62, delay: 1.6 },
  { left: 14, top: 86, delay: 3.1 },
];

/**
 * Floating-island atmosphere: slow drifting clouds, wind streaks, a few
 * falling petals and warm lantern glows. Transform/opacity animations only;
 * hidden for reduced motion.
 */
export function SkyLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {LANTERNS.map((l, i) => (
        <span key={`l${i}`} className={styles.lantern} style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }} />
      ))}
      {CLOUDS.map((c, i) => (
        <span
          key={`c${i}`}
          className={styles.cloud}
          style={{ top: `${c.top}%`, width: c.width, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        />
      ))}
      {STREAKS.map((s, i) => (
        <span key={`s${i}`} className={styles.streak} style={{ top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
      ))}
      {PETALS.map((p, i) => (
        <span key={`p${i}`} className={styles.petal} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}
