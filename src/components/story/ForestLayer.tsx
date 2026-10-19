import styles from "./ForestLayer.module.css";

// Fixed values keep server and client markup identical.
const LEAVES = [
  { left: 6, delay: 0, duration: 16, hue: "#7fb05a" },
  { left: 24, delay: 6, duration: 19, hue: "#a7c86a" },
  { left: 58, delay: 3, duration: 17, hue: "#6f9f4a" },
  { left: 84, delay: 9, duration: 21, hue: "#c2b45a" },
];
const PETALS = [
  { left: 14, delay: 2 },
  { left: 40, delay: 8 },
  { left: 70, delay: 5 },
  { left: 93, delay: 11 },
];
const FIREFLIES = [
  [9, 62, 0],
  [21, 38, 1.8],
  [34, 80, 3.2],
  [52, 28, 0.9],
  [66, 66, 2.4],
  [78, 44, 4.1],
  [90, 74, 1.4],
] as const;
const LANTERNS = [
  { left: 4, top: 30, delay: 0 },
  { left: 96, top: 46, delay: 1.3 },
  { left: 8, top: 84, delay: 2.6 },
];

/**
 * Whispering Forest atmosphere: drifting leaves, a few falling blossoms,
 * gentle fireflies and softly flickering lantern glows. Transform/opacity
 * only; hidden for reduced motion. The forest artwork itself never moves.
 */
export function ForestLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {LANTERNS.map((l) => (
        <span key={`l${l.left}-${l.top}`} className={styles.lantern} style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }} />
      ))}
      {LEAVES.map((l) => (
        <span
          key={`f${l.left}`}
          className={styles.leaf}
          style={{ left: `${l.left}%`, animationDelay: `${l.delay}s`, animationDuration: `${l.duration}s`, background: l.hue }}
        />
      ))}
      {PETALS.map((p) => (
        <span key={`p${p.left}`} className={styles.petal} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }} />
      ))}
      {FIREFLIES.map(([x, y, d]) => (
        <span key={`y${x}`} className={styles.firefly} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}
