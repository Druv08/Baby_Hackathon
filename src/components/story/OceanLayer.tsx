import styles from "./OceanLayer.module.css";

// Fixed values keep server and client markup identical.
const RAYS = [
  { left: 18, delay: 0, width: 9 },
  { left: 42, delay: 2.5, width: 6 },
  { left: 68, delay: 1.2, width: 11 },
];
const BUBBLES = [
  { left: 6, size: 10, duration: 11, delay: 0 },
  { left: 15, size: 6, duration: 9, delay: 3 },
  { left: 27, size: 14, duration: 14, delay: 6 },
  { left: 39, size: 8, duration: 10, delay: 1.5 },
  { left: 53, size: 12, duration: 13, delay: 4.5 },
  { left: 64, size: 7, duration: 9.5, delay: 7 },
  { left: 76, size: 16, duration: 15, delay: 2 },
  { left: 87, size: 9, duration: 11, delay: 5.5 },
  { left: 95, size: 6, duration: 8.5, delay: 8 },
];
const JELLIES = [
  { left: 8, top: 30, duration: 26, delay: 0, scale: 1 },
  { left: 86, top: 55, duration: 32, delay: -12, scale: 0.75 },
];
const SPARKLES = [
  [12, 72, 0],
  [34, 18, 1.4],
  [58, 84, 2.6],
  [81, 26, 0.8],
  [93, 78, 3.3],
] as const;

/**
 * Underwater atmosphere: swaying light rays, rising bubbles, two drifting
 * jellyfish, a slow water shimmer and a few pearl sparkles. Transform and
 * opacity animations only; hidden for reduced motion.
 */
export function OceanLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <span className={styles.shimmer} />
      {RAYS.map((r) => (
        <span key={r.left} className={styles.ray} style={{ left: `${r.left}%`, width: `${r.width}%`, animationDelay: `${r.delay}s` }} />
      ))}
      {JELLIES.map((j) => (
        <svg
          key={j.left}
          viewBox="0 0 40 60"
          className={styles.jelly}
          style={{ left: `${j.left}%`, top: `${j.top}%`, animationDuration: `${j.duration}s`, animationDelay: `${j.delay}s`, scale: j.scale }}
        >
          <path d="M4 22 C4 6 36 6 36 22 Q30 26 20 25 Q10 26 4 22 Z" fill="rgba(255, 190, 235, 0.55)" stroke="rgba(255, 230, 250, 0.9)" strokeWidth="1.2" />
          {[10, 16, 22, 28].map((x) => (
            <path key={x} d={`M${x} 25 q-3 8 0 16 q3 8 0 16`} fill="none" stroke="rgba(255, 220, 245, 0.7)" strokeWidth="1.1" />
          ))}
        </svg>
      ))}
      {BUBBLES.map((b) => (
        <span
          key={b.left}
          className={styles.bubble}
          style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
        />
      ))}
      {SPARKLES.map(([x, y, d]) => (
        <span key={x} className={styles.sparkle} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}
