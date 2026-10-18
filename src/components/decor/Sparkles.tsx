import styles from "./Sparkles.module.css";

// Fixed positions keep server and client markup identical (no hydration drift).
const SPARKS = [
  { top: "8%", left: "6%", size: 14, delay: 0 },
  { top: "18%", left: "88%", size: 18, delay: 0.8 },
  { top: "62%", left: "4%", size: 12, delay: 1.6 },
  { top: "78%", left: "92%", size: 16, delay: 0.4 },
  { top: "40%", left: "48%", size: 10, delay: 2.2 },
  { top: "90%", left: "30%", size: 12, delay: 1.2 },
  { top: "5%", left: "60%", size: 10, delay: 2.8 },
];

/** Decorative twinkling stars. Hidden from assistive technology. */
export function Sparkles({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.layer} ${className}`} aria-hidden="true">
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className={styles.spark}
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}

/** A small floral divider between sections. */
export function FloralDivider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <span />✿ ❀ ✿<span />
    </div>
  );
}
