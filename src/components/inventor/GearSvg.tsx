/** Path for a toothed gear centred on (0, 0). */
export function gearPath(teeth: number, outer: number, inner: number): string {
  const steps = teeth * 4;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = i % 4 < 2 ? outer : inner;
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** A brass gear with a hub, drawn at (cx, cy). Spins when `spinning`. */
export function Gear({
  cx,
  cy,
  r,
  teeth,
  spinning = false,
  reverse = false,
  className,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  spinning?: boolean;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className={className} data-spinning={spinning} data-reverse={reverse}>
        <path d={gearPath(teeth, r, r * 0.82)} fill="#d9a441" stroke="#8a5a1c" strokeWidth={r * 0.06} strokeLinejoin="round" />
        <circle r={r * 0.55} fill="#e9bd5c" stroke="#8a5a1c" strokeWidth={r * 0.05} />
        <circle r={r * 0.18} fill="#8a5a1c" />
        {[0, 60, 120].map((a) => (
          <rect key={a} x={-r * 0.05} y={-r * 0.5} width={r * 0.1} height={r} fill="#b47f2c" transform={`rotate(${a})`} />
        ))}
      </g>
    </g>
  );
}
