import styles from "./PetalLayer.module.css";

// Fixed values keep server and client markup identical.
const PETALS = [
  { left: 4, delay: 0, dur: 16, size: 12 },
  { left: 14, delay: 6, dur: 19, size: 9 },
  { left: 27, delay: 3, dur: 17, size: 14 },
  { left: 39, delay: 9, dur: 21, size: 10 },
  { left: 52, delay: 1, dur: 18, size: 12 },
  { left: 63, delay: 11, dur: 20, size: 9 },
  { left: 75, delay: 4, dur: 16, size: 13 },
  { left: 86, delay: 8, dur: 22, size: 10 },
  { left: 95, delay: 13, dur: 18, size: 11 },
];

/**
 * Cherry-blossom petals drifting down the story world. Fixed to the
 * viewport and animated with transforms only; hidden from assistive tech
 * and frozen for reduced-motion visitors.
 */
export function PetalLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.8,
            animationDelay: `${-p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
