import { Gear } from "@/components/inventor/GearSvg";
import styles from "./WorkshopLayer.module.css";

// Fixed values keep server and client markup identical.
const GEARS = [
  { x: 3, y: 18, r: 46, teeth: 14, reverse: false, slow: true },
  { x: 97, y: 30, r: 58, teeth: 16, reverse: true, slow: true },
  { x: 95, y: 82, r: 34, teeth: 11, reverse: false, slow: false },
  { x: 5, y: 76, r: 30, teeth: 10, reverse: true, slow: false },
];
const DUST = [
  [8, 62, 0],
  [18, 30, 2.2],
  [31, 78, 4.1],
  [47, 22, 1.3],
  [62, 70, 3.4],
  [74, 36, 0.6],
  [86, 58, 2.8],
  [93, 14, 4.8],
] as const;
const SPARKS = [
  { x: 12, y: 44, delay: 3 },
  { x: 88, y: 50, delay: 9 },
];
const TWINKLES = [
  [22, 10, 0.4],
  [52, 6, 2],
  [78, 12, 1.1],
] as const;

/**
 * Workshop atmosphere: a few slowly turning gears at the edges, floating
 * magical dust, occasional mechanical sparks, gentle star twinkles and a
 * soft warm light that breathes. Transform/opacity only; hidden for reduced
 * motion. The background artwork itself never moves.
 */
export function WorkshopLayer() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <span className={styles.warmth} />
      <svg className={styles.gears} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {GEARS.map((g) => (
          <g key={`${g.x}-${g.y}`} transform={`translate(${g.x} ${g.y}) scale(0.1)`} opacity="0.35">
            <Gear cx={0} cy={0} r={g.r} teeth={g.teeth} spinning reverse={g.reverse} className={g.slow ? styles.slow : styles.fast} />
          </g>
        ))}
      </svg>
      {DUST.map(([x, y, d]) => (
        <span key={`d${x}`} className={styles.dust} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
      {SPARKS.map((s) => (
        <span key={`s${s.x}`} className={styles.spark} style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }}>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={{ "--a": `${i * 90 + 20}deg` } as React.CSSProperties} />
          ))}
        </span>
      ))}
      {TWINKLES.map(([x, y, d]) => (
        <span key={`t${x}`} className={styles.twinkle} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}
