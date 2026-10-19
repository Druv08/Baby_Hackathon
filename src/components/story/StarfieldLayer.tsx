import styles from "./StarfieldLayer.module.css";

// Fixed values keep server and client markup identical.
const TWINKLES = [
  [6, 12, 0], [18, 34, 1.4], [27, 8, 2.6], [41, 22, 0.7], [55, 14, 3.1], [63, 40, 1.9],
  [74, 9, 0.3], [83, 28, 2.2], [92, 16, 1.1], [12, 58, 2.9], [36, 66, 0.9], [88, 62, 1.7],
] as const;
const SHOOTING = [
  { top: 10, left: 70, delay: 2 },
  { top: 22, left: 40, delay: 9 },
  { top: 6, left: 88, delay: 16 },
];

/**
 * Twinkling stars and the occasional shooting star over the observatory
 * world. Transform/opacity animations only; hidden for reduced motion.
 */
export function StarfieldLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {TWINKLES.map(([x, y, d], i) => (
        <span key={i} className={styles.twinkle} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
      {SHOOTING.map((s, i) => (
        <span key={`s${i}`} className={styles.shooting} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
      ))}
    </div>
  );
}
